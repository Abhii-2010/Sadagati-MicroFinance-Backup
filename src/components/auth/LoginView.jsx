import { useState, useId, useEffect } from 'react'
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Shield,
  RotateCw
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import ForgotPasswordFlow from './ForgotPasswordFlow'
import './LoginView.css'

export default function LoginView() {
  const {
    login,
    sessionExpiredNotice,
    setSessionExpiredNotice
  } = useDashboard()

  const formId = useId()

  const [mode, setMode] = useState('login') // 'login' | 'forgot-password'
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successRedirecting, setSuccessRedirecting] = useState(false)

  // Clear notice after viewing or typing
  useEffect(() => {
    if (sessionExpiredNotice) {
      setError(sessionExpiredNotice)
    }
  }, [sessionExpiredNotice])

  const handleSubmit = (e) => {
    e?.preventDefault()
    setError('')
    if (setSessionExpiredNotice) setSessionExpiredNotice(null)

    const cleanId = identifier.trim()
    if (!cleanId) {
      setError('Enter your email or employee ID.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)

    // Micro-interaction latency for realistic financial authentication feedback
    setTimeout(async () => {
      try {
        const result = await login(cleanId, password, rememberMe)
        if (!result.success) {
          setError(result.error)
          setLoading(false)
        } else {
          setSuccessRedirecting(true)
        }
      } catch (err) {
        setError('Authentication system error. Please try again.')
        setLoading(false)
      }
    }, 450)
  }

  return (
    <div className="login-viewport">
      {/* Top Application Header */}
      <header className="login-topbar">
        <div className="login-topbar-brand">
          <div className="login-topbar-logo">
            <ShieldCheck size={20} />
          </div>
          <div className="login-topbar-titles">
            <span className="login-topbar-name">Sadagati</span>
            <span className="login-topbar-sub">Financial Operations Platform</span>
          </div>
        </div>

        <div className="login-topbar-security-badge" title="Enterprise 256-bit TLS Encryption Active">
          <Shield size={13} className="security-shield-icon" />
          <span className="security-badge-text">Secure Enterprise Access</span>
          <span className="security-badge-dot" />
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="login-center-stage">
        {mode === 'forgot-password' ? (
          <ForgotPasswordFlow
            onBackToLogin={() => {
              setMode('login')
              setError('')
            }}
            onPasswordResetSuccess={(resetId) => {
              setMode('login')
              setIdentifier(resetId)
              setPassword('')
              setError('')
            }}
          />
        ) : (
          <div className="login-card" role="region" aria-labelledby={`${formId}-title`}>
            {/* Login Card Header */}
            <div className="login-brand-header">
              <div className="login-brand-icon-wrap" aria-hidden="true">
                <ShieldCheck size={26} className="login-brand-icon" />
              </div>
              <div className="login-brand-titles">
                <span className="login-brand-name">Sadagati</span>
                <span className="login-brand-tag">MicroFinance</span>
              </div>
            </div>

            <div className="login-headings">
              <h1 id={`${formId}-title`} className="login-title">Welcome back</h1>
              <p className="login-subtitle">
                Sign in to your financial operations workspace.
              </p>
            </div>

            {/* Error or Expiration Banner */}
            {error && (
              <div className="login-alert-banner is-error" role="alert" aria-live="assertive">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form-body" noValidate>
              <div className="login-field-group">
                <label htmlFor={`${formId}-identifier`} className="login-field-label">
                  Email or Employee ID
                </label>
                <div className="login-input-wrapper">
                  <User size={16} className="login-input-icon" aria-hidden="true" />
                  <input
                    id={`${formId}-identifier`}
                    type="text"
                    name="username"
                    autoComplete="username"
                    className="login-input"
                    placeholder="Enter your email or employee ID"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={loading || successRedirecting}
                    required
                  />
                </div>
              </div>

              <div className="login-field-group">
                <div className="login-field-header-row">
                  <label htmlFor={`${formId}-password`} className="login-field-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="login-link-forgot"
                    onClick={() => {
                      setError('')
                      setMode('forgot-password')
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <Lock size={16} className="login-input-icon" aria-hidden="true" />
                  <input
                    id={`${formId}-password`}
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    className="login-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError('')
                    }}
                    disabled={loading || successRedirecting}
                    required
                  />
                  <button
                    type="button"
                    className="login-input-action-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="login-controls-row">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login-checkbox-input"
                  />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                className={`login-btn-primary ${loading ? 'is-loading' : ''}`}
                disabled={loading || successRedirecting}
              >
                {loading || successRedirecting ? (
                  <>
                    <RotateCw size={15} className="spinner-icon" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Subtle Security Footnote */}
            <div className="login-card-footer-sec">
              <ShieldCheck size={13} className="footer-sec-icon" />
              <span>Bank-grade 256-bit encryption · Scoped RBAC security</span>
            </div>
          </div>
        )}
      </main>

      {/* Corporate Platform Footer */}
      <footer className="login-page-footer">
        <div className="login-footer-col-left">
          <span>Sadagati MicroFinance</span>
          <span className="footer-separator">•</span>
          <span>Enterprise Financial Operations Platform</span>
        </div>
        <div className="login-footer-col-right">
          <span>© 2026 Sadagati MicroFinance</span>
          <span className="footer-separator">•</span>
          <span>v1.4.0</span>
        </div>
      </footer>
    </div>
  )
}
