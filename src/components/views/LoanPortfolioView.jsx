import { useState } from 'react'
import {
  Briefcase,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingDown
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function LoanPortfolioView() {
  const {
    loans,
    metrics,
    setActiveModal,
    setSelectedLoan,
    updateLoanStatus,
    setPrefilledPaymentFreq,
    formatINR,
    searchQuery,
    setSearchQuery
  } = useDashboard()

  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredLoans = loans.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.center?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeCount = loans.filter((l) => l.status === 'Active').length
  const npaCount = loans.filter((l) => l.status === 'NPA').length
  const closedCount = loans.filter((l) => l.status === 'Closed').length

  const handleCollectForLoan = (loan) => {
    setSelectedLoan(loan)
    const rawF = (loan.frequency || 'daily').toLowerCase()
    const normalizedFreq = rawF.includes('week') ? 'weekly' : rawF.includes('month') ? 'monthly' : 'daily'
    setPrefilledPaymentFreq(normalizedFreq)
    setActiveModal('record-payment')
  }

  return (
    <div className="module-view-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-heading">Loan Portfolio Management</h2>
          <p className="module-subtext">
            Active credit books, remaining balances, repayments, and asset classification.
          </p>
        </div>

        <button
          type="button"
          className="btn-action-emerald"
          onClick={() => setActiveModal('record-payment')}
        >
          <Plus size={16} />
          <span>Record Repayment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-blue">
            <Briefcase size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL DISBURSED PORTFOLIO</span>
            <strong className="kpi-value">{formatINR(metrics.totalPortfolio)}</strong>
            <span className="kpi-sub">Across {loans.length} sanctioned loans</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-emerald">
            <TrendingDown size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">OUTSTANDING RECEIVABLE</span>
            <strong className="kpi-value">{formatINR(metrics.outstandingAmount)}</strong>
            <span className="kpi-sub">Principal + interest in field</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-purple">
            <CheckCircle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">ACTIVE PERFORMING LOANS</span>
            <strong className="kpi-value">{activeCount} Loans</strong>
            <span className="kpi-sub text-emerald">Regular daily/weekly repayment</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-rose">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">NPA / AT-RISK RATIO</span>
            <strong className="kpi-value">{metrics.npaRatio.toFixed(1)}%</strong>
            <span className="kpi-sub">{npaCount} accounts defaulted</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="view-filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search by loan ID, borrower, or center..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-field"
          />
        </div>

        <div className="filter-pills-cluster">
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Loans ({loans.length})
          </button>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'Active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Active')}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'NPA' ? 'active' : ''}`}
            onClick={() => setStatusFilter('NPA')}
          >
            NPA ({npaCount})
          </button>
          <button
            type="button"
            className={`btn-filter-pill ${statusFilter === 'Closed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('Closed')}
          >
            Closed ({closedCount})
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="data-table-container">
        <table className="standard-data-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Borrower</th>
              <th>Product</th>
              <th>Center</th>
              <th>Disbursed Date</th>
              <th style={{ textAlign: 'right' }}>Sanctioned</th>
              <th style={{ textAlign: 'right' }}>Outstanding</th>
              <th>EMI Frequency</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan="10" className="table-empty-cell">
                  No loans found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredLoans.map((loan) => (
                <tr key={loan.id}>
                  <td className="font-mono text-dark">{loan.id}</td>
                  <td>
                    <div className="customer-name-block">
                      <strong className="customer-name">{loan.borrowerName}</strong>
                      <span className="customer-sub">{loan.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="product-badge">{loan.product}</span>
                  </td>
                  <td>
                    <span className="center-tag">{loan.center}</span>
                  </td>
                  <td className="text-muted">{loan.disbursedDate}</td>
                  <td className="text-right font-semibold text-dark">
                    {formatINR(loan.principal)}
                  </td>
                  <td className="text-right font-bold font-mono">
                    <span className={loan.outstanding > 0 ? 'text-blue' : 'text-emerald'}>
                      {formatINR(loan.outstanding)}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-dark">
                      {formatINR(loan.emi)}
                    </span>{' '}
                    / {loan.frequency}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        loan.status === 'Active'
                          ? 'status-active'
                          : loan.status === 'NPA'
                          ? 'status-npa'
                          : 'status-closed'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-buttons-group">
                      <button
                        type="button"
                        className="btn-table-action-blue"
                        onClick={() => {
                          setSelectedLoan(loan)
                          setActiveModal('view-loan-schedule')
                        }}
                        title="View authoritative repayment schedule"
                      >
                        Schedule
                      </button>
                      {loan.status === 'Active' && (
                        <>
                          <button
                            type="button"
                            className="btn-table-action-emerald"
                            onClick={() => handleCollectForLoan(loan)}
                            title="Collect installment for this loan"
                          >
                            + Collect
                          </button>
                          <button
                            type="button"
                            className="btn-table-action-warning"
                            onClick={() => updateLoanStatus(loan.id, 'NPA')}
                            title="Flag loan as default / NPA"
                          >
                            Flag NPA
                          </button>
                        </>
                      )}
                      {loan.status === 'NPA' && (
                        <button
                          type="button"
                          className="btn-table-action-blue"
                          onClick={() => updateLoanStatus(loan.id, 'Active')}
                          title="Restore loan back to active"
                        >
                          Restore
                        </button>
                      )}
                      {loan.status === 'Closed' && (
                        <span className="text-muted font-mono" style={{ fontSize: '0.75rem' }}>
                          Settled
                        </span>
                      )}
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
