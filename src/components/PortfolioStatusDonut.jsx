import { useState, useMemo } from 'react'
import { useDashboard } from '../context/DashboardContext'

export default function PortfolioStatusDonut() {
  const { statusBreakdown } = useDashboard()
  const [hoveredSegment, setHoveredSegment] = useState(null)

  // Donut geometry
  const size = 180
  const strokeWidth = 22
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  const totalCount = useMemo(() => {
    return statusBreakdown.reduce((acc, curr) => acc + curr.count, 0) || 1
  }, [statusBreakdown])

  const segmentsWithAngles = useMemo(() => {
    let acc = 0
    const res = []
    for (const item of statusBreakdown) {
      const pct = (item.count / totalCount) * 100
      const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`
      const strokeDashoffset = -((acc / totalCount) * circumference)
      acc += item.count
      res.push({
        ...item,
        pct,
        strokeDasharray,
        strokeDashoffset
      })
    }
    return res
  }, [statusBreakdown, totalCount, circumference])

  return (
    <div className="card-box portfolio-status-card">
      <div className="card-header-clean">
        <h3 className="card-title">Portfolio Status</h3>
      </div>

      <div className="donut-center-wrap">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="donut-svg-simple"
        >
          {/* Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {segmentsWithAngles.map((seg) => {
            if (seg.count === 0) return null
            const isHovered = hoveredSegment === seg.id
            return (
              <circle
                key={seg.id}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
                className="donut-arc-slice"
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                  cursor: 'pointer'
                }}
              />
            )
          })}
        </svg>
      </div>

      {/* Legend at bottom: Active (5)  NPA (0)  Closed (1) */}
      <div className="status-legend-row">
        {statusBreakdown.map((item) => {
          const isHovered = hoveredSegment === item.id
          return (
            <div
              key={item.id}
              className={`status-legend-chip ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredSegment(item.id)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <span className="legend-chip-dot" style={{ backgroundColor: item.color }} />
              <span className="legend-chip-text">
                {item.label} ({item.count})
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
