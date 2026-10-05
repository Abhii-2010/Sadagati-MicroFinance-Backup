import { useState } from 'react'
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function LoanApplicationsView() {
  const {
    pendingApprovals,
    setActiveModal,
    setSelectedApplication,
    approveApplication,
    rejectApplication,
    formatINR,
    searchQuery,
    setSearchQuery
  } = useDashboard()

  const [tabFilter, setTabFilter] = useState('PENDING')

  const filteredApps = pendingApprovals.filter((app) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      app.id.toLowerCase().includes(q) ||
      app.borrowerName.toLowerCase().includes(q) ||
      app.center?.toLowerCase().includes(q) ||
      app.product?.toLowerCase().includes(q)
    )
  })

  const totalRequested = pendingApprovals.reduce((sum, a) => sum + (a.amount || 0), 0)

  return (
    <div className="module-view-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-heading">Loan Underwriting & Applications</h2>
          <p className="module-subtext">
            Credit appraisals, KYC validation, and instant disbursement triggers.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setActiveModal('new-application')}
        >
          <Plus size={16} />
          <span>New Application</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-amber">
            <Clock size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">PENDING REVIEW</span>
            <strong className="kpi-value">{pendingApprovals.length}</strong>
            <span className="kpi-sub">Awaiting credit approval</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-blue">
            <FileText size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">REQUESTED CAPITAL</span>
            <strong className="kpi-value">{formatINR(totalRequested)}</strong>
            <span className="kpi-sub">Under active pipeline</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-emerald">
            <CheckCircle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">AUTO-ELIGIBILITY RATE</span>
            <strong className="kpi-value">94.2%</strong>
            <span className="kpi-sub text-emerald">High Credit Readiness</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-purple">
            <AlertCircle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">AVG PROCESSING TIME</span>
            <strong className="kpi-value">12 Mins</strong>
            <span className="kpi-sub">Paperless digital underwriting</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="view-filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search applications by borrower, ID, or center..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-field"
          />
        </div>

        <div className="filter-pills-cluster">
          <button
            type="button"
            className={`btn-filter-pill ${tabFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setTabFilter('PENDING')}
          >
            Pending Review ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-container">
        <table className="standard-data-table">
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Applicant</th>
              <th>Product</th>
              <th>Tenure</th>
              <th>Frequency & EMI</th>
              <th>Center</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="9" className="table-empty-cell">
                  No applications currently pending review. Click "+ New Application" to add one!
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id}>
                  <td className="font-mono text-dark">{app.id}</td>
                  <td>
                    <div className="customer-name-block">
                      <strong className="customer-name">{app.borrowerName}</strong>
                      <span className="customer-sub">{app.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="product-badge">{app.product}</span>
                  </td>
                  <td>{app.tenure}</td>
                  <td>
                    <span className="font-semibold text-dark">
                      {formatINR(app.dailyEmi || app.emi)}
                    </span>{' '}
                    / {app.frequency}
                  </td>
                  <td>
                    <span className="center-tag">{app.center}</span>
                  </td>
                  <td className="text-right font-bold text-blue font-mono">
                    {formatINR(app.amount)}
                  </td>
                  <td>
                    <span className="status-pending-pill">
                      <Clock size={11} /> {app.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="btn-table-action-blue"
                        onClick={() => {
                          setSelectedApplication(app)
                          setActiveModal('review-app')
                        }}
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        className="btn-table-action-emerald"
                        onClick={() => approveApplication(app.id)}
                        title="1-click approve and disburse"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn-table-action-danger"
                        onClick={() => rejectApplication(app.id)}
                        title="Reject application"
                      >
                        Reject
                      </button>
                    </div>
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
