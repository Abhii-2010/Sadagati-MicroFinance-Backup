import { useState } from 'react'
import { CheckSquare, Clock, MapPin, Phone, CreditCard, CheckCircle2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeTasksView({ onSelectLoanForPayment }) {
  const { branchLoans, branchCustomers, currentUser, branchPayments } = useDashboard()

  const activeLoans = branchLoans.filter((l) => l.status === 'Active')

  const tasks = activeLoans.map((l, i) => {
    const cust = branchCustomers.find((c) => c.id === l.customerId)
    const isCollected = i === 0 && branchPayments.length > 0
    return {
      id: `TSK-${l.id}`,
      loanId: l.id,
      customerName: l.borrowerName,
      phone: l.phone || cust?.phone || '+91 98000 00000',
      address: l.address || `${l.center}, ${currentUser?.branch}`,
      center: l.center || 'Center #14 (Pragati)',
      emi: l.emi || 100,
      timeSlot: i === 0 ? '09:30 AM - 10:15 AM' : i === 1 ? '10:30 AM - 11:15 AM' : '02:00 PM - 02:45 PM',
      priority: i === 0 ? 'High' : 'Normal',
      isCollected
    }
  })

  return (
    <div>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Today's Field Tasks & Route</h1>
          <p className="emp-page-subtitle">
            Assigned collection stops for <strong>{currentUser?.name}</strong> • {currentUser?.branch}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {tasks.length === 0 ? (
          <div className="emp-card-section" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No active collection tasks scheduled for your branch today.
          </div>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="emp-card-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderLeft: `4px solid ${t.isCollected ? '#10b981' : t.priority === 'High' ? '#f59e0b' : '#3b82f6'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.isCollected ? '#10b981' : '#94a3b8' }}>
                  {t.isCollected ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '15px', color: '#ffffff' }}>{t.customerName}</strong>
                    <span className="badge-sapphire">{t.loanId}</span>
                    {t.isCollected ? (
                      <span className="badge-emerald">Collected</span>
                    ) : (
                      <span className="badge-amber">{t.timeSlot}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#10b981" />
                      <span>{t.address}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} color="#38bdf8" />
                      <span>{t.phone}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Target EMI</div>
                  <strong style={{ fontSize: '16px', color: '#10b981' }}>{formatINR(t.emi)}</strong>
                </div>

                {!t.isCollected ? (
                  <button
                    type="button"
                    className="emp-quick-action-emerald"
                    onClick={() => onSelectLoanForPayment(t.loanId)}
                  >
                    <CreditCard size={14} />
                    <span>Collect Now</span>
                  </button>
                ) : (
                  <button type="button" className="emp-nav-btn" style={{ width: 'auto', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }} disabled>
                    ✓ Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
