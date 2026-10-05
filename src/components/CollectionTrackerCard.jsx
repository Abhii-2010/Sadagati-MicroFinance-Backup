import { useDashboard } from '../context/DashboardContext'
import { Plus } from 'lucide-react'

export default function CollectionTrackerCard() {
  const {
    collectionTracker,
    formatINR,
    setActiveModal,
    setPrefilledPaymentFreq,
    setSelectedLoan,
    loans
  } = useDashboard()

  const { daily, weekly, monthly } = collectionTracker

  const handleQuickCollect = (freq) => {
    const matchingLoan = loans.find(
      (l) => l.status === 'Active' && l.frequency?.toLowerCase().includes(freq.toLowerCase())
    )
    if (matchingLoan) {
      setSelectedLoan(matchingLoan)
    }
    setPrefilledPaymentFreq(freq)
    setActiveModal('record-payment')
  }

  return (
    <div className="card-box collection-tracker-card">
      <div className="card-header-with-action">
        <h3 className="card-title">Collection Tracker — Today</h3>
        <button
          type="button"
          className="btn-header-action-emerald"
          onClick={() => handleQuickCollect('daily')}
        >
          + Collect Today
        </button>
      </div>

      <div className="tracker-columns-grid">
        {/* DAILY LOANS */}
        <div className="tracker-col tracker-daily">
          <div className="tracker-col-header">
            <div>
              <span className="tracker-category-name daily-title">DAILY LOANS</span>
              <span className="tracker-loan-badge">{daily.loanCount} loans</span>
            </div>
            <button
              type="button"
              className="btn-col-quick-add"
              onClick={() => handleQuickCollect('daily')}
              title="Collect Daily Installment"
            >
              <Plus size={13} /> Collect
            </button>
          </div>

          <div className="tracker-stats-group">
            <div className="tracker-stat-row">
              <span className="stat-label">Expected Today</span>
              <span className="stat-value">{formatINR(daily.expected)}</span>
            </div>
            <div className="tracker-stat-row">
              <span className="stat-label">Collected Today</span>
              <span className="stat-value text-emerald font-bold">{formatINR(daily.collected)}</span>
            </div>
          </div>

          <div className="tracker-footer-row">
            <span className="remaining-alert">
              Remaining: {formatINR(daily.remaining)}
            </span>
          </div>
        </div>

        {/* WEEKLY LOANS */}
        <div className="tracker-col tracker-weekly">
          <div className="tracker-col-header">
            <div>
              <span className="tracker-category-name weekly-title">WEEKLY LOANS</span>
              <span className="tracker-loan-badge">{weekly.loanCount} loans</span>
            </div>
            <button
              type="button"
              className="btn-col-quick-add"
              onClick={() => handleQuickCollect('weekly')}
              title="Collect Weekly Installment"
            >
              <Plus size={13} /> Collect
            </button>
          </div>

          <div className="tracker-stats-group">
            <div className="tracker-stat-row">
              <span className="stat-label">Expected This Week</span>
              <span className="stat-value">{formatINR(weekly.expected)}</span>
            </div>
            <div className="tracker-stat-row">
              <span className="stat-label">Collected This Week</span>
              <span className="stat-value text-emerald font-bold">{formatINR(weekly.collected)}</span>
            </div>
          </div>

          <div className="tracker-footer-row">
            <span className="remaining-alert">
              Remaining: {formatINR(weekly.remaining)}
            </span>
          </div>
        </div>

        {/* MONTHLY LOANS */}
        <div className="tracker-col tracker-monthly">
          <div className="tracker-col-header">
            <div>
              <span className="tracker-category-name monthly-title">MONTHLY LOANS</span>
              <span className="tracker-loan-badge">{monthly.loanCount} loans</span>
            </div>
            <button
              type="button"
              className="btn-col-quick-add"
              onClick={() => handleQuickCollect('monthly')}
              title="Collect Monthly Installment"
            >
              <Plus size={13} /> Collect
            </button>
          </div>

          <div className="tracker-stats-group">
            <div className="tracker-stat-row">
              <span className="stat-label">Expected This Month</span>
              <span className="stat-value">{formatINR(monthly.expected)}</span>
            </div>
            <div className="tracker-stat-row">
              <span className="stat-label">Collected This Month</span>
              <span className="stat-value text-emerald font-bold">{formatINR(monthly.collected)}</span>
            </div>
          </div>

          <div className="tracker-footer-row">
            <span className="remaining-alert">
              Remaining: {formatINR(monthly.remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

