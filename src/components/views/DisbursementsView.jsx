import { Send, Search, CheckCircle, Building2, CreditCard } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function DisbursementsView() {
  const { disbursements, formatINR, searchQuery, setSearchQuery } = useDashboard()

  const filteredDisb = disbursements.filter((d) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      d.id.toLowerCase().includes(q) ||
      d.borrowerName.toLowerCase().includes(q) ||
      d.loanId.toLowerCase().includes(q)
    )
  })

  const totalDisbursed = disbursements.reduce((sum, d) => sum + (d.amount || 0), 0)

  return (
    <div className="module-view-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-heading">Loan Disbursements Ledger</h2>
          <p className="module-subtext">
            Audit history of capital transferred to approved borrower accounts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-emerald">
            <Send size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL DISBURSED CAPITAL</span>
            <strong className="kpi-value">{formatINR(totalDisbursed)}</strong>
            <span className="kpi-sub">Transferred to borrowers</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-blue">
            <Building2 size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">DISBURSED LOANS</span>
            <strong className="kpi-value">{disbursements.length} Loans</strong>
            <span className="kpi-sub">100% Account verification</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-purple">
            <CreditCard size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">PRIMARY CHANNEL</span>
            <strong className="kpi-value">Direct Bank NEFT</strong>
            <span className="kpi-sub">Instant NPCI settling</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="view-filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search by disbursement ID, borrower, or loan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-field"
          />
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="standard-data-table">
          <thead>
            <tr>
              <th>Disbursement ID</th>
              <th>Loan Reference</th>
              <th>Borrower Name</th>
              <th>Transfer Channel</th>
              <th>Disbursement Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Disbursed Capital</th>
            </tr>
          </thead>
          <tbody>
            {filteredDisb.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-cell">
                  No disbursement records found.
                </td>
              </tr>
            ) : (
              filteredDisb.map((d) => (
                <tr key={d.id}>
                  <td className="font-mono text-dark">{d.id}</td>
                  <td className="font-mono text-muted">{d.loanId}</td>
                  <td>
                    <strong className="customer-name">{d.borrowerName}</strong>
                  </td>
                  <td>
                    <span className="mode-badge upi">{d.channel}</span>
                  </td>
                  <td className="text-muted">{d.date}</td>
                  <td>
                    <span className="status-success-badge">
                      <CheckCircle size={12} /> {d.status}
                    </span>
                  </td>
                  <td className="text-right font-bold text-dark font-mono">
                    {formatINR(d.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
