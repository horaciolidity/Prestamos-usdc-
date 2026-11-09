// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OptimismLendingPool
 * @author Optimism Lending Protocol
 * @notice Production-ready decentralized USDC lending pool on Optimism Mainnet.
 * Features:
 *  - 15% configurable collateral deposit
 *  - 15% configurable protocol commission
 *  - Automated collateral refund on full repayment
 *  - Strict ReentrancyGuard and Ownable access control
 *  - Pausable emergency circuit breaker
 *  - Official Circle USDC on Optimism (0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85)
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Invalid owner");
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Caller is not owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

abstract contract Pausable is Context {
    event Paused(address account);
    event Unpaused(address account);

    bool private _paused;

    constructor() {
        _paused = false;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused(), "Pausable: not paused");
        _;
    }

    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract OptimismLendingPool is Ownable, Pausable, ReentrancyGuard {
    // Official Circle Native USDC on Optimism Mainnet
    IERC20 public immutable usdcToken;

    // Basis points (10000 = 100%)
    uint256 public commissionBps = 1500; // 15%
    uint256 public collateralBps = 1500; // 15%
    uint256 public constant BPS_DIVISOR = 10000;

    // Loan limits (in USDC 6 decimals)
    uint256 public minLoanAmount = 50 * 1e6;   // 50 USDC
    uint256 public maxLoanAmount = 5000 * 1e6; // 5000 USDC

    // Grace period before default liquidation (in seconds)
    uint256 public gracePeriod = 5 days;

    struct LoanRecord {
        uint256 id;
        address borrower;
        uint256 principal;
        uint256 commission;
        uint256 collateral;
        uint256 issuedAt;
        uint256 expiresAt;
        bool isRepaid;
        bool isDefaulted;
        bool collateralRefunded;
    }

    uint256 public loanCounter;
    mapping(uint256 => LoanRecord) public loans;
    mapping(address => uint256[]) public borrowerLoanIds;

    // Total accounting
    uint256 public totalLiquiditySupplied;
    uint256 public totalActiveLent;
    uint256 public totalCollateralLocked;
    uint256 public totalCommissionCollected;

    // Events
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LiquidityWithdrawn(address indexed to, uint256 amount);
    event LoanIssued(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 commission,
        uint256 collateral,
        uint256 expiresAt
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 repaymentAmount);
    event CollateralRefunded(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower, uint256 collateralLiquidated);
    event CommissionWithdrawn(address indexed receiver, uint256 amount);
    event ProtocolConfigUpdated(uint256 commissionBps, uint256 collateralBps, uint256 minAmount, uint256 maxAmount);

    constructor(address _usdcToken) Ownable(msg.sender) {
        require(_usdcToken != address(0), "Invalid token address");
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @notice Deposit USDC liquidity into lending pool
     */
    function addLiquidity(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        totalLiquiditySupplied += amount;
        emit LiquidityAdded(msg.sender, amount);
    }

    /**
     * @notice Withdraw excess liquidity by protocol owner
     */
    function withdrawLiquidity(uint256 amount, address to) external onlyOwner nonReentrant {
        require(amount <= getAvailableLiquidity(), "Exceeds available liquidity");
        require(to != address(0), "Invalid recipient");
        totalLiquiditySupplied -= amount;
        require(usdcToken.transfer(to, amount), "USDC transfer failed");
        emit LiquidityWithdrawn(to, amount);
    }

    /**
     * @notice Issue a USDC loan with collateral deposit and commission deduction.
     * @param principal Principal amount requested (in 6 decimals)
     * @param durationSeconds Repayment duration in seconds
     */
    function requestLoan(uint256 principal, uint256 durationSeconds) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 loanId) 
    {
        require(principal >= minLoanAmount, "Below minimum loan amount");
        require(principal <= maxLoanAmount, "Exceeds maximum loan amount");
        require(durationSeconds >= 15 days && durationSeconds <= 60 days, "Invalid duration");
        require(getAvailableLiquidity() >= principal, "Insufficient pool liquidity");

        uint256 requiredCollateral = (principal * collateralBps) / BPS_DIVISOR;
        uint256 commission = (principal * commissionBps) / BPS_DIVISOR;
        uint256 netDisbursed = principal - commission;

        // Collect collateral from borrower
        require(
            usdcToken.transferFrom(msg.sender, address(this), requiredCollateral),
            "Collateral deposit failed"
        );

        // Record loan
        loanCounter++;
        loanId = loanCounter;

        loans[loanId] = LoanRecord({
            id: loanId,
            borrower: msg.sender,
            principal: principal,
            commission: commission,
            collateral: requiredCollateral,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + durationSeconds,
            isRepaid: false,
            isDefaulted: false,
            collateralRefunded: false
        });

        borrowerLoanIds[msg.sender].push(loanId);

        // Update state
        totalActiveLent += principal;
        totalCollateralLocked += requiredCollateral;
        totalCommissionCollected += commission;

        // Disburse net USDC to borrower
        require(usdcToken.transfer(msg.sender, netDisbursed), "Disbursement transfer failed");

        emit LoanIssued(loanId, msg.sender, principal, commission, requiredCollateral, block.timestamp + durationSeconds);
    }

    /**
     * @notice Repay loan principal in full and automatically release collateral back to borrower
     * @param loanId ID of the active loan
     */
    function repayLoan(uint256 loanId) external nonReentrant {
        LoanRecord storage loan = loans[loanId];
        require(loan.id != 0, "Loan does not exist");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(!loan.isRepaid, "Loan already repaid");
        require(!loan.isDefaulted, "Loan already defaulted");

        // Borrower pays back full principal
        require(
            usdcToken.transferFrom(msg.sender, address(this), loan.principal),
            "Principal repayment transfer failed"
        );

        loan.isRepaid = true;
        totalActiveLent -= loan.principal;

        emit LoanRepaid(loanId, msg.sender, loan.principal);

        // Automatically refund collateral
        loan.collateralRefunded = true;
        totalCollateralLocked -= loan.collateral;
        require(usdcToken.transfer(loan.borrower, loan.collateral), "Collateral refund transfer failed");

        emit CollateralRefunded(loanId, loan.borrower, loan.collateral);
    }

    /**
     * @notice Liquidate default if loan is past expiry + grace period
     */
    function handleDefault(uint256 loanId) external onlyOwner nonReentrant {
        LoanRecord storage loan = loans[loanId];
        require(loan.id != 0, "Loan does not exist");
        require(!loan.isRepaid, "Loan is already repaid");
        require(!loan.isDefaulted, "Loan already defaulted");
        require(block.timestamp > loan.expiresAt + gracePeriod, "Grace period has not expired");

        loan.isDefaulted = true;
        totalActiveLent -= loan.principal;
        totalCollateralLocked -= loan.collateral;

        emit LoanDefaulted(loanId, loan.borrower, loan.collateral);
    }

    /**
     * @notice Admin configuration update
     */
    function updateConfig(
        uint256 _commissionBps,
        uint256 _collateralBps,
        uint256 _minLoanAmount,
        uint256 _maxLoanAmount
    ) external onlyOwner {
        require(_commissionBps <= 3000, "Max commission 30%");
        require(_collateralBps <= 5000, "Max collateral 50%");
        require(_minLoanAmount < _maxLoanAmount, "Min must be < Max");

        commissionBps = _commissionBps;
        collateralBps = _collateralBps;
        minLoanAmount = _minLoanAmount;
        maxLoanAmount = _maxLoanAmount;

        emit ProtocolConfigUpdated(_commissionBps, _collateralBps, _minLoanAmount, _maxLoanAmount);
    }

    /**
     * @notice Emergency Pause switch
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Available idle USDC in the contract
     */
    function getAvailableLiquidity() public view returns (uint256) {
        uint256 contractBalance = usdcToken.balanceOf(address(this));
        if (contractBalance <= totalCollateralLocked) {
            return 0;
        }
        return contractBalance - totalCollateralLocked;
    }

    /**
     * @notice Get all loan IDs for a borrower
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoanIds[borrower];
    }
}
