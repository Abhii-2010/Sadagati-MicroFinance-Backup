import { ShieldCheck } from 'lucide-react'
import './RouteLoadingFallback.css'

export default function RouteLoadingFallback({ message = 'Loading module...' }) {
  return (
    <div className="route-loading-container" role="status" aria-live="polite">
      <div className="route-loading-content">
        <div className="route-loading-icon-wrap">
          <ShieldCheck size={24} className="route-loading-icon" />
          <div className="route-loading-ping" />
        </div>
        <p className="route-loading-label">{message}</p>
        <div className="route-loading-bar">
          <div className="route-loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}
