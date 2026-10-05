import { useState, useEffect, useRef } from 'react'
import { TrendingUp, Edit3, History } from 'lucide-react'

export default function MetricCard({
  title,
  mainValue,
  subtitle,
  badgeText,
  badgeType = 'positive', // 'positive' | 'warning' | 'info' | 'live'
  icon: Icon,
  extraContent,
  onEditClick,
  onTraceClick
}) {
  const [isFlashing, setIsFlashing] = useState(false)
  const isFirstMount = useRef(true)

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    const t1 = setTimeout(() => setIsFlashing(true), 0)
    const t2 = setTimeout(() => setIsFlashing(false), 800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [mainValue])


  return (
    <div className={`metric-card ${isFlashing ? 'flash-update' : ''}`}>
      {/* Top Header of Card */}
      <div className="metric-header">
        <div className="metric-title-group">
          <div className="metric-icon-wrap">
            {Icon && <Icon size={17} className="metric-icon" />}
          </div>
          <span className="metric-title">{title}</span>
        </div>

        <div className="metric-actions">
          {onTraceClick && (
            <button
              type="button"
              className="metric-btn-subtle"
              onClick={onTraceClick}
              title="View live audit trace for this metric"
            >
              <History size={13} />
              <span>Trace</span>
            </button>
          )}
          {onEditClick && (
            <button
              type="button"
              className="metric-btn-subtle"
              onClick={onEditClick}
              title="Edit this value live"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="metric-value-wrap">
        <span className="metric-value">{mainValue}</span>
        {badgeText && (
          <span className={`metric-badge badge-${badgeType}`}>
            {badgeType === 'positive' && <TrendingUp size={12} />}
            {badgeType === 'live' && <span className="live-dot" />}
            {badgeText}
          </span>
        )}
      </div>

      {/* Subtitle / context */}
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}

      {/* Extra custom widgets like progress bar or quick test buttons */}
      {extraContent && <div className="metric-extra">{extraContent}</div>}
    </div>
  )
}
