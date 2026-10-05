import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  X,
  CheckCircle,
  PlusCircle,
  Check,
  CreditCard,
  ArrowRight,
  Calculator,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Database,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import {
  LoanCalculationService,
  LOAN_PRODUCTS,
  TENURE_UNITS,
  REPAYMENT_FREQUENCIES,
  INTEREST_METHODS,
  TENURE_UNIT_LABELS,
  REPAYMENT_FREQUENCY_LABELS,
  INTEREST_METHOD_LABELS
} from '../services/loanCalculationService.js'

export default function DashboardModals() {
  const {
    activeModal,
    setActiveModal,
    selectedApplication,
    setSelectedApplication,
    selectedLoan,
    approveApplication,
    rejectApplication,
    addNewApplication,
    addNewCustomer,
    recordNewPayment,
    recentPayments,
    pendingApprovals,
    loans,
    customers,
    loanProducts,
    prefilledPaymentFreq,
    formatINR,
    resetToFreshBlankState,
    resetToDemoState,
    hardWipeAllStorage
  } = useDashboard()

  const defaultLoan = loans.find((l) => l.status === 'Active') || loans[0]

  // Dedicated Record Payment Form State
  const [paymentForm, setPaymentForm] = useState(() => ({
    loanId: defaultLoan ? defaultLoan.id : 'LN90281',
    borrower: defaultLoan ? defaultLoan.borrowerName : 'Sunita Sharma',
    amount: defaultLoan ? String(defaultLoan.emi || 100) : '100',
    mode: 'CASH',
    frequency: prefilledPaymentFreq || 'daily',
    notes: ''
  }))

  // Auto-sync paymentForm with selectedLoan or prefilledPaymentFreq when record-payment opens
  useEffect(() => {
    if (activeModal === 'record-payment') {
      let targetLoan = null

      if (selectedLoan && selectedLoan.status === 'Active') {
        targetLoan = selectedLoan
      } else if (prefilledPaymentFreq) {
        targetLoan = loans.find(
          (l) => l.status === 'Active' && l.frequency?.toLowerCase().includes(prefilledPaymentFreq.toLowerCase())
        )
      }

      if (!targetLoan) {
        targetLoan = loans.find((l) => l.status === 'Active') || loans[0]
      }

      if (targetLoan) {
        const rawF = (targetLoan.frequency || prefilledPaymentFreq || 'daily').toLowerCase()
        const normalizedFreq = rawF.includes('week') ? 'weekly' : rawF.includes('month') ? 'monthly' : 'daily'
        setPaymentForm({
          loanId: targetLoan.id,
          borrower: targetLoan.borrowerName,
          amount: String(targetLoan.emi || 100),
          mode: 'CASH',
          frequency: normalizedFreq,
          notes: ''
        })
      }
    }
  }, [activeModal, prefilledPaymentFreq, selectedLoan, loans])

  // Active Live Loan Products (dynamically reactive to Loan Products View)
  const activeProducts = useMemo(() => {
    if (loanProducts && Array.isArray(loanProducts) && loanProducts.length > 0) {
      const activeOnly = loanProducts.filter((p) => p.status !== 'Deactivated')
      return activeOnly.length > 0 ? activeOnly : loanProducts
    }
    return Object.values(LOAN_PRODUCTS)
  }, [loanProducts])

  // New Application Form State with Full Dependency Chain & Normalization
  const [appForm, setAppForm] = useState(() => {
    const firstP = (loanProducts && loanProducts.find((p) => p.status !== 'Deactivated')) || null
    const firstConfig = firstP
      ? LoanCalculationService.parseProductConfig(firstP)
      : LoanCalculationService.getProductConfig('Daily Micro Business Loan')

    return {
      customerName: '',
      customerId: '',
      loanProduct: firstConfig.name,
      amount: '50000',
      tenureValue: String(firstConfig.defaultTenureValue || 3),
      tenureUnit: firstConfig.defaultTenureUnit || TENURE_UNITS.MONTHS,
      frequency: firstConfig.defaultFrequency || REPAYMENT_FREQUENCIES.DAILY,
      annualRate: String(firstConfig.annualRate || 12),
      interestMethod: firstConfig.interestMethod || INTEREST_METHODS.REDUCING_BALANCE,
      insurancePercentage: String(firstConfig.insurancePercentage !== undefined ? firstConfig.insurancePercentage : '1.5'),
      startDate: new Date().toISOString().split('T')[0],
      purpose: 'Working Capital / Inventory',
      purposeDetails: ''
    }
  })

  // Current active product configuration dynamically parsed
  const currentProductConfig = useMemo(() => {
    return LoanCalculationService.getProductConfig(appForm.loanProduct, activeProducts)
  }, [appForm.loanProduct, activeProducts])

  // Handler for product switch - automatically loads product defaults while respecting dependencies
  const handleProductChange = useCallback((prodName) => {
    const config = LoanCalculationService.getProductConfig(prodName, activeProducts)
    setAppForm((prev) => {
      const newUnit = config.allowedUnits?.includes(prev.tenureUnit)
        ? prev.tenureUnit
        : config.defaultTenureUnit
      const newFreq = config.allowedFrequencies?.includes(prev.frequency)
        ? prev.frequency
        : config.defaultFrequency
      const newTenure = config.defaultTenureValue || prev.tenureValue

      return {
        ...prev,
        loanProduct: config.name,
        tenureValue: String(newTenure),
        tenureUnit: newUnit,
        frequency: newFreq,
        annualRate: String(config.annualRate),
        interestMethod: config.interestMethod,
        insurancePercentage: String(config.insurancePercentage !== undefined ? config.insurancePercentage : prev.insurancePercentage || '1.5')
      }
    })
  }, [activeProducts])

  // Auto-sync form if current selected product was deleted or renamed in Loan Products
  useEffect(() => {
    if (activeModal === 'new-application' && activeProducts.length > 0) {
      const exists = activeProducts.some(
        (p) => p.name === appForm.loanProduct || p.id === appForm.loanProduct
      )
      if (!exists) {
        handleProductChange(activeProducts[0].name)
      }
    }
  }, [activeModal, activeProducts, appForm.loanProduct, handleProductChange])

  // Live Repayment Schedule Preview Expansion
  const [showSchedulePreview, setShowSchedulePreview] = useState(false)
  const [reviewScheduleOpen, setReviewScheduleOpen] = useState(false)

  // Live Validation
  const loanValidation = useMemo(() => {
    return LoanCalculationService.validateLoanConfiguration({
      productName: appForm.loanProduct,
      productConfig: currentProductConfig,
      liveProducts: activeProducts,
      amount: appForm.amount,
      tenureValue: appForm.tenureValue,
      tenureUnit: appForm.tenureUnit,
      frequency: appForm.frequency,
      annualRate: appForm.annualRate,
      startDate: appForm.startDate,
      insurancePercentage: appForm.insurancePercentage
    })
  }, [
    appForm.loanProduct,
    currentProductConfig,
    activeProducts,
    appForm.amount,
    appForm.tenureValue,
    appForm.tenureUnit,
    appForm.frequency,
    appForm.annualRate,
    appForm.insurancePercentage,
    appForm.startDate
  ])

  // Live Loan EMI calculation and full schedule preview
  const calculatedLoan = useMemo(() => {
    if (!loanValidation.isValid) {
      return null
    }

    const prod = currentProductConfig || LoanCalculationService.getProductConfig(appForm.loanProduct, activeProducts)
    const scheduleData = LoanCalculationService.generateRepaymentSchedule({
      principal: Number(appForm.amount),
      annualRate: Number(appForm.annualRate) || prod.annualRate,
      interestMethod: appForm.interestMethod || prod.interestMethod,
      startDate: appForm.startDate ? new Date(appForm.startDate) : new Date(),
      tenureValue: Number(appForm.tenureValue),
      tenureUnit: appForm.tenureUnit,
      frequency: appForm.frequency
    })

    const processingFee = Math.round((scheduleData.principal * (prod.processingFeePct || 0)) / 100)
    const insurancePct = Math.max(0, Number(appForm.insurancePercentage) || 0)
    const insuranceFee = Math.round((scheduleData.principal * insurancePct) / 100)

    return {
      ...scheduleData,
      processingFee,
      insurancePercentage: insurancePct,
      insuranceFee,
      interestRateDisplay: `${scheduleData.annualRate}% p.a.`,
      perInstallmentLabel: `${REPAYMENT_FREQUENCY_LABELS[scheduleData.frequency]} EMI`,
      freqSuffix:
        scheduleData.frequency === REPAYMENT_FREQUENCIES.DAILY
          ? 'day'
          : scheduleData.frequency === REPAYMENT_FREQUENCIES.WEEKLY
          ? 'wk'
          : scheduleData.frequency === REPAYMENT_FREQUENCIES.BI_WEEKLY
          ? 'fn'
          : scheduleData.frequency === REPAYMENT_FREQUENCIES.QUARTERLY
          ? 'qtr'
          : 'mo'
    }
  }, [appForm, loanValidation, currentProductConfig, activeProducts])

  // Add New Customer Form State (All Base44 LMS fields)
  const [newCustForm, setNewCustForm] = useState({
    // Personal Information
    fullName: '',
    fatherName: '',
    husbandName: '',
    wifeName: '',
    careOf: '',
    dob: '',
    gender: '',
    occupation: '',

    // Contact Information
    primaryMobile: '',
    secondaryMobile: '',
    email: '',

    // KYC Documents
    aadhaarNumber: '',
    panNumber: '',

    // Upload Documents
    customerPhoto: null,
    panCardImage: null,
    aadhaarFront: null,
    aadhaarBack: null,
    bankCheque: null,

    // Current Address
    addressLine: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    monthlyIncome: ''
  })

  // Quick search in tables
  const [modalSearch, setModalSearch] = useState('')
  const [modalModeFilter, setModalModeFilter] = useState('ALL')

  if (!activeModal) return null

  const handleClose = () => {
    setActiveModal(null)
    setModalSearch('')
    setShowSchedulePreview(false)
    setReviewScheduleOpen(false)
  }

  const handleAppSubmit = (e) => {
    e.preventDefault()
    if (!appForm.customerName) {
      alert('Please select a customer')
      return
    }
    if (!loanValidation.isValid) {
      alert(`Please resolve configuration errors:\n• ${loanValidation.errors.join('\n• ')}`)
      return
    }
    if (!calculatedLoan) {
      alert('Unable to calculate repayment schedule. Please review configuration.')
      return
    }

    const selectedCust = customers?.find((c) => c.name === appForm.customerName)

    addNewApplication({
      customerName: appForm.customerName,
      phone: selectedCust?.phone || '+91 98765 00000',
      center: selectedCust?.center || 'Center #14 (Pragati)',
      loanProduct: appForm.loanProduct,
      amount: calculatedLoan.principal,
      tenureValue: calculatedLoan.tenureValue,
      tenureUnit: calculatedLoan.tenureUnit,
      frequency: calculatedLoan.frequency,
      annualRate: calculatedLoan.annualRate,
      interestMethod: calculatedLoan.interestMethod,
      insurancePercentage: calculatedLoan.insurancePercentage,
      insuranceFee: calculatedLoan.insuranceFee,
      processingFee: calculatedLoan.processingFee,
      startDate: appForm.startDate,
      purpose: appForm.purpose || 'Working Capital',
      purposeDetails: appForm.purposeDetails
    })
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    recordNewPayment(paymentForm)
  }

  const handleCustomerSubmit = (e) => {
    e.preventDefault()
    if (!newCustForm.fullName.trim()) {
      alert('Please enter customer full name')
      return
    }
    if (!newCustForm.primaryMobile.trim()) {
      alert('Please enter primary mobile number')
      return
    }
    addNewCustomer(newCustForm)
    setNewCustForm({
      fullName: '',
      fatherName: '',
      husbandName: '',
      wifeName: '',
      careOf: '',
      dob: '',
      gender: '',
      occupation: '',
      primaryMobile: '',
      secondaryMobile: '',
      email: '',
      aadhaarNumber: '',
      panNumber: '',
      customerPhoto: null,
      panCardImage: null,
      aadhaarFront: null,
      aadhaarBack: null,
      bankCheque: null,
      addressLine: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      monthlyIncome: ''
    })
  }

  const handleSelectLoanForPayment = (loanId) => {
    const selected = loans.find((l) => l.id === loanId)
    if (selected) {
      const rawF = (selected.frequency || 'daily').toLowerCase()
      const normalizedFreq = rawF.includes('week') ? 'weekly' : rawF.includes('month') ? 'monthly' : 'daily'
      setPaymentForm((prev) => ({
        ...prev,
        loanId: selected.id,
        borrower: selected.borrowerName,
        amount: String(selected.emi || 100),
        frequency: normalizedFreq
      }))
    }
  }

  const handleSelectFrequencyForPayment = (newFreq) => {
    const matchingLoan = loans.find(
      (l) => l.status === 'Active' && l.frequency?.toLowerCase().includes(newFreq.toLowerCase())
    )
    if (matchingLoan) {
      setPaymentForm((prev) => ({
        ...prev,
        frequency: newFreq,
        loanId: matchingLoan.id,
        borrower: matchingLoan.borrowerName,
        amount: String(matchingLoan.emi || prev.amount)
      }))
    } else {
      setPaymentForm((prev) => ({
        ...prev,
        frequency: newFreq
      }))
    }
  }

  const selectedLoanObj = loans.find((l) => l.id === paymentForm.loanId)
  const currentLoanOutstanding = selectedLoanObj ? selectedLoanObj.outstanding : 14800
  const afterPaymentBalance = Math.max(0, currentLoanOutstanding - (Number(paymentForm.amount) || 0))

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className={`modal-panel ${
          activeModal === 'new-application'
            ? `modal-panel-dark-app ${showSchedulePreview ? 'wide-modal' : ''}`
            : activeModal === 'new-customer'
            ? 'modal-panel-dark-cust'
            : activeModal === 'review-app' && reviewScheduleOpen
            ? 'modal-panel-dark-app wide-modal'
            : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===============================================================
            MODAL: RECORD PAYMENT (LIVE REACTIVE)
            =============================================================== */}
        {activeModal === 'record-payment' && (
          <div className="modal-inner">
            <div className="modal-header">
              <div className="modal-title-with-badge">
                <div className="modal-icon-badge icon-emerald">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Record Payment Collection</h3>
                  <p className="modal-subtitle">
                    Instantly updates Today's Collection, Collection Tracker, Trend chart, and reduces loan balance.
                  </p>
                </div>
              </div>
              <button type="button" className="btn-close-modal" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="modal-form">
              {/* Select Loan / Borrower */}
              <div className="form-field">
                <label className="form-label">
                  Select Active Borrower / Loan <span className="text-required">*</span>
                </label>
                <select
                  className="form-select"
                  value={paymentForm.loanId}
                  onChange={(e) => handleSelectLoanForPayment(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    -- Select Borrower --
                  </option>
                  {loans
                    .filter((l) => l.status === 'Active')
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        [{l.frequency?.toUpperCase()}] {l.borrowerName} • {l.id} ({l.center}) — Due EMI: {formatINR(l.emi)} (Balance: {formatINR(l.outstanding)})
                      </option>
                    ))}
                </select>
              </div>

              {/* Payment Amount and Quick Presets */}
              <div className="form-field">
                <div className="form-label-with-hint">
                  <label className="form-label">
                    Collection Amount (₹) <span className="text-required">*</span>
                  </label>
                  {selectedLoanObj && (
                    <span className="form-label-hint">
                      Scheduled [{selectedLoanObj.frequency}] EMI: <strong>{formatINR(selectedLoanObj.emi)}</strong>
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="form-input font-bold text-lg"
                  placeholder="e.g. 100"
                />

                {/* Quick Amount Chips */}
                <div className="amount-chips-row">
                  {[50, 100, 200, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`chip-button ${paymentForm.amount === String(preset) ? 'active' : ''}`}
                      onClick={() => setPaymentForm({ ...paymentForm, amount: String(preset) })}
                    >
                      ₹{preset}
                    </button>
                  ))}
                  {selectedLoanObj && (
                    <button
                      type="button"
                      className={`chip-button chip-emi ${paymentForm.amount === String(selectedLoanObj.emi) ? 'active' : ''}`}
                      onClick={() => setPaymentForm({ ...paymentForm, amount: String(selectedLoanObj.emi) })}
                    >
                      Exact EMI (₹{selectedLoanObj.emi})
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode & Tracker Frequency */}
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Payment Mode</label>
                  <select
                    className="form-select"
                    value={paymentForm.mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
                  >
                    <option value="CASH">CASH (Physical Deposit)</option>
                    <option value="UPI">UPI (BHIM / PhonePe / GPay)</option>
                    <option value="NEFT">NEFT / Bank Transfer</option>
                    <option value="CHEQUE">Cheque Deposit</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="form-label">Collection Tracker Bucket</label>
                  <select
                    className="form-select"
                    value={paymentForm.frequency}
                    onChange={(e) => handleSelectFrequencyForPayment(e.target.value)}
                  >
                    <option value="daily">Daily Loans Tracker</option>
                    <option value="weekly">Weekly Loans Tracker</option>
                    <option value="monthly">Monthly Loans Tracker</option>
                  </select>
                </div>
              </div>

              {/* Live Impact Preview Card */}
              <div className="live-impact-card">
                <div className="impact-header">
                  <span className="impact-tag">⚡ LIVE SYSTEM IMPACT</span>
                </div>
                <div className="impact-grid">
                  <div className="impact-stat">
                    <span className="impact-label">Loan Balance</span>
                    <span className="impact-value">
                      {formatINR(currentLoanOutstanding)} <ArrowRight size={12} className="inline-arrow" /> {formatINR(afterPaymentBalance)}
                    </span>
                  </div>
                  <div className="impact-stat">
                    <span className="impact-label">Tracker Target</span>
                    <span className="impact-value font-bold text-emerald">
                      {paymentForm.frequency?.toUpperCase()} BUCKET
                    </span>
                  </div>
                  <div className="impact-stat">
                    <span className="impact-label">Today's Collection</span>
                    <span className="impact-value text-emerald font-bold">
                      +{formatINR(Number(paymentForm.amount) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions-bar">
                <button type="button" className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-emerald">
                  <PlusCircle size={15} /> Confirm & Record Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===============================================================
            MODAL: NEW APPLICATION (Dynamic Tenure & Amortization Engine)
            =============================================================== */}
        {activeModal === 'new-application' && (
          <div className="new-app-dark-modal">
            {/* Header */}
            <div className="new-app-header">
              <div>
                <h3 className="new-app-title">New Loan Application</h3>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Centralized Microfinance Tenure & Repayment Engine
                </span>
              </div>
              <button
                type="button"
                className="new-app-close-btn"
                onClick={handleClose}
                title="Close"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleAppSubmit} className="new-app-form-body" noValidate>
              {/* Field 1: Customer * */}
              <div className="new-app-form-item">
                <label className="new-app-item-label">
                  Customer <span className="new-app-req-star">*</span>
                </label>
                <select
                  required
                  className="new-app-dark-select"
                  value={appForm.customerName}
                  onChange={(e) => {
                    const sel = customers?.find((c) => c.name === e.target.value)
                    setAppForm({
                      ...appForm,
                      customerName: e.target.value,
                      customerId: sel ? sel.id : ''
                    })
                  }}
                >
                  <option value="" disabled>
                    Select customer
                  </option>
                  {customers && customers.length > 0
                    ? customers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.id}) • {c.center || 'Center'}
                        </option>
                      ))
                    : null}
                </select>
              </div>

              {/* Field 2: Loan Product * */}
              <div className="new-app-form-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="new-app-item-label">
                    Loan Product <span className="new-app-req-star">*</span>
                  </label>
                  {currentProductConfig && (
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                      {currentProductConfig.interestMethod === INTEREST_METHODS.REDUCING_BALANCE
                        ? 'Reducing Balance Amortization'
                        : 'Flat Interest Method'}
                    </span>
                  )}
                </div>
                <select
                  required
                  className="new-app-dark-select"
                  value={appForm.loanProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                >
                  {activeProducts.map((prod) => {
                    const p = LoanCalculationService.parseProductConfig(prod)
                    return (
                      <option key={prod.id || prod.name} value={prod.name}>
                        {p.name} ({p.annualRate}% p.a. • {p.interestMethod === INTEREST_METHODS.FLAT_INTEREST ? 'Flat' : 'Reducing'} • {REPAYMENT_FREQUENCY_LABELS[p.defaultFrequency]} default)
                      </option>
                    )
                  })}
                </select>
                {currentProductConfig && (
                  <span className="new-app-item-subhint">
                    Limits: ₹{currentProductConfig.minAmount.toLocaleString('en-IN')} – ₹{currentProductConfig.maxAmount.toLocaleString('en-IN')}
                    {currentProductConfig.minTenureDays && currentProductConfig.maxTenureDays ? ` • Duration: ${currentProductConfig.minTenureDays}–${currentProductConfig.maxTenureDays} days` : ''}
                  </span>
                )}
              </div>

              {/* Field 3: Loan Amount (₹) * */}
              <div className="new-app-form-item">
                <label className="new-app-item-label">
                  Loan Amount (₹) <span className="new-app-req-star">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={appForm.amount}
                  onChange={(e) => setAppForm({ ...appForm, amount: e.target.value })}
                  className="new-app-dark-input"
                  placeholder="50000"
                />
              </div>

              {/* Fields 4, 5, 6: Structured Tenure & Independent Repayment Frequency */}
              <div className="new-app-three-col-grid">
                {/* Tenure Value */}
                <div className="new-app-form-item">
                  <label className="new-app-item-label">
                    Tenure Value <span className="new-app-req-star">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={appForm.tenureValue}
                    onChange={(e) => setAppForm({ ...appForm, tenureValue: e.target.value })}
                    className="new-app-dark-input"
                    placeholder="12"
                  />
                </div>

                {/* Tenure Unit */}
                <div className="new-app-form-item">
                  <label className="new-app-item-label">
                    Tenure Unit <span className="new-app-req-star">*</span>
                  </label>
                  <select
                    required
                    className="new-app-dark-select"
                    value={appForm.tenureUnit}
                    onChange={(e) => setAppForm({ ...appForm, tenureUnit: e.target.value })}
                  >
                    <option value={TENURE_UNITS.DAYS}>Days</option>
                    <option value={TENURE_UNITS.WEEKS}>Weeks</option>
                    <option value={TENURE_UNITS.MONTHS}>Months</option>
                    <option value={TENURE_UNITS.YEARS}>Years</option>
                  </select>
                </div>

                {/* Independent Repayment Frequency */}
                <div className="new-app-form-item">
                  <label className="new-app-item-label">
                    Repayment Frequency <span className="new-app-req-star">*</span>
                  </label>
                  <select
                    required
                    className="new-app-dark-select"
                    value={appForm.frequency}
                    onChange={(e) => setAppForm({ ...appForm, frequency: e.target.value })}
                  >
                    <option value={REPAYMENT_FREQUENCIES.DAILY}>Daily</option>
                    <option value={REPAYMENT_FREQUENCIES.WEEKLY}>Weekly</option>
                    <option value={REPAYMENT_FREQUENCIES.BI_WEEKLY}>Bi-Weekly</option>
                    <option value={REPAYMENT_FREQUENCIES.MONTHLY}>Monthly</option>
                    <option value={REPAYMENT_FREQUENCIES.QUARTERLY}>Quarterly</option>
                  </select>
                </div>
              </div>

              {/* Fields 7, 8, 9: Rate, Method, and Start Date */}
              <div className="new-app-three-col-grid">
                <div className="new-app-form-item">
                  <label className="new-app-item-label">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={appForm.annualRate}
                    onChange={(e) => setAppForm({ ...appForm, annualRate: e.target.value })}
                    className="new-app-dark-input"
                  />
                </div>

                <div className="new-app-form-item">
                  <label className="new-app-item-label">Interest Method</label>
                  <select
                    className="new-app-dark-select"
                    value={appForm.interestMethod}
                    onChange={(e) => setAppForm({ ...appForm, interestMethod: e.target.value })}
                  >
                    <option value={INTEREST_METHODS.REDUCING_BALANCE}>Reducing Balance</option>
                    <option value={INTEREST_METHODS.FLAT_INTEREST}>Flat Interest</option>
                  </select>
                </div>

                <div className="new-app-form-item">
                  <label className="new-app-item-label">Loan Start Date</label>
                  <input
                    type="date"
                    required
                    value={appForm.startDate}
                    onChange={(e) => setAppForm({ ...appForm, startDate: e.target.value })}
                    className="new-app-dark-input"
                  />
                </div>
              </div>

              {/* Fields 10 & 11: Insurance Percentage & Purpose */}
              <div className="new-app-two-col-grid">
                <div className="new-app-form-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="new-app-item-label">
                      Loan Insurance (%)
                    </label>
                    {calculatedLoan && (
                      <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>
                        Fee: ₹{calculatedLoan.insuranceFee.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    value={appForm.insurancePercentage}
                    onChange={(e) => setAppForm({ ...appForm, insurancePercentage: e.target.value })}
                    className="new-app-dark-input"
                    placeholder="1.5"
                  />
                  <span className="new-app-item-subhint">
                    Loan insurance premium
                  </span>
                </div>

                <div className="new-app-form-item">
                  <label className="new-app-item-label">Purpose</label>
                  <select
                    className="new-app-dark-select"
                    value={appForm.purpose}
                    onChange={(e) => setAppForm({ ...appForm, purpose: e.target.value })}
                  >
                    <option value="">Select purpose</option>
                    <option value="Working Capital / Inventory">Working Capital / Inventory</option>
                    <option value="Business Expansion">Business Expansion</option>
                    <option value="Livestock & Dairy">Livestock & Dairy</option>
                    <option value="Agriculture & Farming">Agriculture & Farming</option>
                    <option value="Home Renovation / Housing">Home Renovation / Housing</option>
                    <option value="Emergency & Medical">Emergency & Medical</option>
                    <option value="Education / Schooling">Education / Schooling</option>
                    <option value="Other Micro Enterprise">Other Micro Enterprise</option>
                  </select>
                </div>
              </div>

              {/* Field 11: Purpose Details */}
              <div className="new-app-form-item">
                <label className="new-app-item-label">Purpose Details</label>
                <textarea
                  rows={2}
                  className="new-app-dark-textarea"
                  placeholder="Describe the business or purpose in detail..."
                  value={appForm.purposeDetails}
                  onChange={(e) => setAppForm({ ...appForm, purposeDetails: e.target.value })}
                />
              </div>

              {/* Inline Validation Alert Banner */}
              {!loanValidation.isValid && (
                <div className="new-app-validation-box">
                  <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div className="new-app-validation-title">Configuration Incompatible with Product Rules</div>
                    <ul className="new-app-validation-list">
                      {loanValidation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Downside: Live Amount, EMI & Schedule Breakdown */}
              {loanValidation.isValid && calculatedLoan && (
                <div className="new-app-calc-box">
                  <div className="new-app-calc-top-row">
                    <div className="new-app-calc-title">
                      <Calculator size={13} style={{ color: '#60a5fa' }} />
                      <span>REPAYMENT & EMI BREAKDOWN</span>
                    </div>
                    <span className="new-app-calc-badge">
                      {REPAYMENT_FREQUENCY_LABELS[calculatedLoan.frequency]} • {calculatedLoan.interestRateDisplay} • {INTEREST_METHOD_LABELS[calculatedLoan.interestMethod]}
                    </span>
                  </div>

                  <div className="new-app-calc-stats-row">
                    <div className="new-app-calc-stat">
                      <span className="new-app-calc-sublabel">Loan Amount</span>
                      <strong className="new-app-calc-strong">
                        ₹{calculatedLoan.principal.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div className="new-app-calc-stat highlight-emi">
                      <span className="new-app-calc-sublabel">
                        {calculatedLoan.perInstallmentLabel}
                      </span>
                      <strong className="new-app-calc-strong emi-accent">
                        ₹{calculatedLoan.baseEmi.toLocaleString('en-IN')}
                        <span className="new-app-calc-freq-unit">
                          {' '}/ {calculatedLoan.freqSuffix}
                        </span>
                      </strong>
                    </div>

                    <div className="new-app-calc-stat">
                      <span className="new-app-calc-sublabel">Total Interest</span>
                      <span className="new-app-calc-strong" style={{ color: '#fbbf24' }}>
                        +₹{calculatedLoan.totalInterest.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="new-app-calc-stat">
                      <span className="new-app-calc-sublabel">Total Payable</span>
                      <strong className="new-app-calc-strong" style={{ color: '#ffffff' }}>
                        ₹{calculatedLoan.totalPayable.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <div className="new-app-calc-footer-line">
                    <span>
                      ℹ️ Duration: <strong>{calculatedLoan.tenureValue} {TENURE_UNIT_LABELS[calculatedLoan.tenureUnit]}</strong> ({calculatedLoan.durationInDays} days) • <strong>{calculatedLoan.installmentCount} installments</strong> ({calculatedLoan.firstRepaymentDateFormatted} – {calculatedLoan.maturityDateFormatted})
                    </span>
                    {calculatedLoan.insuranceFee > 0 && (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        Insurance: ₹{calculatedLoan.insuranceFee.toLocaleString('en-IN')} ({calculatedLoan.insurancePercentage}%)
                      </span>
                    )}
                  </div>

                  {/* Schedule Preview Toggle Button */}
                  <div className="new-app-schedule-toggle-row">
                    <button
                      type="button"
                      className="btn-toggle-schedule"
                      onClick={() => setShowSchedulePreview(!showSchedulePreview)}
                    >
                      <Calendar size={13} />
                      <span>
                        {showSchedulePreview ? 'Hide Repayment Schedule' : `View Live Repayment Schedule (${calculatedLoan.installmentCount} Installments)`}
                      </span>
                      {showSchedulePreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Authoritative schedule preview with holiday rules
                    </span>
                  </div>

                  {/* Expanded Live Repayment Schedule Table */}
                  {showSchedulePreview && (
                    <div className="repayment-schedule-preview-container">
                      <div className="schedule-table-scroll-wrap">
                        <table className="new-app-schedule-table">
                          <thead>
                            <tr>
                              <th style={{ width: '40px' }}>#</th>
                              <th>Due Date</th>
                              <th style={{ textAlign: 'right' }}>Opening Balance</th>
                              <th style={{ textAlign: 'right' }}>Principal</th>
                              <th style={{ textAlign: 'right' }}>Interest</th>
                              <th style={{ textAlign: 'right' }}>Installment (EMI)</th>
                              <th style={{ textAlign: 'right' }}>Closing Balance</th>
                              <th style={{ textAlign: 'center' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculatedLoan.schedule.map((row) => (
                              <tr key={row.installmentNumber}>
                                <td style={{ fontWeight: 600, color: '#94a3b8' }}>{row.installmentNumber}</td>
                                <td>{row.dueDateFormatted}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{row.openingBalance.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#60a5fa' }}>₹{row.principal.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24' }}>₹{row.interest.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>₹{row.installmentAmount.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{row.closingBalance.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="schedule-status-scheduled">{row.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Reconciled Balance Summary Footer */}
                      <div className="schedule-summary-footer">
                        <span>
                          Principal: <strong>₹{calculatedLoan.totalPrincipal.toLocaleString('en-IN')}</strong> + Interest: <strong>₹{calculatedLoan.totalInterest.toLocaleString('en-IN')}</strong> = <strong>₹{calculatedLoan.totalPayable.toLocaleString('en-IN')}</strong>
                        </span>
                        <span className="reconciled-badge">
                          ✓ Reconciled: Final Balance = ₹0.00
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="new-app-buttons-row">
                <button
                  type="button"
                  className="btn-new-app-dark-cancel"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!loanValidation.isValid || !calculatedLoan}
                  className="btn-new-app-blue-submit"
                  style={{
                    opacity: !loanValidation.isValid || !calculatedLoan ? 0.5 : 1,
                    cursor: !loanValidation.isValid || !calculatedLoan ? 'not-allowed' : 'pointer'
                  }}
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===============================================================
            MODAL: REVIEW PENDING APPLICATION
            =============================================================== */}
        {activeModal === 'review-app' && selectedApplication && (
          <div className="modal-inner">
            <div className="modal-header">
              <div>
                <span className="modal-badge-app">{selectedApplication.id}</span>
                <h3 className="modal-title">Review Loan Application</h3>
                <p className="modal-subtitle">Verify borrower KYC, normalized tenure, and authoritative schedule</p>
              </div>
              <button type="button" className="btn-close-modal" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            <div className="review-details-box">
              <div className="review-stat-row">
                <span className="review-stat-label">Borrower Name</span>
                <strong className="review-stat-val">{selectedApplication.borrowerName}</strong>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Contact Phone</span>
                <span className="review-stat-val">{selectedApplication.phone}</span>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Requested Principal</span>
                <strong className="review-stat-val text-blue font-bold">
                  {formatINR(selectedApplication.amount)}
                </strong>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Normalized Tenure</span>
                <span className="review-stat-val">
                  {selectedApplication.tenure} ({selectedApplication.durationInDays || 'Calendar'} days)
                </span>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Frequency & Installments</span>
                <span className="review-stat-val">
                  {selectedApplication.frequency} • {selectedApplication.numberOfInstallments ? `${selectedApplication.numberOfInstallments} installments` : ''}
                </span>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Installment Amount (EMI)</span>
                <strong className="review-stat-val text-emerald font-bold">
                  {formatINR(selectedApplication.dailyEmi || selectedApplication.emi)} / installment
                </strong>
              </div>
              {selectedApplication.totalInterest !== undefined && (
                <div className="review-stat-row">
                  <span className="review-stat-label">Total Interest & Payable</span>
                  <span className="review-stat-val">
                    +{formatINR(selectedApplication.totalInterest)} (Total: {formatINR(selectedApplication.totalPayable)})
                  </span>
                </div>
              )}
              {selectedApplication.maturityDate && (
                <div className="review-stat-row">
                  <span className="review-stat-label">Schedule Lifecycle</span>
                  <span className="review-stat-val">
                    Start: {selectedApplication.startDate || selectedApplication.date} ➔ Maturity: {selectedApplication.maturityDate}
                  </span>
                </div>
              )}
              {selectedApplication.insuranceFee > 0 && (
                <div className="review-stat-row">
                  <span className="review-stat-label">Loan Insurance Fee</span>
                  <span className="review-stat-val text-emerald font-semibold">
                    {formatINR(selectedApplication.insuranceFee)} ({selectedApplication.insurancePercentage}%)
                  </span>
                </div>
              )}
              <div className="review-stat-row">
                <span className="review-stat-label">Center Cluster</span>
                <span className="review-stat-val">{selectedApplication.center}</span>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Product Name</span>
                <span className="review-stat-val">{selectedApplication.product}</span>
              </div>
            </div>

            {/* Toggle Full Schedule in Review */}
            {selectedApplication.repaymentSchedule && selectedApplication.repaymentSchedule.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-toggle-schedule"
                  onClick={() => setReviewScheduleOpen(!reviewScheduleOpen)}
                >
                  <Calendar size={13} />
                  <span>
                    {reviewScheduleOpen ? 'Hide Amortization Schedule' : `Inspect Amortization Schedule (${selectedApplication.repaymentSchedule.length} Installments)`}
                  </span>
                  {reviewScheduleOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {reviewScheduleOpen && (
                  <div className="repayment-schedule-preview-container" style={{ marginTop: 8 }}>
                    <div className="schedule-table-scroll-wrap">
                      <table className="new-app-schedule-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Due Date</th>
                            <th style={{ textAlign: 'right' }}>Opening</th>
                            <th style={{ textAlign: 'right' }}>Principal</th>
                            <th style={{ textAlign: 'right' }}>Interest</th>
                            <th style={{ textAlign: 'right' }}>EMI</th>
                            <th style={{ textAlign: 'right' }}>Closing</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedApplication.repaymentSchedule.map((row) => (
                            <tr key={row.installmentNumber}>
                              <td>{row.installmentNumber}</td>
                              <td>{row.dueDateFormatted}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{row.openingBalance.toLocaleString('en-IN')}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#60a5fa' }}>₹{row.principal.toLocaleString('en-IN')}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24' }}>₹{row.interest.toLocaleString('en-IN')}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>₹{row.installmentAmount.toLocaleString('en-IN')}</td>
                              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{row.closingBalance.toLocaleString('en-IN')}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="schedule-status-scheduled">{row.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions-bar">
              <button
                type="button"
                className="btn-danger"
                onClick={() => rejectApplication(selectedApplication.id)}
              >
                Reject Application
              </button>
              <button
                type="button"
                className="btn-success"
                onClick={() => approveApplication(selectedApplication.id)}
              >
                <CheckCircle size={15} />
                Approve & Disburse Immediately
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            MODAL: VIEW LOAN REPAYMENT SCHEDULE
            =============================================================== */}
        {activeModal === 'view-loan-schedule' && selectedLoan && (
          <div className="modal-inner modal-wide">
            <div className="modal-header">
              <div>
                <span className="modal-badge-app">{selectedLoan.id}</span>
                <h3 className="modal-title">Authoritative Repayment & Amortization Schedule</h3>
                <p className="modal-subtitle">
                  {selectedLoan.borrowerName} • {selectedLoan.product} ({formatINR(selectedLoan.principal)})
                </p>
              </div>
              <button type="button" className="btn-close-modal" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            <div className="review-details-box" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="review-stat-row">
                <span className="review-stat-label">Sanctioned Principal</span>
                <strong className="review-stat-val text-blue font-bold">{formatINR(selectedLoan.principal)}</strong>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Current Outstanding</span>
                <strong className="review-stat-val text-emerald font-bold">{formatINR(selectedLoan.outstanding)}</strong>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Tenure Duration</span>
                <span className="review-stat-val">{selectedLoan.tenure}</span>
              </div>
              <div className="review-stat-row">
                <span className="review-stat-label">Frequency & EMI</span>
                <span className="review-stat-val">{selectedLoan.frequency} • {formatINR(selectedLoan.emi)}</span>
              </div>
            </div>

            <div className="repayment-schedule-preview-container" style={{ marginTop: 12 }}>
              <div className="schedule-table-scroll-wrap" style={{ maxHeight: '380px' }}>
                <table className="new-app-schedule-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Opening Balance</th>
                      <th style={{ textAlign: 'right' }}>Principal</th>
                      <th style={{ textAlign: 'right' }}>Interest</th>
                      <th style={{ textAlign: 'right' }}>Installment (EMI)</th>
                      <th style={{ textAlign: 'right' }}>Closing Balance</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedLoan.repaymentSchedule && selectedLoan.repaymentSchedule.length > 0
                      ? selectedLoan.repaymentSchedule
                      : LoanCalculationService.generateRepaymentSchedule({
                          principal: selectedLoan.principal,
                          annualRate: 14,
                          interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
                          startDate: new Date(),
                          tenureValue: selectedLoan.tenureValue || 6,
                          tenureUnit: selectedLoan.tenureUnit || 'MONTHS',
                          frequency: selectedLoan.frequency || 'MONTHLY'
                        }).schedule
                    ).map((row) => (
                      <tr key={row.installmentNumber}>
                        <td style={{ fontWeight: 600, color: '#94a3b8' }}>{row.installmentNumber}</td>
                        <td>{row.dueDateFormatted}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{row.openingBalance.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#60a5fa' }}>₹{row.principal.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#fbbf24' }}>₹{row.interest.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>₹{row.installmentAmount.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>₹{row.closingBalance.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="schedule-status-scheduled">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===============================================================
            MODAL: ALL RECENT PAYMENTS
            =============================================================== */}
        {activeModal === 'view-all-payments' && (
          <div className="modal-inner modal-wide">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">All Recent Payments & Collections</h3>
                <p className="modal-subtitle">
                  Live audit trail of real-time collection deposits ({recentPayments.length} records)
                </p>
              </div>
              <div className="header-actions-group">
                <button
                  type="button"
                  className="btn-primary-emerald btn-sm"
                  onClick={() => setActiveModal('record-payment')}
                >
                  <PlusCircle size={14} /> + Record Payment
                </button>
                <button type="button" className="btn-close-modal" onClick={handleClose}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="modal-table-filter-bar">
              <input
                type="text"
                placeholder="Search by receipt ID, borrower name..."
                className="table-search-input"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
              />
              <div className="mode-filter-buttons">
                {['ALL', 'CASH', 'UPI', 'NEFT'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`btn-filter-pill ${modalModeFilter === mode ? 'active' : ''}`}
                    onClick={() => setModalModeFilter(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="payments-table-container">
              <table className="payments-data-table">
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Borrower</th>
                    <th>Loan Ref</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments
                    .filter((p) => {
                      const matchSearch =
                        !modalSearch ||
                        p.id.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        p.borrower?.toLowerCase().includes(modalSearch.toLowerCase())
                      const matchMode = modalModeFilter === 'ALL' || p.mode === modalModeFilter
                      return matchSearch && matchMode
                    })
                    .map((p) => (
                      <tr key={p.id}>
                        <td className="font-mono text-dark">{p.id}</td>
                        <td className="font-semibold">{p.borrower}</td>
                        <td className="font-mono text-muted">{p.loanId || '—'}</td>
                        <td>
                          <span className={`mode-badge ${p.mode.toLowerCase()}`}>{p.mode}</span>
                        </td>
                        <td className="text-muted">{p.date}</td>
                        <td>
                          <span className="status-success-badge">
                            <Check size={11} /> {p.status}
                          </span>
                        </td>
                        <td className="font-bold text-dark text-right">{formatINR(p.amount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions-bar">
              <button type="button" className="btn-secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            MODAL: ALL PENDING APPROVALS
            =============================================================== */}
        {activeModal === 'view-all-approvals' && (
          <div className="modal-inner modal-wide">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">All Pending Loan Approvals</h3>
                <p className="modal-subtitle">
                  Verify credit readiness before immediate disbursement ({pendingApprovals.length} pending)
                </p>
              </div>
              <button type="button" className="btn-close-modal" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            <div className="approvals-table-container">
              <table className="payments-data-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Borrower</th>
                    <th>Tenure</th>
                    <th>Frequency</th>
                    <th>Center</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                        No pending loan applications awaiting review.
                      </td>
                    </tr>
                  ) : (
                    pendingApprovals.map((app) => (
                      <tr key={app.id}>
                        <td className="font-mono text-dark">{app.id}</td>
                        <td className="font-semibold">{app.borrowerName}</td>
                        <td>{app.tenure}</td>
                        <td>{app.frequency}</td>
                        <td className="text-muted">{app.center}</td>
                        <td className="font-bold text-blue text-right">{formatINR(app.amount)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-outline-review"
                            onClick={() => {
                              setSelectedApplication(app)
                              setActiveModal('review-app')
                            }}
                          >
                            Review & Disburse
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions-bar">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setActiveModal('new-application')}
              >
                + New Application
              </button>
              <button type="button" className="btn-secondary" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* ===============================================================
            MODAL: ADD NEW CUSTOMER (Base44 LMS Exact Match)
            =============================================================== */}
        {activeModal === 'new-customer' && (
          <div className="new-cust-modal-wrapper">
            <div className="new-cust-header">
              <h3 className="new-cust-title">Add New Customer</h3>
              <button
                type="button"
                className="new-app-close-btn"
                onClick={handleClose}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="new-cust-scroll-form">
              {/* SECTION: Personal Information */}
              <div className="new-cust-section-heading">Personal Information</div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">
                  Full Name <span className="new-cust-req">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustForm.fullName}
                  onChange={(e) => setNewCustForm({ ...newCustForm, fullName: e.target.value })}
                  className="new-cust-input"
                />
              </div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Father's Name</label>
                  <input
                    type="text"
                    value={newCustForm.fatherName}
                    onChange={(e) => setNewCustForm({ ...newCustForm, fatherName: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Husband's Name</label>
                  <input
                    type="text"
                    placeholder="Husband's full name"
                    value={newCustForm.husbandName}
                    onChange={(e) => setNewCustForm({ ...newCustForm, husbandName: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
              </div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Wife's Name</label>
                  <input
                    type="text"
                    placeholder="Wife's full name"
                    value={newCustForm.wifeName}
                    onChange={(e) => setNewCustForm({ ...newCustForm, wifeName: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
                <div></div>
              </div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">C/O (Care Of)</label>
                <input
                  type="text"
                  placeholder="Care of person name / guardian"
                  value={newCustForm.careOf}
                  onChange={(e) => setNewCustForm({ ...newCustForm, careOf: e.target.value })}
                  className="new-cust-input"
                />
              </div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Date of Birth</label>
                  <input
                    type="date"
                    value={newCustForm.dob}
                    onChange={(e) => setNewCustForm({ ...newCustForm, dob: e.target.value })}
                    className="new-cust-input"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Gender</label>
                  <select
                    value={newCustForm.gender}
                    onChange={(e) => setNewCustForm({ ...newCustForm, gender: e.target.value })}
                    className="new-cust-select"
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">Occupation</label>
                <select
                  value={newCustForm.occupation}
                  onChange={(e) => setNewCustForm({ ...newCustForm, occupation: e.target.value })}
                  className="new-cust-select"
                >
                  <option value="" disabled>Select occupation</option>
                  <option value="self employed">Self Employed</option>
                  <option value="salaried">Salaried</option>
                  <option value="business">Business</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="daily wage">Daily Wage</option>
                  <option value="homemaker">Homemaker</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* SECTION: Contact Information */}
              <div className="new-cust-section-heading">Contact Information</div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">
                    Primary Mobile <span className="new-cust-req">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustForm.primaryMobile}
                    onChange={(e) => setNewCustForm({ ...newCustForm, primaryMobile: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Secondary Mobile</label>
                  <input
                    type="tel"
                    value={newCustForm.secondaryMobile}
                    onChange={(e) => setNewCustForm({ ...newCustForm, secondaryMobile: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
              </div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">Email</label>
                <input
                  type="email"
                  value={newCustForm.email}
                  onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                  className="new-cust-input"
                />
              </div>

              {/* SECTION: KYC Documents */}
              <div className="new-cust-section-heading">KYC Documents</div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Aadhaar Number</label>
                  <input
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    maxLength="14"
                    value={newCustForm.aadhaarNumber}
                    onChange={(e) => setNewCustForm({ ...newCustForm, aadhaarNumber: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">PAN Number</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    style={{ textTransform: 'uppercase' }}
                    value={newCustForm.panNumber}
                    onChange={(e) => setNewCustForm({ ...newCustForm, panNumber: e.target.value.toUpperCase() })}
                    className="new-cust-input"
                  />
                </div>
              </div>

              {/* SECTION: Upload Documents */}
              <div className="new-cust-section-heading">Upload Documents</div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Customer Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewCustForm({
                        ...newCustForm,
                        customerPhoto: e.target.files?.[0]?.name || null
                      })
                    }
                    className="new-cust-file-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">PAN Card Image</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setNewCustForm({
                        ...newCustForm,
                        panCardImage: e.target.files?.[0]?.name || null
                      })
                    }
                    className="new-cust-file-input"
                  />
                </div>
              </div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Aadhaar Front</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setNewCustForm({
                        ...newCustForm,
                        aadhaarFront: e.target.files?.[0]?.name || null
                      })
                    }
                    className="new-cust-file-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Aadhaar Back</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setNewCustForm({
                        ...newCustForm,
                        aadhaarBack: e.target.files?.[0]?.name || null
                      })
                    }
                    className="new-cust-file-input"
                  />
                </div>
              </div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">Bank Cheque / Passbook Image</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setNewCustForm({
                      ...newCustForm,
                      bankCheque: e.target.files?.[0]?.name || null
                    })
                  }
                  className="new-cust-file-input"
                />
              </div>

              {/* SECTION: Current Address */}
              <div className="new-cust-section-heading">Current Address</div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">Address Line</label>
                <input
                  type="text"
                  value={newCustForm.addressLine}
                  onChange={(e) => setNewCustForm({ ...newCustForm, addressLine: e.target.value })}
                  className="new-cust-input"
                />
              </div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">City</label>
                  <input
                    type="text"
                    value={newCustForm.city}
                    onChange={(e) => setNewCustForm({ ...newCustForm, city: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">District</label>
                  <input
                    type="text"
                    value={newCustForm.district}
                    onChange={(e) => setNewCustForm({ ...newCustForm, district: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
              </div>

              <div className="new-cust-row-2">
                <div className="new-cust-field-group">
                  <label className="new-cust-label">State</label>
                  <input
                    type="text"
                    value={newCustForm.state}
                    onChange={(e) => setNewCustForm({ ...newCustForm, state: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
                <div className="new-cust-field-group">
                  <label className="new-cust-label">Pincode</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={newCustForm.pincode}
                    onChange={(e) => setNewCustForm({ ...newCustForm, pincode: e.target.value })}
                    className="new-cust-input"
                  />
                </div>
              </div>

              <div className="new-cust-field-group">
                <label className="new-cust-label">Monthly Income (₹)</label>
                <input
                  type="number"
                  value={newCustForm.monthlyIncome}
                  onChange={(e) => setNewCustForm({ ...newCustForm, monthlyIncome: e.target.value })}
                  className="new-cust-input"
                />
              </div>

              {/* Actions Bar */}
              <div className="new-cust-actions-bar">
                <button
                  type="button"
                  className="btn-cust-cancel"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cust-submit"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===============================================================
            MODAL: RESET APPLICATION DATA / TESTING RESTART
            =============================================================== */}
        {activeModal === 'reset-data-modal' && (
          <div className="modal-inner reset-data-modal-box">
            <div className="modal-header">
              <div className="modal-title-with-badge">
                <div className="modal-icon-badge icon-amber">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Reset Application Data</h3>
                  <p className="modal-subtitle">
                    Select your testing mode or restore the clean demo environment.
                  </p>
                </div>
              </div>
              <button type="button" className="btn-close-modal" onClick={handleClose}>
                <X size={18} />
              </button>
            </div>

            <div className="reset-options-container">
              {/* Option 1: Fresh Testing Slate (Zero Data) */}
              <div className="reset-option-card recommended">
                <div className="reset-option-header">
                  <div className="reset-option-badge-rec">RECOMMENDED FOR TESTING</div>
                  <h4 className="reset-option-title">
                    <Sparkles size={16} className="text-emerald" /> Fresh Blank State (0 Records)
                  </h4>
                  <p className="reset-option-desc">
                    Wipes all transactional data so you can test the complete loan lifecycle from the very beginning.
                  </p>
                </div>

                <ul className="reset-checklist">
                  <li><Check size={14} className="text-emerald" /> <strong>0 Customers:</strong> The first customer you register will get ID <code>SGTPL000001</code></li>
                  <li><Check size={14} className="text-emerald" /> <strong>0 Loans & Applications:</strong> Empty portfolio ready for new credit appraisals</li>
                  <li><Check size={14} className="text-emerald" /> <strong>0 Payments & Disbursements:</strong> Clean audit trail and fresh ledger</li>
                  <li><Check size={14} className="text-emerald" /> <strong>Metrics & Charts:</strong> Reset cleanly to ₹0</li>
                  <li><Check size={14} className="text-emerald" /> <strong>Preserves Config:</strong> Standard loan products, branches & admin user stay ready</li>
                </ul>

                <button
                  type="button"
                  className="btn-reset-execute-blank"
                  onClick={() => {
                    resetToFreshBlankState()
                    handleClose()
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Reset to 0 Data (Test from Beginning)</span>
                </button>
              </div>

              {/* Option 2: Standard Demo Portfolio */}
              <div className="reset-option-card">
                <div className="reset-option-header">
                  <div className="reset-option-badge-demo">DEMO SHOWCASE</div>
                  <h4 className="reset-option-title">
                    <Database size={16} className="text-blue" /> Standard Demo Portfolio
                  </h4>
                  <p className="reset-option-desc">
                    Loads 7 verified sample borrowers with realistic active daily/weekly/monthly loans and pre-populated collection charts.
                  </p>
                </div>

                <ul className="reset-checklist">
                  <li><Check size={14} className="text-blue" /> 7 pre-configured borrower profiles (Sunita, Radha, Meena, etc.)</li>
                  <li><Check size={14} className="text-blue" /> 6 active/closed loans with scheduled EMIs</li>
                  <li><Check size={14} className="text-blue" /> Pre-computed collection trends and portfolio breakdown</li>
                </ul>

                <button
                  type="button"
                  className="btn-reset-execute-demo"
                  onClick={() => {
                    resetToDemoState()
                    handleClose()
                  }}
                >
                  <Database size={15} />
                  <span>Load Sample Demo Data</span>
                </button>
              </div>

              {/* Option 3: Hard Wipe */}
              <div className="reset-hard-wipe-row">
                <div className="reset-hard-wipe-info">
                  <AlertTriangle size={15} className="text-amber" />
                  <span>Need a complete deep wipe? Clear all browser localStorage and refresh.</span>
                </div>
                <button
                  type="button"
                  className="btn-reset-hard-wipe"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all storage and reload?')) {
                      hardWipeAllStorage()
                    }
                  }}
                >
                  <Trash2 size={13} />
                  <span>Wipe All & Reload</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

