import { Activity, Clock, ShieldCheck, UserCheck, CreditCard, FileText } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function EmployeeActivityView() {
  const { auditLogs, currentUser } = useDashboard()

  // Filter logs for this employee or their branch
  const myLogs = auditLogs.filter((log) => {
    if (!currentUser) return true
    const actorStr = String(log.actor || '').toLowerCase()
    const detailStr = String(log.detail || '').toLowerCase()
    const myName = (currentUser.name || '').toLowerCase()
    const myBranch = (currentUser.branch || '').toLowerCase()

    return (
      actorStr.includes(myName) ||
      actorStr.includes(myBranch) ||
      detailStr.includes(myName) ||
      detailStr.includes(myBranch) ||
      log.actor === 'Field Agent' ||
      log.actor === 'Field Officer' ||
      log.category === 'COLLECTION'
    )
  })

  return (
    <div>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">My Operational Activity</h1>
          <p className="emp-page-subtitle">
            Auditable actions recorded by <strong>{currentUser?.name}</strong> ({currentUser?.employeeId})
          </p>
        </div>
      </div>

      <div className="emp-card-section" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {myLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              No operational activities recorded yet in this session.
            </div>
          ) : (
            myLogs.map((log) => {
              const isPayment = log.category === 'COLLECTION' || log.title.toLowerCase().includes('payment')
              const isApp = log.category === 'PORTFOLIO' || log.title.toLowerCase().includes('application')
              const isCust = log.category === 'CUSTOMERS' || log.title.toLowerCase().includes('customer')

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: isPayment
                        ? 'rgba(16, 185, 129, 0.15)'
                        : isApp
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                      color: isPayment ? '#10b981' : isApp ? '#3b82f6' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isPayment ? <CreditCard size={17} /> : isApp ? <FileText size={17} /> : <UserCheck size={17} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>{log.title}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} />
                        <span>{log.timestamp}</span>
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>{log.detail}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      Operator: <span style={{ color: '#ffffff' }}>{log.actor}</span> • Branch: <span>{currentUser?.branch}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
