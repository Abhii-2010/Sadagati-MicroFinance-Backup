import { useState } from 'react'
import { Plus, Edit3, Check, X, Ban, Trash2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './LoanProducts.css'

export default function LoanProductsView() {
  const {
    loanProducts,
    toggleProductStatus,
    deleteLoanProduct,
    purgeDeactivatedProducts,
    updateLoanProduct,
    addLoanProduct,
    formatINR
  } = useDashboard()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Active tab inside the Add/Edit Product Modal
  const [modalTab, setModalTab] = useState('basic') // 'basic' | 'interest' | 'fees' | 'rules'

  // Comprehensive Product Form state (covers all 4 screenshots from Base44)
  const initialFormState = {
    // 1. Basic Tab
    productCode: 'PL001',
    productName: 'Personal Loan',
    loanType: 'Personal Loan',
    description: '',
    minAmount: 10000,
    maxAmount: 50000,
    minTenure: 0,
    maxTenure: 12,
    repaymentFrequency: 'Monthly',

    // 2. Interest Tab
    interestRate: '24',
    interestType: 'Reducing Balance',
    penaltyRate: '2',
    penaltyType: 'Per Day',
    gracePeriodDays: '3',

    // 3. Fees Tab
    processingFeeType: 'Percentage',
    processingFeeValue: '1.5',
    documentationFee: '250',
    insuranceRequired: false,
    insurancePercentage: '1.5',

    // 4. Rules Tab
    allowPrepayment: false,
    prepaymentPenalty: '0',
    allowForeclosure: false,
    foreclosureAfterMonths: '3',
    foreclosurePenalty: '2',
    active: true
  }

  const [productForm, setProductForm] = useState(initialFormState)

  // Open Add Product Modal with clean next code
  const handleOpenAdd = () => {
    const nextNum = (loanProducts?.length || 5) + 1
    const nextCode = `PL00${nextNum}`
    setProductForm({
      ...initialFormState,
      productCode: nextCode
    })
    setModalTab('basic')
    setIsAddModalOpen(true)
  }

  // Open Edit Product Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setProductForm({
      ...initialFormState,
      productCode: product.id,
      productName: product.name,
      loanType: product.loanType || 'Personal Loan',
      description: product.description || '',
      interestRate: (product.interestRate || '24').replace(/[^0-9.]/g, '') || '24',
      interestType: (product.interestType || product.interestRate || '').toLowerCase().includes('flat')
        ? 'Flat'
        : 'Reducing Balance',
      penaltyRate: product.penaltyRate || '2',
      penaltyType: product.penaltyType || 'Per Day',
      gracePeriodDays: product.gracePeriodDays || '3',
      processingFeeType: product.processingFeeType || 'Percentage',
      processingFeeValue: product.processingFeeValue || '1.5',
      documentationFee: product.documentationFee || '250',
      insuranceRequired: !!product.insuranceRequired,
      insurancePercentage: product.insurancePercentage !== undefined ? String(product.insurancePercentage) : '1.5',
      minAmount: product.minAmount !== undefined ? product.minAmount : 10000,
      maxAmount: product.maxAmount !== undefined ? product.maxAmount : 50000,
      minTenure: product.minTenure !== undefined ? product.minTenure : 0,
      maxTenure: product.maxTenure !== undefined ? product.maxTenure : 12,
      repaymentFrequency: product.repaymentFrequency || 'Monthly',
      allowPrepayment: !!product.allowPrepayment,
      prepaymentPenalty: product.prepaymentPenalty || '0',
      allowForeclosure: !!product.allowForeclosure,
      foreclosureAfterMonths: product.foreclosureAfterMonths || '3',
      foreclosurePenalty: product.foreclosurePenalty || '2',
      active: product.status === 'Active'
    })
    setModalTab('basic')
    setIsEditModalOpen(true)
  }

  // Handle Create Product Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault()

    const formattedAmountRange =
      productForm.minAmount && productForm.maxAmount
        ? `${formatINR(productForm.minAmount)} - ${formatINR(productForm.maxAmount)}`
        : productForm.minAmount
        ? `${formatINR(productForm.minAmount)}`
        : '₹20,000 - ₹50,000'

    const formattedTenure =
      productForm.minTenure !== '' && productForm.maxTenure !== ''
        ? `${productForm.minTenure} - ${productForm.maxTenure} months`
        : '0 - 12 months'

    const formattedInterestRate = `${productForm.interestRate}% ${
      productForm.interestType === 'Flat' ? 'flat' : 'reducing'
    }`

    const newProduct = {
      id: productForm.productCode || `PL00${(loanProducts?.length || 5) + 1}`,
      name: productForm.productName || 'New Product',
      loanType: productForm.loanType,
      interestRate: formattedInterestRate,
      interestType: productForm.interestType,
      amountRange: formattedAmountRange,
      tenure: formattedTenure,
      minAmount: Number(productForm.minAmount) || 0,
      maxAmount: Number(productForm.maxAmount) || 0,
      minTenure: Number(productForm.minTenure) || 0,
      maxTenure: Number(productForm.maxTenure) || 0,
      status: productForm.active ? 'Active' : 'Deactivated',
      repaymentFrequency: productForm.repaymentFrequency,
      description: productForm.description,
      penaltyRate: productForm.penaltyRate,
      penaltyType: productForm.penaltyType,
      gracePeriodDays: productForm.gracePeriodDays,
      processingFeeType: productForm.processingFeeType,
      processingFeeValue: productForm.processingFeeValue,
      documentationFee: productForm.documentationFee,
      insuranceRequired: productForm.insuranceRequired,
      insurancePercentage: Number(productForm.insurancePercentage) || 0,
      allowPrepayment: productForm.allowPrepayment,
      prepaymentPenalty: productForm.prepaymentPenalty,
      allowForeclosure: productForm.allowForeclosure,
      foreclosureAfterMonths: productForm.foreclosureAfterMonths,
      foreclosurePenalty: productForm.foreclosurePenalty
    }

    if (isEditModalOpen && editingProduct) {
      updateLoanProduct(editingProduct.id, newProduct)
      setIsEditModalOpen(false)
      setEditingProduct(null)
    } else {
      addLoanProduct(newProduct)
      setIsAddModalOpen(false)
    }
  }

  return (
    <div className="lp-container">
      {/* --------------------------------------------------------------------
          1. HEADER ROW: Matches Base44 LMS screenshot
          -------------------------------------------------------------------- */}
      <div className="lp-header-row">
        <div className="lp-header-titles">
          <h2 className="lp-main-heading">Loan Products</h2>
          <p className="lp-sub-heading">Configure loan products and interest rates</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {(loanProducts || []).some((p) => p.status === 'Deactivated') && (
            <button
              type="button"
              className="btn-purge-deactivated"
              onClick={purgeDeactivatedProducts}
              title="Remove all deactivated loan products permanently"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={15} />
              <span>Remove Deactivated ({(loanProducts || []).filter((p) => p.status === 'Deactivated').length})</span>
            </button>
          )}

          <button
            type="button"
            className="btn-add-product-main"
            onClick={handleOpenAdd}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          2. PRODUCTS GRID: Exact match to Base44 cards layout
          -------------------------------------------------------------------- */}
      <div className="lp-products-grid">
        {(loanProducts || []).map((product) => {
          const isActive = product.status === 'Active'

          return (
            <div
              key={product.id}
              className={`lp-product-card ${!isActive ? 'deactivated' : ''}`}
            >
              {/* Card Header */}
              <div className="lp-card-header">
                <div className="lp-code-name-wrap">
                  <span className="lp-product-code">{product.id}</span>
                  <h3 className="lp-product-name">{product.name}</h3>
                </div>

                {/* Status Indicator Badge */}
                <div
                  className={`lp-status-badge ${isActive ? 'active' : 'inactive'}`}
                  title={isActive ? 'Active product' : 'Deactivated product'}
                >
                  {isActive ? <Check size={18} strokeWidth={2.5} /> : <Ban size={16} />}
                </div>
              </div>

              {/* 2x2 Meta Information Grid */}
              <div className="lp-card-meta-grid">
                {/* Interest Rate */}
                <div className="lp-meta-item">
                  <span className="lp-meta-label">Interest Rate</span>
                  <span className="lp-meta-value">{product.interestRate}</span>
                </div>

                {/* Loan Type */}
                <div className="lp-meta-item">
                  <span className="lp-meta-label">Loan Type</span>
                  <span className="lp-meta-value">{product.loanType}</span>
                </div>

                {/* Amount Range */}
                <div className="lp-meta-item">
                  <span className="lp-meta-label">Amount Range</span>
                  <span className="lp-meta-value">{product.amountRange}</span>
                </div>

                {/* Tenure */}
                <div className="lp-meta-item">
                  <span className="lp-meta-label">Tenure</span>
                  <span className="lp-meta-value">{product.tenure}</span>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="lp-card-actions">
                <button
                  type="button"
                  className="btn-lp-edit"
                  onClick={() => handleOpenEdit(product)}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  className={`btn-lp-deactivate ${!isActive ? 'is-inactive' : ''}`}
                  onClick={() => toggleProductStatus(product.id)}
                >
                  <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                {!isActive && (
                  <button
                    type="button"
                    className="btn-lp-delete"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem 0.75rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    onClick={() => deleteLoanProduct(product.id)}
                    title="Permanently remove this deactivated product"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ====================================================================
          MODAL: ADD / EDIT LOAN PRODUCT (Exact Match to 4 Screenshots)
          Tabs: Basic | Interest | Fees | Rules
          ==================================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="lp-modal-overlay">
          <div className="lp-modal-box">
            {/* Modal Header */}
            <div className="lp-modal-header">
              <h3 className="lp-modal-title">
                {isEditModalOpen ? `Edit Loan Product: ${editingProduct?.name}` : 'Add Loan Product'}
              </h3>
              <button
                type="button"
                className="lp-modal-close-btn"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  setEditingProduct(null)
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 4-Tab Navigation Strip (Basic | Interest | Fees | Rules) */}
            <div className="lp-modal-tabs-strip">
              <button
                type="button"
                className={`lp-modal-tab-btn ${modalTab === 'basic' ? 'is-active' : ''}`}
                onClick={() => setModalTab('basic')}
              >
                Basic
              </button>
              <button
                type="button"
                className={`lp-modal-tab-btn ${modalTab === 'interest' ? 'is-active' : ''}`}
                onClick={() => setModalTab('interest')}
              >
                Interest
              </button>
              <button
                type="button"
                className={`lp-modal-tab-btn ${modalTab === 'fees' ? 'is-active' : ''}`}
                onClick={() => setModalTab('fees')}
              >
                Fees
              </button>
              <button
                type="button"
                className={`lp-modal-tab-btn ${modalTab === 'rules' ? 'is-active' : ''}`}
                onClick={() => setModalTab('rules')}
              >
                Rules
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'contents' }}>
              <div className="lp-modal-body">
                {/* ----------------------------------------------------------
                    TAB 1: BASIC (Screenshot 1)
                    ---------------------------------------------------------- */}
                {modalTab === 'basic' && (
                  <>
                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">
                          Product Code <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          className="lp-form-input"
                          value={productForm.productCode}
                          onChange={(e) =>
                            setProductForm({ ...productForm, productCode: e.target.value })
                          }
                          placeholder="PL001"
                          required
                        />
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">
                          Product Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          className="lp-form-input"
                          value={productForm.productName}
                          onChange={(e) =>
                            setProductForm({ ...productForm, productName: e.target.value })
                          }
                          placeholder="Personal Loan"
                          required
                        />
                      </div>
                    </div>

                    <div className="lp-form-group">
                      <label className="lp-form-label">
                        Loan Type <span className="req">*</span>
                      </label>
                      <select
                        className="lp-form-select"
                        value={productForm.loanType}
                        onChange={(e) =>
                          setProductForm({ ...productForm, loanType: e.target.value })
                        }
                      >
                        <option value="Personal Loan">Personal Loan</option>
                        <option value="Business Loan">Business Loan</option>
                        <option value="Daily Micro Business Loan">Daily Micro Business Loan</option>
                        <option value="Weekly Livestock Loan">Weekly Livestock Loan</option>
                        <option value="Monthly Small Enterprise Loan">Monthly Small Enterprise Loan</option>
                        <option value="Emergency Festival Loan">Emergency Festival Loan</option>
                      </select>
                    </div>

                    <div className="lp-form-group">
                      <label className="lp-form-label">Description</label>
                      <textarea
                        className="lp-form-textarea"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                        placeholder=""
                      ></textarea>
                    </div>

                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">Min Amount (₹)</label>
                        <input
                          type="number"
                          className="lp-form-input"
                          value={productForm.minAmount}
                          onChange={(e) =>
                            setProductForm({ ...productForm, minAmount: e.target.value })
                          }
                        />
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">Max Amount (₹)</label>
                        <input
                          type="number"
                          className="lp-form-input"
                          value={productForm.maxAmount}
                          onChange={(e) =>
                            setProductForm({ ...productForm, maxAmount: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">Min Tenure (Months)</label>
                        <input
                          type="number"
                          step="any"
                          className="lp-form-input"
                          value={productForm.minTenure}
                          onChange={(e) =>
                            setProductForm({ ...productForm, minTenure: e.target.value })
                          }
                        />
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">Max Tenure (Months)</label>
                        <input
                          type="number"
                          step="any"
                          className="lp-form-input"
                          value={productForm.maxTenure}
                          onChange={(e) =>
                            setProductForm({ ...productForm, maxTenure: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="lp-form-group">
                      <label className="lp-form-label">Repayment Frequency</label>
                      <select
                        className="lp-form-select"
                        value={productForm.repaymentFrequency}
                        onChange={(e) =>
                          setProductForm({ ...productForm, repaymentFrequency: e.target.value })
                        }
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Daily">Daily</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>
                  </>
                )}

                {/* ----------------------------------------------------------
                    TAB 2: INTEREST (Screenshot 2)
                    ---------------------------------------------------------- */}
                {modalTab === 'interest' && (
                  <>
                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">
                          Interest Rate (% p.a.) <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          className="lp-form-input"
                          value={productForm.interestRate}
                          onChange={(e) =>
                            setProductForm({ ...productForm, interestRate: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">
                          Interest Type <span className="req">*</span>
                        </label>
                        <select
                          className="lp-form-select"
                          value={productForm.interestType}
                          onChange={(e) =>
                            setProductForm({ ...productForm, interestType: e.target.value })
                          }
                        >
                          <option value="Reducing Balance">Reducing Balance</option>
                          <option value="Flat">Flat</option>
                        </select>
                      </div>
                    </div>

                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">Penalty Rate (%)</label>
                        <input
                          type="text"
                          className="lp-form-input"
                          value={productForm.penaltyRate}
                          onChange={(e) =>
                            setProductForm({ ...productForm, penaltyRate: e.target.value })
                          }
                        />
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">Penalty Type</label>
                        <select
                          className="lp-form-select"
                          value={productForm.penaltyType}
                          onChange={(e) =>
                            setProductForm({ ...productForm, penaltyType: e.target.value })
                          }
                        >
                          <option value="Per Day">Per Day</option>
                          <option value="Per Month">Per Month</option>
                          <option value="One Time">One Time</option>
                        </select>
                      </div>
                    </div>

                    <div className="lp-form-group">
                      <label className="lp-form-label">Grace Period (Days)</label>
                      <input
                        type="number"
                        className="lp-form-input"
                        value={productForm.gracePeriodDays}
                        onChange={(e) =>
                          setProductForm({ ...productForm, gracePeriodDays: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* ----------------------------------------------------------
                    TAB 3: FEES (Screenshot 3)
                    ---------------------------------------------------------- */}
                {modalTab === 'fees' && (
                  <>
                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">Processing Fee Type</label>
                        <select
                          className="lp-form-select"
                          value={productForm.processingFeeType}
                          onChange={(e) =>
                            setProductForm({ ...productForm, processingFeeType: e.target.value })
                          }
                        >
                          <option value="Percentage">Percentage</option>
                          <option value="Fixed Amount">Fixed Amount</option>
                        </select>
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">Processing Fee Value</label>
                        <input
                          type="text"
                          className="lp-form-input"
                          value={productForm.processingFeeValue}
                          onChange={(e) =>
                            setProductForm({ ...productForm, processingFeeValue: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="lp-form-group">
                      <label className="lp-form-label">Documentation Fee (₹)</label>
                      <input
                        type="number"
                        className="lp-form-input"
                        value={productForm.documentationFee}
                        onChange={(e) =>
                          setProductForm({ ...productForm, documentationFee: e.target.value })
                        }
                      />
                    </div>

                    {/* Insurance Required Toggle Switch */}
                    <div
                      className="lp-switch-card"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          insuranceRequired: !productForm.insuranceRequired
                        })
                      }
                    >
                      <div className="lp-switch-info">
                        <span className="lp-switch-title">Insurance Required</span>
                        <span className="lp-switch-sub">Mandate loan insurance</span>
                      </div>
                      <div
                        className={`lp-switch-toggle ${
                          productForm.insuranceRequired ? 'is-checked' : ''
                        }`}
                      >
                        <div className="lp-switch-knob"></div>
                      </div>
                    </div>

                    {productForm.insuranceRequired && (
                      <div className="lp-form-group">
                        <label className="lp-form-label">Default Insurance Percentage (%)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          max="50"
                          className="lp-form-input"
                          value={productForm.insurancePercentage || '1.5'}
                          onChange={(e) =>
                            setProductForm({ ...productForm, insurancePercentage: e.target.value })
                          }
                          placeholder="1.5"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ----------------------------------------------------------
                    TAB 4: RULES (Screenshot 4)
                    ---------------------------------------------------------- */}
                {modalTab === 'rules' && (
                  <>
                    {/* Allow Prepayment Toggle Switch */}
                    <div
                      className="lp-switch-card"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          allowPrepayment: !productForm.allowPrepayment
                        })
                      }
                    >
                      <div className="lp-switch-info">
                        <span className="lp-switch-title">Allow Prepayment</span>
                        <span className="lp-switch-sub">Customer can pay extra EMIs</span>
                      </div>
                      <div
                        className={`lp-switch-toggle ${
                          productForm.allowPrepayment ? 'is-checked' : ''
                        }`}
                      >
                        <div className="lp-switch-knob"></div>
                      </div>
                    </div>

                    <div className="lp-form-group">
                      <label className="lp-form-label">Prepayment Penalty (%)</label>
                      <input
                        type="number"
                        className="lp-form-input"
                        value={productForm.prepaymentPenalty}
                        onChange={(e) =>
                          setProductForm({ ...productForm, prepaymentPenalty: e.target.value })
                        }
                      />
                    </div>

                    {/* Allow Foreclosure Toggle Switch */}
                    <div
                      className="lp-switch-card"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          allowForeclosure: !productForm.allowForeclosure
                        })
                      }
                    >
                      <div className="lp-switch-info">
                        <span className="lp-switch-title">Allow Foreclosure</span>
                        <span className="lp-switch-sub">Customer can close loan early</span>
                      </div>
                      <div
                        className={`lp-switch-toggle ${
                          productForm.allowForeclosure ? 'is-checked' : ''
                        }`}
                      >
                        <div className="lp-switch-knob"></div>
                      </div>
                    </div>

                    <div className="lp-form-row-2">
                      <div className="lp-form-group">
                        <label className="lp-form-label">Foreclosure After (Months)</label>
                        <input
                          type="number"
                          className="lp-form-input"
                          value={productForm.foreclosureAfterMonths}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              foreclosureAfterMonths: e.target.value
                            })
                          }
                        />
                      </div>

                      <div className="lp-form-group">
                        <label className="lp-form-label">Foreclosure Penalty (%)</label>
                        <input
                          type="number"
                          className="lp-form-input"
                          value={productForm.foreclosurePenalty}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              foreclosurePenalty: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="lp-modal-divider"></div>

                    {/* Active Toggle Switch */}
                    <div
                      className="lp-switch-card"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          active: !productForm.active
                        })
                      }
                    >
                      <div className="lp-switch-info">
                        <span className="lp-switch-title">Active</span>
                        <span className="lp-switch-sub">Product is available for new loans</span>
                      </div>
                      <div
                        className={`lp-switch-toggle ${
                          productForm.active ? 'is-checked' : ''
                        }`}
                      >
                        <div className="lp-switch-knob"></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer Actions: Cancel (left) | Create Product (right) */}
              <div className="lp-modal-actions">
                <button
                  type="button"
                  className="btn-lp-modal-cancel"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setIsEditModalOpen(false)
                    setEditingProduct(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-lp-modal-submit">
                  {isEditModalOpen ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
