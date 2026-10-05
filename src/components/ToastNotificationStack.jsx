import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function ToastNotificationStack() {
  const { toasts, removeToast } = useDashboard()

  if (!toasts || toasts.length === 0) return null

  return (
    <div className="toast-notification-stack">
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const isInfo = toast.type === 'info'

        return (
          <div
            key={toast.id}
            className={`toast-alert-card ${isError ? 'toast-error' : isInfo ? 'toast-info' : 'toast-success'}`}
          >
            <div className="toast-icon-wrapper">
              {isError ? (
                <AlertCircle size={18} />
              ) : isInfo ? (
                <Info size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>

            <div className="toast-message-body">
              <span className="toast-headline">
                {isError ? 'Action Failed' : isInfo ? 'System Notice' : 'Live Update'}
              </span>
              <p className="toast-text">{toast.message}</p>
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
