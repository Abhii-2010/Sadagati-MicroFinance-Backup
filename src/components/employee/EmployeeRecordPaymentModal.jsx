import { useState } from 'react'
import { X, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeRecordPaymentModal({ isOpen, onClose, onPaymentSuccess, preselectedLoanId }) {
  const { branchLoans, recordNewPayment, currentUser } = useDashboard()

  const activeLoans = branchLoans.filter((l) => l.status === 'Active')
  const defaultLoanId = preselectedLoanId || activeLoans[0]?.id || ''
  
  const [loanId, setLoanId] = useState(defaultLoanId)
  const selectedLoan = branchLoans.find((l) => l.id === loanId) || activeLoans[0]

  const [amount, setAmount] = useState(selectedLoan?.emi || 100)
  const [mode, setMode] = useState('CASH')
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  const handleLoanChange = (e) => {
    const id = e.target.value
    setLoanId(id)
    const found = branchLoans.find((l) => l.id === id)
    if (found) {
      setAmount(found.emi || 100)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedLoan) {
      alert('No active loan selected.')
      return
    }

    if (Number(amount) <= 0) {
      alert('Payment amount must be greater than zero.')
      return
    }

    const createdPayment = recordNewPayment({
      loanId: selectedLoan.id,
      borrower: selectedLoan.borrowerName,
      amount: Number(amount),
      mode,
      frequency: selectedLoan.frequency || 'Daily',
      notes,
      branchId: currentUser?.branchId || 'BR-001',
      branch: currentUser?.branch || 'Jaipur Central Branch',
      collectedBy: currentUser?.name || 'Field Officer',
      employeeId: currentUser?.employeeId || 'EMP-JPR-001'
    })

    onClose()
    if (onPaymentSuccess && createdPayment) {
      onPaymentSuccess(createdPayment)
    }
  }

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="emp-modal-box" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="emp-modal-title">Record Collection Payment</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Branch: <strong style={{ color: '#10b981' }}>{currentUser?.branch}</strong> • Accounting Live Sync
              </p>
            </div>
          </div>
          <button type="button" className="emp-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="emp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Loan Selector (Branch Scoped) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                Select Active Branch Loan *
              </label>
              <select
                value={loanId}
                onChange={handleLoanChange}
                style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                required
              >
                {activeLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.borrowerName} • {l.id} (Outstanding: {formatINR(l.outstanding)})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Loan Snapshot Card */}
            {selectedLoan && (
              <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Borrower</span>
                    <strong style={{ color: '#ffffff' }}>{selectedLoan.borrowerName}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Current Outstanding</span>
                    <strong style={{ color: '#f59e0b' }}>{formatINR(selectedLoan.outstanding)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8', display: 'block', fontSize: '11px' }}>Standard EMI</span>
                    <strong style={{ color: '#10b981' }}>{formatINR(selectedLoan.emi)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Amount & Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Amount Collected (₹) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="1"
                  step="1"
                  style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '14px', fontWeight: '700' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                  Payment Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  style={{ width: '100%', height: '40px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="CASH">Cash (Field Collection)</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', marginBottom: '6px', fontWeight: '600' }}>
                Field Notes / Reference (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Center #14 morning route collection"
                style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#94a3b8' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Payment directly updates General Ledger, Loan Outstanding & Admin Activity Feed.</span>
            </div>
          </div>

          <div className="emp-modal-footer">
            <button type="button" className="emp-btn-logout" style={{ color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.1)' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="emp-quick-action-emerald">
              <CheckCircle2 size={15} />
              <span>Record & Generate Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
