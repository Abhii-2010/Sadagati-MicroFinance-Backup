import { Printer, Download, CheckCircle2, X } from 'lucide-react'
import { formatINR } from '../../utils/formatters'

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="emp-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="emp-modal-header" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="emp-modal-title" style={{ fontSize: '16px' }}>Official Payment Receipt</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>Sadagati MicroFinance Core Ledger</p>
            </div>
          </div>
          <button type="button" className="emp-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="emp-modal-body" style={{ padding: '24px' }}>
          {/* Amount Hero */}
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Amount Collected
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', letterSpacing: '-0.02em' }}>
              {formatINR(receipt.amount || 0)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Mode: <strong style={{ color: '#e2e8f0' }}>{receipt.mode || 'CASH'}</strong> • Status: <strong style={{ color: '#34d399' }}>SUCCESS</strong>
            </div>
          </div>

          {/* Key-Value Details Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#94a3b8' }}>Receipt Number</span>
              <strong style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '13px' }}>{receipt.id}</strong>
            </div>

            {receipt.referenceNo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: '#94a3b8' }}>Transaction Ref</span>
                <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{receipt.referenceNo}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#94a3b8' }}>Customer / Borrower</span>
              <strong style={{ color: '#ffffff' }}>{receipt.borrower || receipt.borrowerName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#94a3b8' }}>Loan Account</span>
              <strong style={{ color: '#38bdf8' }}>{receipt.loanId}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#94a3b8' }}>Branch</span>
              <span style={{ color: '#ffffff' }}>{receipt.branch || 'Jaipur Central Branch'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#94a3b8' }}>Collected By</span>
              <span style={{ color: '#ffffff' }}>{receipt.collectedBy || 'Staff'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <span style={{ color: '#94a3b8' }}>Date & Time</span>
              <span style={{ color: '#e2e8f0' }}>{receipt.date} {receipt.time || ''}</span>
            </div>
          </div>

          {/* Legal / NBFC note */}
          <div style={{ marginTop: '20px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: 1.4 }}>
            System generated computer receipt • Sadagati Microfinance Ltd • RBI NBFC-MFI
          </div>
        </div>

        <div className="emp-modal-footer">
          <button
            type="button"
            className="emp-quick-action-sapphire"
            onClick={handlePrint}
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            className="emp-quick-action-emerald"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
