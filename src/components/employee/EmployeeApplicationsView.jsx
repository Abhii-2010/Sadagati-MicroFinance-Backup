import { useState, useMemo } from 'react'
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Building2,
  Calendar
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeApplicationsView({ onOpenNewApp }) {
  const { branchApplications, currentUser } = useDashboard()
  const [tab, setTab] = useState('ALL')
  const [selectedApp, setSelectedApp] = useState(null)

  const filteredApps = useMemo(() => {
    return branchApplications.filter((a) => {
      if (tab === 'ALL') return true
      if (tab === 'PENDING') return a.status === 'Pending Review' || a.status === 'Submitted'
      if (tab === 'APPROVED') return a.status === 'Approved'
      if (tab === 'REJECTED') return a.status === 'Rejected'
      return true
    })
  }, [branchApplications, tab])

  return (
    <div>
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Branch Loan Applications</h1>
          <p className="emp-page-subtitle">
            Applications originating from <strong>{currentUser?.branch}</strong> ({branchApplications.length} total)
          </p>
        </div>

        <button type="button" className="emp-quick-action-sapphire" onClick={onOpenNewApp}>
          <Plus size={14} />
          <span>+ New Application</span>
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'ALL', label: 'All Applications' },
          { id: 'PENDING', label: 'Pending Admin Review' },
          { id: 'APPROVED', label: 'Approved' },
          { id: 'REJECTED', label: 'Rejected' }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`emp-nav-btn ${tab === t.id ? 'is-active' : ''}`}
            style={{ width: 'auto', padding: '0 14px', height: '36px' }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Applications Table */}
      <div className="emp-card-section" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Borrower</th>
                <th>Product</th>
                <th>Amount</th>
                <th>EMI</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No loan applications found in this tab for {currentUser?.branch}.
                  </td>
                </tr>
              ) : (
                filteredApps.map((a) => (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedApp(a)}>
                    <td>
                      <span className="badge-sapphire">{a.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{a.borrowerName}</strong>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.phone}</div>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{a.product}</td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{formatINR(a.amount)}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981' }}>{formatINR(a.dailyEmi || a.emi || 0)}</strong>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{a.date || 'Recent'}</td>
                    <td>
                      {a.status === 'Approved' ? (
                        <span className="badge-emerald">Approved</span>
                      ) : a.status === 'Rejected' ? (
                        <span className="badge-crimson">Rejected</span>
                      ) : (
                        <span className="badge-amber">Pending Admin Approval</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="emp-btn-icon"
                        style={{ marginLeft: 'auto', width: '30px', height: '30px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedApp(a)
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Status Detail Drawer */}
      {selectedApp && (
        <div className="emp-modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="emp-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div>
                <h3 className="emp-modal-title">Application #{selectedApp.id}</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                  Branch: {selectedApp.branch || currentUser?.branch} • Submitted: {selectedApp.date}
                </p>
              </div>
              <button type="button" className="emp-btn-icon" onClick={() => setSelectedApp(null)}>
                ✕
              </button>
            </div>

            <div className="emp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              {/* Status Banner */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background:
                    selectedApp.status === 'Approved'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : selectedApp.status === 'Rejected'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${
                    selectedApp.status === 'Approved'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : selectedApp.status === 'Rejected'
                      ? 'rgba(239, 68, 68, 0.3)'
                      : 'rgba(245, 158, 11, 0.3)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {selectedApp.status === 'Approved' ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : selectedApp.status === 'Rejected' ? (
                  <XCircle size={18} color="#ef4444" />
                ) : (
                  <Clock size={18} color="#f59e0b" />
                )}
                <div>
                  <div style={{ fontWeight: '700', color: selectedApp.status === 'Approved' ? '#10b981' : selectedApp.status === 'Rejected' ? '#ef4444' : '#f59e0b' }}>
                    Status: {selectedApp.status}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {selectedApp.status === 'Pending Review'
                      ? 'Awaiting underwriting review and signoff from HQ Admin.'
                      : `Updated by Underwriter • Reference #${selectedApp.id}`}
                  </div>
                </div>
              </div>

              {/* Application Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Borrower</span>
                  <strong style={{ color: '#ffffff' }}>{selectedApp.borrowerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Phone</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.phone}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Requested Amount</span>
                  <strong style={{ color: '#10b981', fontSize: '16px' }}>{formatINR(selectedApp.amount)}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>EMI / Installment</span>
                  <strong style={{ color: '#38bdf8' }}>{formatINR(selectedApp.dailyEmi || selectedApp.emi || 0)}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Loan Product</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.product}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Frequency & Tenure</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.frequency} • {selectedApp.tenure}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Submitted By</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.submittedBy || 'Field Officer'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Branch Office</span>
                  <span style={{ color: '#ffffff' }}>{selectedApp.branch || currentUser?.branch}</span>
                </div>
              </div>
            </div>

            <div className="emp-modal-footer">
              <button
                type="button"
                className="emp-quick-action-emerald"
                onClick={() => setSelectedApp(null)}
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
