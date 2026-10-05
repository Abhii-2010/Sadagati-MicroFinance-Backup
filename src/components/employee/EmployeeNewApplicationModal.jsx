import { useState, useMemo } from 'react'
import { X, FileText, Calculator, ShieldAlert, ArrowRight } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { LoanCalculationService } from '../../services/loanCalculationService.js'
import { formatINR } from '../../utils/formatters'

export default function EmployeeNewApplicationModal({ isOpen, onClose }) {
  const { branchCustomers, loanProducts, addNewApplication, currentUser } = useDashboard()

  const [customerId, setCustomerId] = useState(branchCustomers[0]?.id || '')
  const [selectedProduct, setSelectedProduct] = useState(loanProducts[0]?.name || 'Daily Micro Business Loan')
  const [amount, setAmount] = useState(25000)
  const [tenureValue, setTenureValue] = useState(3)
  const [tenureUnit, setTenureUnit] = useState('months')
  const [frequency, setFrequency] = useState('Daily')
  const [purpose, setPurpose] = useState('Working Capital Expansion')

  // Find customer object
  const customer = branchCustomers.find((c) => c.id === customerId) || branchCustomers[0]

  // Find product config
  const prodConfig = useMemo(() => {
    return LoanCalculationService.getProductConfig(selectedProduct, loanProducts)
  }, [selectedProduct, loanProducts])

  // Real-time calculation preview
  const preview = useMemo(() => {
    try {
      const annualRate = prodConfig ? prodConfig.annualRate : 14
      const interestMethod = prodConfig ? prodConfig.interestMethod : 'REDUCING_BALANCE'
      const rawUnit = LoanCalculationService.normalizeTenureUnit(tenureUnit)
      const rawFreq = LoanCalculationService.normalizeRepaymentFrequency(frequency)

      return LoanCalculationService.generateRepaymentSchedule({
        principal: Number(amount) || 25000,
        annualRate,
        interestMethod,
        startDate: new Date(),
        tenureValue: Number(tenureValue) || 3,
        tenureUnit: rawUnit,
        frequency: rawFreq
      })
    } catch {
      return null
    }
  }, [amount, tenureValue, tenureUnit, frequency, prodConfig])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customer) {
      alert('Please select or register a customer first.')
      return
    }

    addNewApplication({
      customerId: customer.id,
      customerName: customer.name || customer.fullName,
      phone: customer.phone || customer.primaryMobile,
      product: selectedProduct,
      loanProduct: selectedProduct,
      amount: Number(amount),
      tenureValue: Number(tenureValue),
      tenureUnit,
      frequency,
      purpose,
      branchId: currentUser?.branchId || 'BR-001',
      branch: currentUser?.branch || 'Jaipur Central Branch',
      submittedBy: currentUser?.name || 'Field Officer',
      employeeId: currentUser?.employeeId || 'EMP-JPR-001'
    })

    onClose()
  }

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="emp-modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="emp-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 className="emp-modal-title">New Loan Application</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Branch: <strong style={{ color: '#60a5fa' }}>{currentUser?.branch}</strong> • Submitting to Admin Review
              </p>
            </div>
          </div>
          <button type="button" className="emp-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="emp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Non-Approval Notice */}
            <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a' }}>
              <ShieldAlert size={16} />
              <span>
                Employee cannot approve loans. Application will be submitted with status <strong>Pending Review</strong> for Admin approval.
              </span>
            </div>

            {/* Customer Selector (Branch Scoped) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                Select Branch Borrower *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                required
              >
                {branchCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.fullName} ({c.id}) • Phone: {c.phone || c.primaryMobile}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Loan Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                >
                  {loanProducts.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.annualRate || 14}% p.a.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="1000"
                  step="500"
                  style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Tenure
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={tenureValue}
                    onChange={(e) => setTenureValue(Number(e.target.value))}
                    min="1"
                    style={{ width: '70px', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                  />
                  <select
                    value={tenureUnit}
                    onChange={(e) => setTenureUnit(e.target.value)}
                    style={{ flex: 1, height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Repayment Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            {/* Real-time Calculation Summary Box */}
            {preview && (
              <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', color: '#34d399', fontWeight: '700', marginBottom: '10px' }}>
                  <Calculator size={14} />
                  <span>Calculation Preview (Authoritative Engine)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Installment (EMI)</span>
                    <strong style={{ color: '#10b981', fontSize: '15px' }}>{formatINR(preview.baseEmi || 0)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Installments Count</span>
                    <strong style={{ color: '#ffffff' }}>{preview.installmentCount}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Total Interest</span>
                    <strong style={{ color: '#fbbf24' }}>{formatINR(preview.totalInterest || 0)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Total Repayable</span>
                    <strong style={{ color: '#ffffff' }}>{formatINR(preview.totalPayable || 0)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Interest Rate</span>
                    <span style={{ color: '#e2e8f0' }}>{preview.annualRate}% p.a.</span>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Method</span>
                    <span style={{ color: '#e2e8f0' }}>{preview.interestMethod}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="emp-modal-footer">
            <button type="button" className="emp-btn-logout" style={{ color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.1)' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="emp-quick-action-sapphire">
              <span>Submit to Admin Queue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
