import { useState } from 'react'
import {
  Search,
  Plus,
  CheckCircle,
  Zap,
  Calendar,
  Clock,
  ArrowRight,
  Receipt
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function CollectionsView() {
  const {
    collectionTracker,
    recentPayments,
    loans,
    setSelectedLoan,
    setActiveModal,
    setPrefilledPaymentFreq,
    quickCollectLoan,
    formatINR,
    searchQuery,
    setSearchQuery
  } = useDashboard()

  const [activeTab, setActiveTab] = useState('due') // 'due' or 'receipts'

  const { daily, weekly, monthly } = collectionTracker

  const dailyPct = daily.expected > 0 ? Math.min(100, Math.round((daily.collected / daily.expected) * 100)) : (daily.collected > 0 ? 100 : 0)
  const weeklyPct = weekly.expected > 0 ? Math.min(100, Math.round((weekly.collected / weekly.expected) * 100)) : (weekly.collected > 0 ? 100 : 0)
  const monthlyPct = monthly.expected > 0 ? Math.min(100, Math.round((monthly.collected / monthly.expected) * 100)) : (monthly.collected > 0 ? 100 : 0)

  // Find first active loan for each frequency for quick collect
  const nextDailyLoan = loans.find((l) => l.status === 'Active' && l.frequency?.toLowerCase() === 'daily')
  const nextWeeklyLoan = loans.find((l) => l.status === 'Active' && l.frequency?.toLowerCase().includes('week'))
  const nextMonthlyLoan = loans.find((l) => l.status === 'Active' && (l.frequency?.toLowerCase().includes('month') || l.frequency?.toLowerCase().includes('quarter')))

  const handleOpenCollectModal = (freq, specificLoan = null) => {
    let target = specificLoan
    if (!target) {
      target = loans.find(
        (l) => l.status === 'Active' && l.frequency?.toLowerCase().includes(freq.toLowerCase())
      )
    }
    if (target) {
      setSelectedLoan(target)
    }
    setPrefilledPaymentFreq(freq)
    setActiveModal('record-payment')
  }

  const handleDirectQuickCollect = (loan) => {
    if (!loan) return
    quickCollectLoan(loan.id, loan.emi)
  }

  // Active loans for Due Schedule
  const activeLoans = loans.filter((l) => l.status === 'Active')

  const filteredReceipts = recentPayments.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.id.toLowerCase().includes(q) ||
      p.borrower?.toLowerCase().includes(q) ||
      p.mode?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="module-view-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-heading">Field Collections & Recovery Hub</h2>
          <p className="module-subtext">
            Track real-time center collections, daily run rates, and field agent receipts.
          </p>
        </div>

        <button
          type="button"
          className="btn-action-emerald"
          onClick={() => handleOpenCollectModal('daily')}
        >
          <Plus size={16} />
          <span>Record Collection</span>
        </button>
      </div>

      {/* Target vs Achieved Progress Cards */}
      <div className="collections-progress-grid">
        {/* Daily card */}
        <div className="collection-progress-card border-daily">
          <div className="card-top-row">
            <div>
              <span className="tracker-category-name daily-title">DAILY LOANS TARGET</span>
              <span className="tracker-loan-badge">{daily.loanCount || 1} Active loans</span>
            </div>
            <div className="card-actions-duo">
              {nextDailyLoan && (
                <button
                  type="button"
                  className="btn-card-quick-zap"
                  onClick={() => handleDirectQuickCollect(nextDailyLoan)}
                  title={`1-Click Instant Collect ₹${nextDailyLoan.emi} from ${nextDailyLoan.borrowerName}`}
                >
                  <Zap size={11} /> 1-Click ₹{nextDailyLoan.emi}
                </button>
              )}
              <button
                type="button"
                className="btn-col-quick-add"
                onClick={() => handleOpenCollectModal('daily', nextDailyLoan)}
                title="Open collection modal"
              >
                <Plus size={13} /> Collect
              </button>
            </div>
          </div>

          <div className="progress-amount-row">
            <div className="stat-group">
              <span className="stat-label">Collected</span>
              <strong className="stat-number text-emerald">{formatINR(daily.collected)}</strong>
            </div>
            <div className="stat-group text-right">
              <span className="stat-label">Target</span>
              <span className="stat-number-muted">{formatINR(daily.expected)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-track">
            <div className="progress-fill fill-emerald" style={{ width: `${dailyPct}%` }} />
          </div>
          <div className="progress-footer-row">
            <span className="remaining-alert">Remaining: {formatINR(daily.remaining)}</span>
            <span className="pct-tag">{dailyPct}% Achieved</span>
          </div>
        </div>

        {/* Weekly card */}
        <div className="collection-progress-card border-weekly">
          <div className="card-top-row">
            <div>
              <span className="tracker-category-name weekly-title">WEEKLY LOANS TARGET</span>
              <span className="tracker-loan-badge">{weekly.loanCount || 1} Active loans</span>
            </div>
            <div className="card-actions-duo">
              {nextWeeklyLoan && (
                <button
                  type="button"
                  className="btn-card-quick-zap"
                  onClick={() => handleDirectQuickCollect(nextWeeklyLoan)}
                  title={`1-Click Instant Collect ₹${nextWeeklyLoan.emi} from ${nextWeeklyLoan.borrowerName}`}
                >
                  <Zap size={11} /> 1-Click ₹{nextWeeklyLoan.emi}
                </button>
              )}
              <button
                type="button"
                className="btn-col-quick-add"
                onClick={() => handleOpenCollectModal('weekly', nextWeeklyLoan)}
                title="Open collection modal prefilled with Weekly loan"
              >
                <Plus size={13} /> Collect
              </button>
            </div>
          </div>

          <div className="progress-amount-row">
            <div className="stat-group">
              <span className="stat-label">Collected</span>
              <strong className="stat-number text-emerald">{formatINR(weekly.collected)}</strong>
            </div>
            <div className="stat-group text-right">
              <span className="stat-label">Target</span>
              <span className="stat-number-muted">{formatINR(weekly.expected)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-track">
            <div className="progress-fill fill-blue" style={{ width: `${weeklyPct}%` }} />
          </div>
          <div className="progress-footer-row">
            <span className="remaining-alert">Remaining: {formatINR(weekly.remaining)}</span>
            <span className="pct-tag">{weeklyPct}% Achieved</span>
          </div>
        </div>

        {/* Monthly card */}
        <div className="collection-progress-card border-monthly">
          <div className="card-top-row">
            <div>
              <span className="tracker-category-name monthly-title">MONTHLY LOANS TARGET</span>
              <span className="tracker-loan-badge">{monthly.loanCount || 1} Active loans</span>
            </div>
            <div className="card-actions-duo">
              {nextMonthlyLoan && (
                <button
                  type="button"
                  className="btn-card-quick-zap"
                  onClick={() => handleDirectQuickCollect(nextMonthlyLoan)}
                  title={`1-Click Instant Collect ₹${nextMonthlyLoan.emi} from ${nextMonthlyLoan.borrowerName}`}
                >
                  <Zap size={11} /> 1-Click ₹{nextMonthlyLoan.emi}
                </button>
              )}
              <button
                type="button"
                className="btn-col-quick-add"
                onClick={() => handleOpenCollectModal('monthly', nextMonthlyLoan)}
                title="Open collection modal prefilled with Monthly loan"
              >
                <Plus size={13} /> Collect
              </button>
            </div>
          </div>

          <div className="progress-amount-row">
            <div className="stat-group">
              <span className="stat-label">Collected</span>
              <strong className="stat-number text-emerald">{formatINR(monthly.collected)}</strong>
            </div>
            <div className="stat-group text-right">
              <span className="stat-label">Target</span>
              <span className="stat-number-muted">{formatINR(monthly.expected)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-track">
            <div className="progress-fill fill-purple" style={{ width: `${monthlyPct}%` }} />
          </div>
          <div className="progress-footer-row">
            <span className="remaining-alert">Remaining: {formatINR(monthly.remaining)}</span>
            <span className="pct-tag">{monthlyPct}% Achieved</span>
          </div>
        </div>
      </div>

      {/* Tabs: Active Installments Due vs Receipts Ledger */}
      <div className="collections-tab-bar">
        <button
          type="button"
          className={`collections-tab-btn ${activeTab === 'due' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('due')}
        >
          <Zap size={14} />
          <span>Due Collections Schedule ({activeLoans.length})</span>
        </button>
        <button
          type="button"
          className={`collections-tab-btn ${activeTab === 'receipts' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          <Receipt size={14} />
          <span>Collection Receipts Ledger ({filteredReceipts.length})</span>
        </button>
      </div>

      {/* TAB 1: Due Collections Schedule */}
      {activeTab === 'due' && (
        <div className="data-table-container">
          <div className="table-header-bar">
            <div>
              <h3 className="section-title">Field Center Due Installments</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Collect scheduled field installments with 1-click or record custom amounts.
              </span>
            </div>
          </div>

          <table className="standard-data-table">
            <thead>
              <tr>
                <th>Borrower & Center</th>
                <th>Loan Reference</th>
                <th>Schedule</th>
                <th>Scheduled Due EMI</th>
                <th>Loan Balance</th>
                <th style={{ textAlign: 'right' }}>Quick Collect Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeLoans.map((l) => {
                const f = (l.frequency || 'Daily').toLowerCase()
                const badgeClass = f.includes('week') ? 'badge-blue' : f.includes('month') ? 'badge-purple' : 'badge-emerald'

                return (
                  <tr key={l.id}>
                    <td>
                      <div className="font-semibold text-dark">{l.borrowerName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{l.center || 'Center #14 (Pragati)'}</div>
                    </td>
                    <td className="font-mono text-muted">{l.id}</td>
                    <td>
                      <span className={`status-pill ${badgeClass}`}>
                        {l.frequency || 'Daily'}
                      </span>
                    </td>
                    <td className="font-bold text-dark font-mono">
                      {formatINR(l.emi || 100)}
                    </td>
                    <td className="font-mono text-muted">
                      {formatINR(l.outstanding)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn-table-zap"
                          onClick={() => handleDirectQuickCollect(l)}
                          title={`Collect ₹${l.emi} directly`}
                        >
                          <Zap size={12} /> Collect ₹{l.emi}
                        </button>
                        <button
                          type="button"
                          className="btn-table-custom"
                          onClick={() => handleOpenCollectModal(l.frequency, l)}
                          title="Open modal for custom amount or payment mode"
                        >
                          Custom
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Collection Receipts Table */}
      {activeTab === 'receipts' && (
        <div className="data-table-container">
          <div className="table-header-bar">
            <h3 className="section-title">Collection Transaction Receipts</h3>
            <div className="search-input-wrapper-sm">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search receipt, borrower..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-field-sm"
              />
            </div>
          </div>

          <table className="standard-data-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Borrower</th>
                <th>Loan Reference</th>
                <th>Mode</th>
                <th>Collection Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Collected Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty-cell">
                    No collection receipts recorded.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => (
                  <tr key={rec.id}>
                    <td className="font-mono text-dark">{rec.id}</td>
                    <td className="font-semibold">{rec.borrower}</td>
                    <td className="font-mono text-muted">{rec.loanId || 'LN90281'}</td>
                    <td>
                      <span className={`mode-badge ${rec.mode?.toLowerCase()}`}>{rec.mode}</span>
                    </td>
                    <td className="text-muted">{rec.date}</td>
                    <td>
                      <span className="status-success-badge">
                        <CheckCircle size={12} /> Success
                      </span>
                    </td>
                    <td className="text-right font-bold text-dark font-mono">
                      {formatINR(rec.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
