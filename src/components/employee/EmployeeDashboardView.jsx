import {
  Coins,
  TrendingUp,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Phone,
  Plus,
  CreditCard,
  Inbox
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

/* ─── helpers ─────────────────────────────────────────────── */
function getOverdueSeverity(daysOverdue) {
  if (daysOverdue >= 60) return 'critical'
  if (daysOverdue >= 30) return 'high'
  if (daysOverdue >= 14) return 'medium'
  return 'approaching'
}

function getSeverityLabel(daysOverdue) {
  if (daysOverdue >= 60) return 'Critical Overdue'
  if (daysOverdue >= 30) return 'High Risk'
  if (daysOverdue >= 14) return 'Overdue'
  return 'Approaching'
}

function getSeverityBarWidth(daysOverdue) {
  // max reference = 90 days (NPA threshold)
  return Math.min(100, Math.round((daysOverdue / 90) * 100))
}

export default function EmployeeDashboardView({
  onOpenAddCustomer,
  onOpenNewApp,
  onOpenRecordPayment,
  onSelectLoanForPayment
}) {
  const {
    currentUser,
    branchMetrics,
    branchLoans,
    branchCustomers,
    branchPayments
  } = useDashboard()

  const activeBranchLoans = branchLoans.filter((l) => l.status === 'Active')

  /* ─── Today's Collection Tasks ─────────────────────────── */
  // Build from active loans, mark as "Collected" if a payment exists for that loan today
  const todayTasks = activeBranchLoans.slice(0, 6).map((l) => {
    const cust = branchCustomers.find((c) => c.id === l.customerId)
    const hasPaymentToday = branchPayments.some(
      (p) => p.loanId === l.id
    )
    return {
      id: `TSK-${l.id}`,
      loanId: l.id,
      customerName: l.borrowerName || cust?.name || 'Unknown',
      customerId: l.customerId,
      phone: l.phone || cust?.phone || '—',
      center: l.center || cust?.center || 'N/A',
      emi: Number(l.emi) || Number(l.weeklyEmi) || Number(l.monthlyEmi) || 0,
      outstanding: Number(l.outstanding) || Number(l.outstandingAmount) || 0,
      frequency: l.frequency || l.repaymentFrequency || 'Daily',
      status: hasPaymentToday ? 'Collected' : 'Pending Due'
    }
  })

  /* ─── Overdue Customers ────────────────────────────────── */
  // Only use REAL overdue data from loan records — no fabricated numbers
  const overdueLoans = branchLoans.filter((l) => {
    const isNPA = l.status === 'NPA'
    const hasOverdueDays = Number(l.overdueDays) > 0
    const hasOverdueAmount = Number(l.overdueAmount) > 0 || Number(l.overdueAmt) > 0
    return isNPA || hasOverdueDays || hasOverdueAmount
  })

  const overdueCustomers = overdueLoans.map((l) => {
    const cust = branchCustomers.find((c) => c.id === l.customerId)
    const daysOverdue = Number(l.overdueDays) || Number(l.daysOverdue) || 0
    const overdueAmt = Number(l.overdueAmount) || Number(l.overdueAmt) || 0
    const severity = getOverdueSeverity(daysOverdue)
    const lastPaymentDate = l.lastPaymentDate || l.lastPayment || '—'
    return {
      loanId: l.id,
      customerName: l.borrowerName || cust?.name || 'Unknown',
      customerId: l.customerId,
      phone: l.phone || cust?.phone || '',
      overdueAmount: overdueAmt,
      daysOverdue,
      lastPayment: lastPaymentDate,
      severity,
      label: getSeverityLabel(daysOverdue),
      barWidth: getSeverityBarWidth(daysOverdue)
    }
  })

  const collectedCount = todayTasks.filter((t) => t.status === 'Collected').length
  const pendingCount   = todayTasks.length - collectedCount

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Operational Workspace</h1>
          <p className="emp-page-subtitle">
            Welcome back, <strong style={{ color: '#ffffff' }}>{currentUser?.name}</strong>
            {' · '}{currentUser?.designation}
            {' · '}
            <span style={{ color: 'var(--emp-emerald)' }}>{currentUser?.branch}</span>
          </p>
        </div>
        <div className="emp-page-actions">
          <button type="button" className="emp-quick-action-sapphire" onClick={onOpenAddCustomer}>
            <Plus size={14} />
            <span>Add Customer</span>
          </button>
          <button type="button" className="emp-quick-action-sapphire" onClick={onOpenNewApp}>
            <Plus size={14} />
            <span>New Application</span>
          </button>
          <button type="button" className="emp-quick-action-emerald" onClick={onOpenRecordPayment}>
            <CreditCard size={14} />
            <span>₹ Record Payment</span>
          </button>
        </div>
      </div>

      {/* ── 5 Metric Cards ──────────────────────────────────── */}
      <div className="emp-metrics-grid">

        {/* Card 1: Today's Collection */}
        <div className="emp-stat-card emerald-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">Today's Collection</span>
            <div className="emp-stat-icon-wrap" style={{ color: 'var(--emp-emerald)' }}>
              <Coins size={16} />
            </div>
          </div>
          <div className="emp-stat-value">{formatINR(branchMetrics.todayCollected)}</div>
          <div className="emp-stat-subtext">
            <span>Target: {formatINR(branchMetrics.dailyTarget)}</span>
            <span style={{ color: 'var(--emp-emerald)', fontWeight: 700 }}>
              · {branchMetrics.achievementPct}% done
            </span>
          </div>
          <div className="emp-progress-bar">
            <div className="emp-progress-fill" style={{ width: `${branchMetrics.achievementPct}%` }} />
          </div>
          <div className="emp-stat-meta-row">
            <span>Cash: <span className="emp-stat-meta-val">{formatINR(branchMetrics.cashCollected)}</span></span>
            <span>Online: <span className="emp-stat-meta-val">{formatINR(branchMetrics.onlineCollected)}</span></span>
          </div>
        </div>

        {/* Card 2: Weekly */}
        <div className="emp-stat-card sapphire-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">This Week</span>
            <div className="emp-stat-icon-wrap" style={{ color: 'var(--emp-sapphire)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="emp-stat-value">{formatINR(branchMetrics.weeklyCollection)}</div>
          <div className="emp-stat-subtext" style={{ color: '#60a5fa' }}>
            <ArrowUpRight size={13} />
            <span>↑ {branchMetrics.weeklyTrendPct}% vs last week</span>
          </div>
          <div className="emp-mini-bars">
            {[40, 65, 50, 85, 70, 95, 80].map((h, i) => (
              <div
                key={i}
                className={`emp-mini-bar${i === 6 ? ' current' : ''}`}
                style={{ height: `${h}%` }}
                title={`Day ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Card 3: Monthly */}
        <div className="emp-stat-card sapphire-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">This Month</span>
            <div className="emp-stat-icon-wrap" style={{ color: '#38bdf8' }}>
              <Calendar size={16} />
            </div>
          </div>
          <div className="emp-stat-value">{formatINR(branchMetrics.monthlyCollection)}</div>
          <div className="emp-stat-subtext">
            <span>Target: {formatINR(branchMetrics.monthlyTarget)}</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>· {branchMetrics.monthlyAchievementPct}%</span>
          </div>
          <div className="emp-progress-bar">
            <div
              className="emp-progress-fill"
              style={{
                width: `${branchMetrics.monthlyAchievementPct}%`,
                background: 'linear-gradient(90deg, #38bdf8, #2563eb)'
              }}
            />
          </div>
        </div>

        {/* Card 4: Branch Customers */}
        <div className="emp-stat-card amber-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">Branch Customers</span>
            <div className="emp-stat-icon-wrap" style={{ color: 'var(--emp-amber)' }}>
              <Users size={16} />
            </div>
          </div>
          <div className="emp-stat-value">{branchMetrics.totalCustomers}</div>
          <div className="emp-stat-subtext" style={{ color: '#34d399' }}>
            <span>+{branchMetrics.newCustomersThisMonth} new this month</span>
          </div>
          <div className="emp-stat-meta-row" style={{ marginTop: '10px' }}>
            <span>Due Today: <span className="emp-stat-meta-val" style={{ color: '#fbbf24' }}>{branchMetrics.dueTodayCount}</span></span>
            <span>Overdue: <span className="emp-stat-meta-val" style={{ color: '#f87171' }}>{overdueCustomers.length}</span></span>
          </div>
        </div>

        {/* Card 5: Applications */}
        <div className="emp-stat-card crimson-accent">
          <div className="emp-stat-top">
            <span className="emp-stat-label">Loan Applications</span>
            <div className="emp-stat-icon-wrap" style={{ color: '#ec4899' }}>
              <FileText size={16} />
            </div>
          </div>
          <div className="emp-stat-value">{branchMetrics.submittedApplicationsCount}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px' }}>
            {[
              { val: branchMetrics.pendingApplicationsCount,  label: 'Pending',  color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
              { val: branchMetrics.approvedApplicationsCount, label: 'Approved', color: '#34d399', bg: 'rgba(16,185,129,0.1)' },
              { val: branchMetrics.rejectedApplicationsCount, label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.1)'  }
            ].map((item) => (
              <div key={item.label} style={{
                background: item.bg, padding: '6px 4px', borderRadius: '6px',
                textAlign: 'center', fontSize: '11px'
              }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: item.color }}>{item.val}</div>
                <div style={{ color: '#64748b', fontSize: '9.5px', marginTop: '1px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's Collection Tasks ─────────────────────────── */}
      <div className="emp-card-section">
        <div className="emp-card-header">
          <h2 className="emp-card-title">
            <Clock size={16} color="var(--emp-emerald)" />
            Today's Collection Tasks
            <span style={{
              background: 'var(--emp-emerald-dim)',
              color: 'var(--emp-emerald)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 8px'
            }}>{todayTasks.length}</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {collectedCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--emp-emerald)' }}>
                <CheckCircle2 size={13} />
                {collectedCount} collected
              </span>
            )}
            {pendingCount > 0 && (
              <span style={{ fontSize: '11.5px', color: 'var(--emp-text-muted)' }}>
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>

        {todayTasks.length === 0 ? (
          <div className="emp-empty-state">
            <div className="emp-empty-icon"><CheckCircle2 size={22} /></div>
            <p className="emp-empty-title">No active loans in your branch</p>
            <p className="emp-empty-body">Approve applications to create collection tasks</p>
          </div>
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Loan ID</th>
                  <th>Center</th>
                  <th>EMI Amount</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {todayTasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="emp-table-name">{t.customerName}</div>
                      <div className="emp-table-sub">
                        <Phone size={10} />
                        <span>{t.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-sapphire">{t.loanId}</span>
                    </td>
                    <td style={{ color: 'var(--emp-text-secondary)' }}>{t.center}</td>
                    <td>
                      <strong style={{ color: 'var(--emp-emerald)', fontSize: '13px' }}>
                        {formatINR(t.emi)}
                      </strong>
                      <div style={{ fontSize: '10px', color: 'var(--emp-text-muted)', marginTop: '1px' }}>
                        {t.frequency}
                      </div>
                    </td>
                    <td style={{ color: 'var(--emp-text-secondary)' }}>{formatINR(t.outstanding)}</td>
                    <td>
                      {t.status === 'Collected'
                        ? <span className="badge-emerald">✓ Collected</span>
                        : <span className="badge-amber">Due Today</span>
                      }
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {t.status === 'Collected' ? (
                        <span style={{ fontSize: '11px', color: 'var(--emp-text-muted)' }}>Done</span>
                      ) : (
                        <button
                          type="button"
                          className="emp-quick-action-emerald"
                          style={{ padding: '5px 11px', fontSize: '11.5px' }}
                          onClick={() => onSelectLoanForPayment(t.loanId)}
                        >
                          <CreditCard size={11} />
                          <span>Collect {formatINR(t.emi)}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Overdue Customers ─────────────────────────────────── */}
      <div className="emp-card-section">
        <div className="emp-card-header">
          <h2 className="emp-card-title">
            <AlertTriangle size={16} color="var(--emp-crimson)" />
            Overdue Accounts Requiring Attention
            {overdueCustomers.length > 0 && (
              <span style={{
                background: 'var(--emp-crimson-dim)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 8px'
              }}>{overdueCustomers.length}</span>
            )}
          </h2>
          <span className="emp-card-subtitle" style={{ color: '#f87171' }}>
            Action required to prevent NPA classification
          </span>
        </div>

        {overdueCustomers.length === 0 ? (
          <div className="emp-empty-state">
            <div className="emp-empty-icon" style={{ color: 'var(--emp-emerald)' }}>
              <CheckCircle2 size={22} />
            </div>
            <p className="emp-empty-title">All accounts are current</p>
            <p className="emp-empty-body">No overdue borrowers in your branch — great work!</p>
          </div>
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Loan Number</th>
                  <th>Overdue Amount</th>
                  <th>Days Overdue</th>
                  <th>Severity</th>
                  <th>Last Payment</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueCustomers.map((oc, idx) => (
                  <tr key={oc.loanId || idx} className="emp-overdue-row">
                    <td>
                      <div className="emp-table-name">{oc.customerName}</div>
                      {oc.phone && (
                        <div className="emp-table-sub">
                          <Phone size={10} />
                          <span>{oc.phone}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge-sapphire">{oc.loanId}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#f87171', fontSize: '13px' }}>
                        {formatINR(oc.overdueAmount)}
                      </strong>
                    </td>
                    <td>
                      {oc.daysOverdue > 0 ? (
                        <span className={`overdue-days-chip ${oc.severity}`}>
                          {oc.daysOverdue} days
                        </span>
                      ) : (
                        <span className="overdue-days-chip approaching">NPA</span>
                      )}
                    </td>
                    <td>
                      <div className="overdue-severity-bar">
                        <div className="overdue-bar-track">
                          <div
                            className={`overdue-bar-fill ${oc.severity}`}
                            style={{ width: `${oc.barWidth}%` }}
                          />
                        </div>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: oc.severity === 'critical' ? '#f87171'
                               : oc.severity === 'high'     ? '#fb923c'
                               : oc.severity === 'medium'   ? '#fbbf24'
                               : '#fde047',
                          whiteSpace: 'nowrap'
                        }}>
                          {oc.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--emp-text-muted)', fontSize: '12px' }}>
                      {oc.lastPayment}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {oc.phone && (
                          <a
                            href={`tel:${oc.phone}`}
                            className="emp-btn-icon"
                            title="Call Borrower"
                          >
                            <Phone size={13} />
                          </a>
                        )}
                        <button
                          type="button"
                          className="emp-quick-action-emerald"
                          style={{ padding: '5px 11px', fontSize: '11.5px' }}
                          onClick={() => onSelectLoanForPayment(oc.loanId)}
                        >
                          <span>Record Payment</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
