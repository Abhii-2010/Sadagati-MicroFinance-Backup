import { Check } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function RecentPaymentsCard() {
  const { recentPayments, setActiveModal, formatINR, searchQuery } = useDashboard()

  const handleViewAll = () => {
    setActiveModal('view-all-payments')
  }

  const filteredPayments = recentPayments.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.id.toLowerCase().includes(q) ||
      p.borrower?.toLowerCase().includes(q) ||
      p.mode?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="card-box recent-payments-card">
      <div className="card-header-with-action">
        <div className="card-title-group">
          <h3 className="card-title">Recent Payments</h3>
          <span className="count-pill">{recentPayments.length}</span>
        </div>
        <div className="card-header-actions-duo">
          <button
            type="button"
            className="btn-header-action-emerald"
            onClick={() => setActiveModal('record-payment')}
            title="Record payment"
          >
            + Add Payment
          </button>
          <button
            type="button"
            className="link-view-all"
            onClick={handleViewAll}
          >
            View All
          </button>
        </div>
      </div>

      <div className="payments-list">
        {filteredPayments.length === 0 ? (
          <div className="empty-state-card">
            <span>No payment records found</span>
          </div>
        ) : (
          filteredPayments.slice(0, 5).map((payment) => (
            <div key={payment.id} className="payment-row-item">
              <div className="payment-left-col">
                <div className="payment-status-icon">
                  <Check size={13} strokeWidth={2.6} className="check-svg" />
                </div>
                <div className="payment-meta-group">
                  <div className="payment-id">{payment.id}</div>
                  <div className="payment-mode-label">{payment.mode}</div>
                </div>
              </div>

              <div className="payment-right-col">
                <div className="payment-amount">{formatINR(payment.amount)}</div>
                <div className="payment-date">{payment.date}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
