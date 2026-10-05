import { HelpCircle, ArrowLeft } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './AuthErrorPages.css'

export default function NotFoundView({ onReturn }) {
  const { currentUser } = useDashboard()

  const destinationName = currentUser?.role === 'Admin' ? 'Admin Dashboard' : 'Employee Dashboard'

  return (
    <div className="auth-error-page-root">
      <div className="auth-error-card">
        <div className="auth-error-icon-shield not-found">
          <HelpCircle size={32} />
        </div>
        
        <span className="auth-error-status-badge">HTTP 404 · NOT FOUND</span>
        <h1 className="auth-error-heading">Page not found</h1>
        
        <p className="auth-error-description">
          The requested financial resource or workspace route does not exist or has been relocated.
        </p>

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
          Sadagati MicroFinance ERP · Core Banking System
        </div>
      </div>
    </div>
  )
}
