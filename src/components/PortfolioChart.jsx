import { useState, useRef, useMemo } from 'react'
import { Edit3 } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'


export default function PortfolioChart({ onOpenEditor }) {
  const { trend, formatCrores } = useDashboard()
  const [hoverIndex, setHoverIndex] = useState(null)
  const [activeRange, setActiveRange] = useState('6M')
  const svgRef = useRef(null)

  // Dimensions of SVG viewBox
  const width = 640
  const height = 280
  const padding = { top: 28, right: 30, bottom: 40, left: 55 }

  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Filter or take slice based on active range
  const displayData = useMemo(() => {
    if (activeRange === '6M') return trend.slice(-6)
    return trend
  }, [trend, activeRange])

  // Min and max for scaling
  const values = displayData.map((d) => d.portfolio)
  const minVal = Math.min(...values, 10) * 0.9
  const maxVal = Math.max(...values, 20) * 1.08

  // Calculate points
  const points = useMemo(() => {
    return displayData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, displayData.length - 1)) * chartW
      const y = padding.top + chartH - ((d.portfolio - minVal) / (maxVal - minVal)) * chartH
      return { x, y, data: d }
    })
  }, [displayData, minVal, maxVal, chartW, chartH, padding.left, padding.top])

  // Build smooth cubic bezier curve
  const curvePath = useMemo(() => {
    if (points.length === 0) return ''
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

      // Control points
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return d
  }, [points])

  // Gradient area path (closed along bottom)
  const areaPath = useMemo(() => {
    if (points.length === 0) return ''
    const first = points[0]
    const last = points[points.length - 1]
    const bottomY = padding.top + chartH
    return `${curvePath} L ${last.x},${bottomY} L ${first.x},${bottomY} Z`
  }, [curvePath, points, padding.top, chartH])

  // Y-axis grid ticks (4 steps)
  const yTicks = useMemo(() => {
    const ticks = []
    const count = 4
    for (let i = 0; i <= count; i++) {
      const val = minVal + (i / count) * (maxVal - minVal)
      const y = padding.top + chartH - (i / count) * chartH
      ticks.push({ val, y })
    }
    return ticks
  }, [minVal, maxVal, chartH, padding.top])

  // Mouse move handler for interactive crosshair & tooltip
  const handleMouseMove = (e) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * width

    // Find closest point by x
    let closestIndex = 0
    let minDiff = Infinity
    points.forEach((pt, i) => {
      const diff = Math.abs(pt.x - mouseX)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = i
      }
    })
    setHoverIndex(closestIndex)
  }

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="dashboard-widget portfolio-graph-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <div className="widget-badge-row">
            <span className="widget-wireframe-tag">graph of totall port.</span>
            <span className="live-status-pill">
              <span className="live-dot" /> Live Traceable
            </span>
          </div>
          <h3 className="widget-title">Total Portfolio Growth Trend</h3>
          <p className="widget-desc">Monthly active assets under management & disbursements</p>
        </div>

        <div className="widget-controls">
          <div className="timeframe-toggle">
            {['6M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                type="button"
                className={`range-pill ${activeRange === range ? 'active' : ''}`}
                onClick={() => setActiveRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          {onOpenEditor && (
            <button
              type="button"
              className="widget-btn-action"
              onClick={onOpenEditor}
              title="Edit chart data points"
            >
              <Edit3 size={14} />
              <span>Edit Points</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="chart-canvas-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="portfolio-svg-chart"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--c-sage-primary)" stopOpacity="0.38" />
              <stop offset="60%" stopColor="var(--c-sage-primary)" stopOpacity="0.10" />
              <stop offset="100%" stopColor="var(--c-sage-primary)" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="var(--c-sage-primary)" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i} className="grid-group">
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="var(--c-stone-border)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                ₹{tick.val.toFixed(1)}Cr
              </text>
            </g>
          ))}

          {/* X axis month labels */}
          {points.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className={`chart-axis-label ${hoverIndex === i ? 'highlight-label' : ''}`}
            >
              {pt.data.month}
            </text>
          ))}

          {/* Gradient Filled Area */}
          <path d={areaPath} fill="url(#portfolioGradient)" />

          {/* Main Bezier Line */}
          <path
            d={curvePath}
            fill="none"
            stroke="var(--c-sage-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEffect)"
          />

          {/* Active Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoverIndex === i
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? 'var(--c-sage-primary)' : '#ffffff'}
                  stroke="var(--c-sage-primary)"
                  strokeWidth={isHovered ? 3 : 2}
                  className="chart-point"
                />
              </g>
            )
          })}

          {/* Hover Crosshair Guide */}
          {activePoint && (
            <g className="crosshair-guide">
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartH}
                stroke="var(--c-sage-primary)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="var(--c-sage-primary)"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip positioned near active point */}
        {activePoint && (
          <div
            className="chart-floating-tooltip"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`
            }}
          >
            <div className="tooltip-head">
              <span className="tooltip-month">{activePoint.data.month} Portfolio</span>
              <span className="tooltip-badge">Live</span>
            </div>
            <div className="tooltip-row highlight">
              <span>Total Portfolio:</span>
              <strong>₹{activePoint.data.portfolio.toFixed(2)} Cr</strong>
            </div>
            <div className="tooltip-row">
              <span>Disbursed:</span>
              <span>₹{activePoint.data.disbursed.toFixed(2)} Cr</span>
            </div>
            <div className="tooltip-row">
              <span>Collected:</span>
              <span>₹{activePoint.data.collected.toFixed(2)} Cr</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer summary */}
      <div className="chart-footer-metrics">
        <div className="footer-metric-pill">
          <span className="dot dot-green" />
          <span className="metric-lbl">Current Portfolio:</span>
          <strong>{formatCrores(trend[trend.length - 1]?.portfolio || 18.45)}</strong>
        </div>
        <div className="footer-metric-pill">
          <span className="dot dot-blue" />
          <span className="metric-lbl">MoM Net Disbursed:</span>
          <strong>+₹{(trend[trend.length - 1]?.disbursed || 3.4).toFixed(2)} Cr</strong>
        </div>
        <div className="footer-metric-pill">
          <span className="dot dot-amber" />
          <span className="metric-lbl">Monthly Recovery:</span>
          <strong>₹{(trend[trend.length - 1]?.collected || 2.85).toFixed(2)} Cr</strong>
        </div>
      </div>
    </div>
  )
}
