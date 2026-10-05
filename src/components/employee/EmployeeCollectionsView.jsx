import { useState } from 'react'
import {
  Coins,
  CreditCard,
  Printer,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeCollectionsView({ onOpenRecordPayment, onOpenReceipt }) {
  const { branchPayments, branchMetrics, currentUser } = useDashboard()
  const [search, setSearch] = useState('')

  const filteredPayments = branchPayments.filter((p) => {
    if (!search) return true
    return (
      (p.id && p.id.toLowerCase().includes(search.toLowerCase())) ||
      (p.borrower && p.borrower.toLowerCase().includes(search.toLowerCase())) ||
      (p.loanId && p.loanId.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Branch Daily Collections</h1>
          <p className="emp-page-subtitle">
            Recorded receipts and payment ledgers for <strong>{currentUser?.branch}</strong>
          </p>
        </div>

        <button type="button" className="emp-quick-action-emerald" onClick={onOpenRecordPayment}>
          <CreditCard size={14} />
          <span>+ Record Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="emp-metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
        <div className="emp-stat-card emerald-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">Total Collections</span>
            <Coins size={16} color="#10b981" />
          </div>
          <div className="emp-stat-value">{formatINR(branchMetrics.todayCollected)}</div>
          <div className="emp-stat-subtext">
            <span>Target: {formatINR(branchMetrics.dailyTarget)}</span>
            <span style={{ color: '#10b981' }}>({branchMetrics.achievementPct}%)</span>
          </div>
        </div>

        <div className="emp-stat-card sapphire-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">Cash Collections</span>
            <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: '700' }}>FIELD ROUTE</div>
          </div>
          <div className="emp-stat-value">{formatINR(branchMetrics.cashCollected)}</div>
          <div className="emp-stat-subtext">
            <span>Collected via Physical Field Centers</span>
          </div>
        </div>

        <div className="emp-stat-card sapphire-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">Digital / Online</span>
            <div style={{ color: '#38bdf8', fontSize: '11px', fontWeight: '700' }}>UPI & NEFT</div>
          </div>
          <div className="emp-stat-value">{formatINR(branchMetrics.onlineCollected)}</div>
          <div className="emp-stat-subtext">
            <span>Direct Account / UPI collections</span>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="emp-card-section" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--emp-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="emp-card-title">Receipts History ({filteredPayments.length})</h2>
          <div style={{ width: '260px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search receipt #, borrower..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', height: '32px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0 10px 0 30px', color: '#fff', fontSize: '12px' }}
            />
          </div>
        </div>

        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Borrower</th>
                <th>Loan ID</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Date / Time</th>
                <th>Collected By</th>
                <th style={{ textAlign: 'right' }}>Digital Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No payment collections recorded yet in {currentUser?.branch}.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="badge-sapphire">{p.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{p.borrower}</strong>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{p.loanId}</td>
                    <td>
                      <strong style={{ color: '#10b981', fontSize: '14px' }}>{formatINR(p.amount)}</strong>
                    </td>
                    <td>
                      <span className={p.mode === 'CASH' ? 'badge-amber' : 'badge-emerald'}>
                        {p.mode}
                      </span>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{p.date}</td>
                    <td style={{ color: '#94a3b8' }}>{p.collectedBy || currentUser?.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="emp-quick-action-sapphire"
                        style={{ padding: '4px 10px', fontSize: '11px', marginLeft: 'auto' }}
                        onClick={() => onOpenReceipt(p)}
                      >
                        <Printer size={12} />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
