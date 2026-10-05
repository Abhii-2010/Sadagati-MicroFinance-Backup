import { ShieldAlert, ArrowLeft, Building2, User } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './AuthErrorPages.css'

export default function AccessDeniedView({ onReturn, attemptedArea = 'Admin Operations' }) {
  const { currentUser } = useDashboard()

  const isEmployee = currentUser && currentUser.role !== 'Admin'
  const destinationName = isEmployee ? 'Employee Portal' : 'Admin Dashboard'

  return (
    <div className="auth-error-page-root">
      <div className="auth-error-card">
        <div className="auth-error-icon-shield">
          <ShieldAlert size={32} />
        </div>
        
        <span className="auth-error-status-badge">HTTP 403 · FORBIDDEN</span>
        <h1 className="auth-error-heading">Access restricted</h1>
        
        <p className="auth-error-description">
          You don&apos;t have administrative authorization to access <strong>{attemptedArea}</strong>.
          Your current session is restricted to your role-based permissions and branch scope.
        </p>

        {currentUser && (
          <div className="auth-user-context-pill">
            <div className="auth-context-row">
              <User size={13} />
              <span>Signed in as: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
            </div>
            {currentUser.branch && (
              <div className="auth-context-row">
                <Building2 size={13} />
                <span>Branch: {currentUser.branch}</span>
              </div>
            )}
          </div>
        )}

        <div className="auth-error-actions">
          <button
            type="button"
            className="auth-btn-primary"
            onClick={onReturn}
          >
            <ArrowLeft size={16} />
            <span>Return to {destinationName}</span>
          </button>
        </div>

        <div className="auth-error-footer-note">
          Security policy enforced: Multi-tenant RBAC & Branch Isolation Active
        </div>
      </div>
    </div>
  )
}
