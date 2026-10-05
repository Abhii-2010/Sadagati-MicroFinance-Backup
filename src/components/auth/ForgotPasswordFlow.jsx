import { useState, useId } from 'react'
import {
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  Lock,
  Mail,
  ShieldCheck
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function ForgotPasswordFlow({ onBackToLogin, onPasswordResetSuccess }) {
  const { requestPasswordReset, verifyResetCode, resetPassword } = useDashboard()
  const formId = useId()

  const [step, setStep] = useState('request') // 'request' | 'verify' | 'new-password' | 'success'
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoCodeHint, setDemoCodeHint] = useState('')

  // Validation rules
  const hasMinLength = newPassword.length >= 8
  const hasUpperCase = /[A-Z]/.test(newPassword)
  const hasLowerCase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial

  const handleRequestSubmit = (e) => {
    e?.preventDefault()
    setError('')
    const clean = identifier.trim()
    if (!clean) {
      setError('Enter your email or employee ID.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = requestPasswordReset(clean)
      setLoading(false)
      if (res.code) {
        setDemoCodeHint(res.code)
      }
      setStep('verify')
    }, 400)
  }

  const handleVerifySubmit = (e) => {
    e?.preventDefault()
    setError('')
    const cleanCode = code.trim()
    if (!cleanCode) {
      setError('Enter the 6-digit verification code.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = verifyResetCode(identifier, cleanCode)
      setLoading(false)
      if (res.success) {
        setStep('new-password')
      } else {
        setError(res.error || 'Invalid or expired verification code.')
      }
    }, 350)
  }

  const handleResetSubmit = (e) => {
    e?.preventDefault()
    setError('')

    if (!isPasswordValid) {
      setError('Please satisfy all password security requirements.')
      return
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const res = resetPassword(identifier, code, newPassword)
      setLoading(false)
      if (res.success) {
        setStep('success')
        if (onPasswordResetSuccess) {
          onPasswordResetSuccess(identifier)
        }
      } else {
        setError(res.error || 'Failed to update password. Please try again.')
      }
    }, 450)
  }

  return (
    <div className="login-card" role="region" aria-labelledby={`${formId}-heading`}>
      {/* Brand Header */}
      <div className="login-brand-header">
        <div className="login-brand-icon-wrap" aria-hidden="true">
          <KeyRound size={22} className="login-brand-icon" />
        </div>
        <div className="login-brand-titles">
          <span className="login-brand-name">Sadagati</span>
          <span className="login-brand-tag">MicroFinance</span>
        </div>
      </div>

      {step === 'request' && (
        <>
          <div className="login-headings">
            <h1 id={`${formId}-heading`} className="login-title">Reset your password</h1>
            <p className="login-subtitle">
              Enter your work email or employee ID to receive a verification code.
            </p>
          </div>

          {error && (
            <div className="login-alert-banner is-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRequestSubmit} className="login-form-body" noValidate>
            <div className="login-field-group">
              <label htmlFor={`${formId}-identifier`} className="login-field-label">
                Email or Employee ID
              </label>
              <div className="login-input-wrapper">
                <Mail size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id={`${formId}-identifier`}
                  type="text"
                  name="identifier"
                  autoComplete="username"
                  className="login-input"
                  placeholder="e.g. EMP-HQ-001 or rahul.field@sadagati.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading}
            >
              <span>{loading ? 'Sending code...' : 'Continue'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="login-btn-ghost"
              onClick={onBackToLogin}
            >
              <ArrowLeft size={14} />
              <span>Return to sign in</span>
            </button>
          </form>
        </>
      )}

      {step === 'verify' && (
        <>
          <div className="login-headings">
            <h1 id={`${formId}-heading`} className="login-title">Enter verification code</h1>
            <p className="login-subtitle">
              If an account exists for this information, a 6-digit code has been dispatched.
            </p>
          </div>

          {demoCodeHint && (
            <div className="login-demo-code-pill" role="note">
              <ShieldCheck size={14} />
              <span>Security Code Generated: <strong>{demoCodeHint}</strong></span>
            </div>
          )}

          {error && (
            <div className="login-alert-banner is-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifySubmit} className="login-form-body" noValidate>
            <div className="login-field-group">
              <label htmlFor={`${formId}-code`} className="login-field-label">
                6-Digit Verification Code
              </label>
              <div className="login-input-wrapper">
                <KeyRound size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id={`${formId}-code`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="login-input text-center font-mono letter-spacing-lg"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading}
            >
              <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="login-btn-ghost"
              onClick={() => {
                setError('')
                setStep('request')
              }}
            >
              <ArrowLeft size={14} />
              <span>Use a different account</span>
            </button>
          </form>
        </>
      )}

      {step === 'new-password' && (
        <>
          <div className="login-headings">
            <h1 id={`${formId}-heading`} className="login-title">Set new password</h1>
            <p className="login-subtitle">
              Create a strong password for your financial workspace account.
            </p>
          </div>

          {error && (
            <div className="login-alert-banner is-error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="login-form-body" noValidate>
            <div className="login-field-group">
              <label htmlFor={`${formId}-new-pw`} className="login-field-label">
                New Password
              </label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id={`${formId}-new-pw`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="login-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="login-input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Live Requirements Checklist */}
            <div className="login-pw-checklist" aria-live="polite">
              <span className="login-pw-checklist-title">Password requirements</span>
              <div className={`checklist-item ${hasMinLength ? 'is-valid' : ''}`}>
                <Check size={12} />
                <span>At least 8 characters</span>
              </div>
              <div className={`checklist-item ${hasUpperCase ? 'is-valid' : ''}`}>
                <Check size={12} />
                <span>Uppercase letter (A–Z)</span>
              </div>
              <div className={`checklist-item ${hasLowerCase ? 'is-valid' : ''}`}>
                <Check size={12} />
                <span>Lowercase letter (a–z)</span>
              </div>
              <div className={`checklist-item ${hasNumber ? 'is-valid' : ''}`}>
                <Check size={12} />
                <span>Number (0–9)</span>
              </div>
              <div className={`checklist-item ${hasSpecial ? 'is-valid' : ''}`}>
                <Check size={12} />
                <span>Special character (!@#$%^&*)</span>
              </div>
            </div>

            <div className="login-field-group">
              <label htmlFor={`${formId}-confirm-pw`} className="login-field-label">
                Confirm New Password
              </label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  id={`${formId}-confirm-pw`}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="login-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-input-action-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="login-field-hint is-error">Passwords do not match</span>
              )}
            </div>

            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading || !isPasswordValid || !passwordsMatch}
            >
              <span>{loading ? 'Updating password...' : 'Update Password'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </>
      )}

      {step === 'success' && (
        <div className="login-success-state" role="status">
          <div className="login-success-icon-wrap" aria-hidden="true">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="login-title">Password updated</h2>
          <p className="login-subtitle">
            Your password has been securely updated. You can now access your Sadagati financial workspace.
          </p>
          <button
            type="button"
            className="login-btn-primary"
            onClick={onBackToLogin}
          >
            <span>Return to Sign In</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
