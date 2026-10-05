import { User, Shield, Building2, Mail, Phone, Calendar, Lock, CheckCircle2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeProfileView() {
  const { currentUser } = useDashboard()

  return (
    <div>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Employee Profile & Credentials</h1>
          <p className="emp-page-subtitle">
            Authenticated enterprise identity and branch permissions
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left ID Card */}
        <div className="emp-card-section" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
            }}
          >
            {currentUser?.name?.charAt(0) || 'U'}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', margin: '0 0 4px' }}>
            {currentUser?.name}
          </h2>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginBottom: '8px' }}>
            {currentUser?.designation}
          </div>
          <span className="badge-sapphire" style={{ fontSize: '11px' }}>
            {currentUser?.employeeId}
          </span>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Status</span>
              <span className="badge-emerald">{currentUser?.status || 'Active'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Branch</span>
              <strong style={{ color: '#ffffff' }}>{currentUser?.branch}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Branch ID</span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{currentUser?.branchId}</span>
            </div>
          </div>
        </div>

        {/* Right Details Grid */}
        <div className="emp-card-section">
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="#10b981" />
            <span>Account Architecture & Role Permissions</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Email Address</span>
              <strong style={{ color: '#ffffff' }}>{currentUser?.email}</strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Mobile Number</span>
              <strong style={{ color: '#ffffff' }}>{currentUser?.phone}</strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>System Role</span>
              <span style={{ color: '#ffffff' }}>{currentUser?.role}</span>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Joining Date</span>
              <span style={{ color: '#ffffff' }}>{currentUser?.joiningDate || '20 Mar 2025'}</span>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Daily Collection Target</span>
              <strong style={{ color: '#10b981' }}>
                {formatINR(currentUser?.limits?.dailyCollectionTarget || 150000)}
              </strong>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Last Session Login</span>
              <span style={{ color: '#cbd5e1' }}>{currentUser?.lastLogin || 'Today'}</span>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '12px 16px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '10px', fontSize: '12px', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={16} style={{ flexShrink: 0 }} />
            <span>
              Branch assignment and operational permission limits are managed exclusively by the Administrator. Contact HQ for changes.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
