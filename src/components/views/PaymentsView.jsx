import { useState } from 'react'
import {
  CreditCard,
  Search,
  Plus,
  Download,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function PaymentsView() {
  const {
    recentPayments,
    setActiveModal,
    formatINR,
    searchQuery,
    setSearchQuery
  } = useDashboard()

  const [modeFilter, setModeFilter] = useState('ALL')

  const filteredPayments = recentPayments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.borrower?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.loanId?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMode = modeFilter === 'ALL' || p.mode === modeFilter
    return matchesSearch && matchesMode
  })

  const totalCollectedSum = recentPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const cashPayments = recentPayments.filter((p) => p.mode === 'CASH').length
  const upiPayments = recentPayments.filter((p) => p.mode === 'UPI').length

  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Borrower', 'Loan ID', 'Payment Mode', 'Date', 'Status', 'Amount']
    const rows = filteredPayments.map((p) => [
      p.id,
      `"${p.borrower}"`,
      p.loanId || '',
      p.mode,
      p.date,
      p.status,
      p.amount
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `sadagati-payment-receipts-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="module-view-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-heading">Payment Receipts & Collection Ledger</h2>
          <p className="module-subtext">
            Comprehensive audit record of all cash, UPI, and digital loan repayments.
          </p>
        </div>

        <div className="header-actions-group">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportCSV}
            title="Download receipts as CSV spreadsheet"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn-action-emerald"
            onClick={() => setActiveModal('record-payment')}
          >
            <Plus size={16} />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-blue">
            <CreditCard size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL PAYMENTS VOLUME</span>
            <strong className="kpi-value">{formatINR(totalCollectedSum)}</strong>
            <span className="kpi-sub">Lifetime logged transactions</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-emerald">
            <FileSpreadsheet size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TRANSACTION RECEIPTS</span>
            <strong className="kpi-value">{recentPayments.length} Receipts</strong>
            <span className="kpi-sub">100% Reconciliation accuracy</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-purple">
            <CheckCircle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">CASH TRANSACTIONS</span>
            <strong className="kpi-value">{cashPayments} Deposits</strong>
            <span className="kpi-sub">Field physical cash collection</span>
          </div>
        </div>

        <div className="module-kpi-card">
          <div className="kpi-icon-wrap icon-soft-amber">
            <CreditCard size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">DIGITAL / UPI RATIO</span>
            <strong className="kpi-value">
              {Math.round((upiPayments / (recentPayments.length || 1)) * 100)}%
            </strong>
            <span className="kpi-sub text-blue">{upiPayments} UPI Deposits</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="view-filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search by receipt ID, borrower name, or loan ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-field"
          />
        </div>

        <div className="filter-pills-cluster">
          {['ALL', 'CASH', 'UPI', 'NEFT'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`btn-filter-pill ${modeFilter === mode ? 'active' : ''}`}
              onClick={() => setModeFilter(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <table className="standard-data-table">
          <thead>
            <tr>
              <th>Receipt ID</th>
              <th>Borrower</th>
              <th>Loan Reference</th>
              <th>Mode</th>
              <th>Deposit Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty-cell">
                  No payment transactions found matching the filter.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td className="font-mono text-dark">{p.id}</td>
                  <td>
                    <strong className="customer-name">{p.borrower}</strong>
                  </td>
                  <td className="font-mono text-muted">{p.loanId || 'LN90281'}</td>
                  <td>
                    <span className={`mode-badge ${p.mode.toLowerCase()}`}>{p.mode}</span>
                  </td>
                  <td className="text-muted">{p.date}</td>
                  <td>
                    <span className="status-success-badge">
                      <CheckCircle size={12} /> {p.status}
                    </span>
                  </td>
                  <td className="text-right font-bold text-dark font-mono">
                    {formatINR(p.amount)}
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
