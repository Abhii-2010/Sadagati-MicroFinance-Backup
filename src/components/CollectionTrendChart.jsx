import { useState, useMemo, useRef } from 'react'
import { useDashboard } from '../context/DashboardContext'

export default function CollectionTrendChart() {
  const { trend, formatINR } = useDashboard()
  const [hoverIndex, setHoverIndex] = useState(null)
  const svgRef = useRef(null)

  // Chart dimensions
  const width = 720
  const height = 280
  const padding = { top: 25, right: 30, bottom: 40, left: 55 }

  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Y-axis ticks exact match to screenshot: 12k, 10.00k, 8.00k, 6.00k, 4.00k, 2.00k, 0k
  const yAxisTicks = [
    { label: '12k', val: 12000 },
    { label: '10.00k', val: 10000 },
    { label: '8.00k', val: 8000 },
    { label: '6.00k', val: 6000 },
    { label: '4.00k', val: 4000 },
    { label: '2.00k', val: 2000 },
    { label: '0k', val: 0 }
  ]

  const maxVal = 12000
  const minVal = 0

  // Points for 7 days: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const points = useMemo(() => {
    return trend.map((d, i) => {
      const x = padding.left + (i / Math.max(1, trend.length - 1)) * chartW
      // Clamp between minVal and maxVal
      const clampedAmt = Math.min(Math.max(d.amount, minVal), maxVal)
      const y = padding.top + chartH - (clampedAmt / maxVal) * chartH
      return { x, y, data: d }
    })
  }, [trend, chartW, chartH, padding.left, padding.top, maxVal])

  // Build line path
  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '')
  }, [points])

  // Area under path
  const areaPath = useMemo(() => {
    if (points.length === 0) return ''
    const bottomY = padding.top + chartH
    const first = points[0]
    const last = points[points.length - 1]
    return `${linePath} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`
  }, [linePath, points, padding.top, chartH])

  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * width

    let closest = 0
    let minDiff = Infinity
    points.forEach((pt, i) => {
      const diff = Math.abs(pt.x - mouseX)
      if (diff < minDiff) {
        minDiff = diff
        closest = i
      }
    })
    setHoverIndex(closest)
  }

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="card-box collection-trend-card">
      <div className="card-header-clean">
        <h3 className="card-title">Collection Trend</h3>
      </div>

      <div className="chart-svg-container" onMouseLeave={() => setHoverIndex(null)}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="trend-svg"
          onMouseMove={handleMouseMove}
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines and Y-axis labels */}
          {yAxisTicks.map((tick) => {
            const yPos = padding.top + chartH - (tick.val / maxVal) * chartH
            return (
              <g key={tick.label} className="grid-row">
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={padding.left + chartW}
                  y2={yPos}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 12}
                  y={yPos + 4}
                  textAnchor="end"
                  className="axis-label-y"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="inherit"
                >
                  {tick.label}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {points.map((pt) => {
            const isHovered = activePoint && activePoint.data.day === pt.data.day
            return (
              <g key={pt.data.day} className="axis-col-x">
                <text
                  x={pt.x}
                  y={padding.top + chartH + 22}
                  textAnchor="middle"
                  className={`axis-label-x ${isHovered ? 'active' : ''}`}
                  fill={isHovered ? '#1e293b' : '#94a3b8'}
                  fontSize="12"
                  fontWeight={isHovered ? '600' : '400'}
                  fontFamily="inherit"
                >
                  {pt.data.day}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots and crosshair */}
          {points.map((pt, idx) => {
            const isHovered = hoverIndex === idx
            return (
              <g key={pt.data.day}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? '#ffffff' : '#2563eb'}
                  stroke="#2563eb"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{ transition: 'all 0.15s ease' }}
                />
              </g>
            )
          })}

          {/* Hover Crosshair and tooltip */}
          {activePoint && (
            <g className="chart-tooltip-group">
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartH}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={6}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <rect
                x={Math.min(width - 110, Math.max(padding.left, activePoint.x - 50))}
                y={Math.max(10, activePoint.y - 45)}
                width="100"
                height="34"
                rx="6"
                fill="#0f172a"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
              />
              <text
                x={Math.min(width - 110, Math.max(padding.left, activePoint.x - 50)) + 50}
                y={Math.max(10, activePoint.y - 45) + 16}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="11"
                fontWeight="600"
              >
                {activePoint.data.day}
              </text>
              <text
                x={Math.min(width - 110, Math.max(padding.left, activePoint.x - 50)) + 50}
                y={Math.max(10, activePoint.y - 45) + 29}
                textAnchor="middle"
                fill="#93c5fd"
                fontSize="10"
              >
                {formatINR(activePoint.data.amount)}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
