import { useState, useMemo } from 'react'
import {
  Briefcase,
  Search,
  CreditCard,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeLoansView({ onSelectLoanForPayment }) {
  const { branchLoans, currentUser } = useDashboard()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedLoan, setSelectedLoan] = useState(null)

  const filteredLoans = useMemo(() => {
    return branchLoans.filter((l) => {
      const matchSearch =
        !search ||
        (l.id && l.id.toLowerCase().includes(search.toLowerCase())) ||
        (l.borrowerName && l.borrowerName.toLowerCase().includes(search.toLowerCase()))

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && l.status === 'Active') ||
        (statusFilter === 'CLOSED' && l.status === 'Closed') ||
        (statusFilter === 'OVERDUE' && (l.status === 'NPA' || (l.overdueDays && l.overdueDays > 0)))

      return matchSearch && matchStatus
    })
  }, [branchLoans, search, statusFilter])

  return (
    <div>
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Branch Loan Portfolio</h1>
          <p className="emp-page-subtitle">
            Active loans belonging to <strong>{currentUser?.branch}</strong> ({filteredLoans.length} total)
          </p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by Loan ID (LN...) or Borrower Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: '38px', background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0 12px 0 36px', color: '#fff', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'ACTIVE', 'OVERDUE', 'CLOSED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`emp-nav-btn ${statusFilter === st ? 'is-active' : ''}`}
              style={{ width: 'auto', padding: '0 12px', height: '38px' }}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Loans' : st === 'ACTIVE' ? 'Active' : st === 'OVERDUE' ? 'Overdue' : 'Closed'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="emp-card-section" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Borrower</th>
                <th>Product</th>
                <th>Disbursed Principal</th>
                <th>Current Outstanding</th>
                <th>EMI</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No loans found matching filter for {currentUser?.branch}.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => (
                  <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLoan(l)}>
                    <td>
                      <span className="badge-sapphire">{l.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{l.borrowerName}</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{l.phone}</div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{l.product}</td>
                    <td>
                      <span style={{ color: '#e2e8f0' }}>{formatINR(l.principal)}</span>
                    </td>
                    <td>
                      <strong style={{ color: l.outstanding > 0 ? '#f59e0b' : '#10b981' }}>
                        {formatINR(l.outstanding)}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981' }}>{formatINR(l.emi || 100)}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                        {l.frequency || 'Daily'}
                      </span>
                    </td>
                    <td>
                      {l.status === 'Closed' ? (
                        <span className="badge-sapphire">Closed</span>
                      ) : l.status === 'NPA' ? (
                        <span className="badge-crimson">NPA</span>
                      ) : (
                        <span className="badge-emerald">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {l.status === 'Active' && (
                          <button
                            type="button"
                            className="emp-quick-action-emerald"
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              onSelectLoanForPayment(l.id)
                            }}
                          >
                            <CreditCard size={12} />
                            <span>Collect</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="emp-btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLoan(l)
                          }}
                        >
                          <Eye size={13} />
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

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="emp-modal-backdrop" onClick={() => setSelectedLoan(null)}>
          <div className="emp-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div>
                <h3 className="emp-modal-title">Loan Details: {selectedLoan.id}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  Borrower: <strong style={{ color: '#ffffff' }}>{selectedLoan.borrowerName}</strong> • {selectedLoan.branch || currentUser?.branch}
                </p>
              </div>
              <button type="button" className="emp-btn-icon" onClick={() => setSelectedLoan(null)}>
                ✕
              </button>
            </div>

            <div className="emp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Disbursed</span>
                  <strong style={{ color: '#ffffff' }}>{formatINR(selectedLoan.principal)}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Outstanding</span>
                  <strong style={{ color: selectedLoan.outstanding > 0 ? '#f59e0b' : '#10b981' }}>
                    {formatINR(selectedLoan.outstanding)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Installment (EMI)</span>
                  <strong style={{ color: '#10b981' }}>{formatINR(selectedLoan.emi)}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Product Name</span>
                  <span style={{ color: '#ffffff' }}>{selectedLoan.product}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Frequency</span>
                  <span style={{ color: '#ffffff' }}>{selectedLoan.frequency}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Disbursed Date</span>
                  <span style={{ color: '#ffffff' }}>{selectedLoan.disbursedDate || 'Active'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Assigned Center</span>
                  <span style={{ color: '#ffffff' }}>{selectedLoan.center || 'Pragati Center'}</span>
                </div>
              </div>
            </div>

            <div className="emp-modal-footer">
              {selectedLoan.status === 'Active' && (
                <button
                  type="button"
                  className="emp-quick-action-emerald"
                  onClick={() => {
                    const lId = selectedLoan.id
                    setSelectedLoan(null)
                    onSelectLoanForPayment(lId)
                  }}
                >
                  <CreditCard size={14} />
                  <span>Collect Payment Now</span>
                </button>
              )}
              <button
                type="button"
                className="emp-btn-logout"
                style={{ color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                onClick={() => setSelectedLoan(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
