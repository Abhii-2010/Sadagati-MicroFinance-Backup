import { ShieldCheck } from 'lucide-react'
import './AuthLoadingScreen.css'

export default function AuthLoadingScreen() {
  return (
    <div className="auth-boot-root" role="status" aria-live="polite">
      <div className="auth-boot-content">
        <div className="auth-boot-logo-wrap">
          <ShieldCheck size={32} className="auth-boot-logo-icon" />
          <div className="auth-boot-pulse" />
        </div>
        <div className="auth-boot-brand">
          <span className="auth-boot-brand-name">Sadagati</span>
          <span className="auth-boot-brand-tag">MicroFinance</span>
        </div>
        <div className="auth-boot-progress-bar">
          <div className="auth-boot-progress-indeterminate" />
        </div>
        <p className="auth-boot-status-text">Loading your workspace...</p>
        <span className="auth-boot-subtext">Secure Enterprise Financial Operations</span>
      </div>
    </div>
  )
}
