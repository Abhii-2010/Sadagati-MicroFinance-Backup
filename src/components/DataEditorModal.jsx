import { useState } from 'react'
import {

  X,
  Save,
  RotateCcw,
  Sliders,
  DollarSign,
  PieChart,
  BarChart2,
  Quote,
  Zap,
  Check
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function DataEditorModal({ isOpen, onClose, initialTab = 'metrics' }) {
  const {
    metrics,
    trend,
    statusBreakdown,
    updateAllMetrics,
    updateStatusBreakdown,
    updateTrend,
    addQuote,
    resetToDefaults,
    addLiveCollection
  } = useDashboard()

  const [activeTab, setActiveTab] = useState(initialTab)
  const [formData, setFormData] = useState({ ...metrics })
  const [tempStatus, setTempStatus] = useState([...statusBreakdown])
  const [tempTrend, setTempTrend] = useState([...trend])
  const [newQuoteText, setNewQuoteText] = useState('')
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('')
  const [newQuoteRole, setNewQuoteRole] = useState('')
  const [newQuoteTag, setNewQuoteTag] = useState('Empowerment')
  const [toastMessage, setToastMessage] = useState(null)

  if (!isOpen) return null


  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleMetricChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(val)
    }))
  }

  const handleStatusChange = (id, newPct) => {
    setTempStatus((prev) =>
      prev.map((item) => (item.id === id ? { ...item, percentage: Number(newPct) } : item))
    )
  }

  const handleTrendChange = (idx, field, val) => {
    setTempTrend((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: Number(val) } : item))
    )
  }

  const handleSaveMetrics = (e) => {
    e.preventDefault()
    updateAllMetrics(formData, 'Metrics Editor Form')
    showToast('Metric changes applied live!')
  }

  const handleSaveStatus = () => {
    const total = tempStatus.reduce((acc, curr) => acc + curr.percentage, 0)
    if (Math.abs(total - 100) > 0.5) {
      alert(`Warning: Total percentage sums to ${total.toFixed(1)}%. It is best when it adds up to 100%.`)
    }
    updateStatusBreakdown(tempStatus)
    showToast('Portfolio status breakdown updated!')
  }

  const handleSaveTrend = () => {
    updateTrend(tempTrend)
    showToast('Trend graph points updated live!')
  }

  const handleCreateQuote = (e) => {
    e.preventDefault()
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) return
    addQuote({
      quote: newQuoteText.trim(),
      author: newQuoteAuthor.trim(),
      role: newQuoteRole.trim() || 'Contributor',
      tag: newQuoteTag.trim() || 'Wisdom'
    })
    setNewQuoteText('')
    setNewQuoteAuthor('')
    setNewQuoteRole('')
    showToast('Quote added to live stream!')
  }

  const handleQuickAdd = (amt) => {
    addLiveCollection(amt, 'HQ Test Desk', 'Dashboard Admin')
    showToast(`Injected +₹${amt.toLocaleString()} to Today's Collection!`)
  }

  const handleReset = () => {
    if (window.confirm('Reset all metrics, trends, status breakdown and logs to original baseline?')) {
      resetToDefaults()
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-editor-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="modal-title">Live Data & Parameters Hub</h2>
              <p className="modal-sub">
                Modify any dashboard figure in real-time. Changes instantly recalculate all widgets.
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs-bar">
          <button
            type="button"
            className={`editor-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <DollarSign size={15} />
            <span>Core Metrics</span>
          </button>

          <button
            type="button"
            className={`editor-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <PieChart size={15} />
            <span>Portfolio Status</span>
          </button>

          <button
            type="button"
            className={`editor-tab-btn ${activeTab === 'trend' ? 'active' : ''}`}
            onClick={() => setActiveTab('trend')}
          >
            <BarChart2 size={15} />
            <span>Graph Points</span>
          </button>

          <button
            type="button"
            className={`editor-tab-btn ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quotes')}
          >
            <Quote size={15} />
            <span>Quotes Stream</span>
          </button>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="editor-live-toast">
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="modal-tab-content">
          {/* TAB 1: CORE METRICS */}
          {activeTab === 'metrics' && (
            <form onSubmit={handleSaveMetrics} className="editor-form-grid">
              <div className="form-group">
                <label className="form-label">Total Portfolio (₹ Rupees)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.totalPortfolio}
                  onChange={(e) => handleMetricChange('totalPortfolio', e.target.value)}
                  step="100000"
                />
                <span className="form-help">Current: ₹{(formData.totalPortfolio / 10000000).toFixed(2)} Crores</span>
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio Growth Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.portfolioGrowthRate}
                  onChange={(e) => handleMetricChange('portfolioGrowthRate', e.target.value)}
                  step="0.1"
                />
                <span className="form-help">Month-over-month growth tag</span>
              </div>

              <div className="form-group">
                <label className="form-label">Outstanding Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.outstandingAmount}
                  onChange={(e) => handleMetricChange('outstandingAmount', e.target.value)}
                  step="100000"
                />
                <span className="form-help">Current: ₹{(formData.outstandingAmount / 10000000).toFixed(2)} Crores</span>
              </div>

              <div className="form-group">
                <label className="form-label">PAR 30 Risk Rate (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.par30Percentage}
                  onChange={(e) => handleMetricChange('par30Percentage', e.target.value)}
                  step="0.05"
                />
                <span className="form-help">Portfolio At Risk (&gt; 30 days overdue)</span>
              </div>


              <div className="form-group">
                <label className="form-label">Today's Collection (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.todaysCollection}
                  onChange={(e) => handleMetricChange('todaysCollection', e.target.value)}
                  step="10000"
                />
                <span className="form-help">Live collected funds today</span>
              </div>

              <div className="form-group">
                <label className="form-label">Daily Collection Target (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.todaysTarget}
                  onChange={(e) => handleMetricChange('todaysTarget', e.target.value)}
                  step="50000"
                />
                <span className="form-help">Target for progress completion</span>
              </div>

              <div className="form-group">
                <label className="form-label">Active Borrowers Count</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.activeBorrowers}
                  onChange={(e) => handleMetricChange('activeBorrowers', e.target.value)}
                  step="10"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Centers</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.activeCenters}
                  onChange={(e) => handleMetricChange('activeCenters', e.target.value)}
                  step="1"
                />
              </div>

              <div className="form-actions-full">
                <div className="quick-inject-group">
                  <span className="quick-inject-label">Quick Test Injections:</span>
                  <button
                    type="button"
                    className="btn-quick-chip"
                    onClick={() => handleQuickAdd(25000)}
                  >
                    +₹25k
                  </button>
                  <button
                    type="button"
                    className="btn-quick-chip"
                    onClick={() => handleQuickAdd(100000)}
                  >
                    +₹1 Lakh
                  </button>
                </div>

                <button type="submit" className="btn-primary-action">
                  <Save size={15} />
                  <span>Apply Metric Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: PORTFOLIO STATUS DONUT BREAKDOWN */}
          {activeTab === 'status' && (
            <div className="editor-tab-pane">
              <p className="tab-pane-desc">
                Adjust percentage shares of portfolio risk buckets. Donut chart will redraw automatically.
              </p>

              <div className="status-inputs-list">
                {tempStatus.map((item) => (
                  <div key={item.id} className="status-input-row">
                    <div className="status-color-preview" style={{ backgroundColor: item.color }} />
                    <div className="status-name-label">
                      <strong>{item.label}</strong>
                    </div>
                    <div className="status-pct-control">
                      <input
                        type="number"
                        className="form-input pct-input"
                        value={item.percentage}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        step="0.5"
                        min="0"
                        max="100"
                      />
                      <span className="pct-symbol">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions-full mt-4">
                <button type="button" className="btn-primary-action" onClick={handleSaveStatus}>
                  <Save size={15} />
                  <span>Update Donut Chart</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TREND GRAPH POINTS */}
          {activeTab === 'trend' && (
            <div className="editor-tab-pane">
              <p className="tab-pane-desc">
                Update the monthly total portfolio amount (in Crores ₹) to reshape the interactive spline curve.
              </p>

              <div className="trend-inputs-table">
                <div className="table-header-row">
                  <span>Month</span>
                  <span>Portfolio (₹ Cr)</span>
                  <span>Disbursed (₹ Cr)</span>
                  <span>Collected (₹ Cr)</span>
                </div>
                {tempTrend.map((row, idx) => (
                  <div key={row.month} className="table-data-row">
                    <span className="row-month-tag">{row.month}</span>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input-sm"
                      value={row.portfolio}
                      onChange={(e) => handleTrendChange(idx, 'portfolio', e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.1"
                      className="form-input-sm"
                      value={row.disbursed}
                      onChange={(e) => handleTrendChange(idx, 'disbursed', e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.1"
                      className="form-input-sm"
                      value={row.collected}
                      onChange={(e) => handleTrendChange(idx, 'collected', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="form-actions-full mt-4">
                <button type="button" className="btn-primary-action" onClick={handleSaveTrend}>
                  <Save size={15} />
                  <span>Update Graph Curve</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: QUOTES */}
          {activeTab === 'quotes' && (
            <div className="editor-tab-pane">
              <form onSubmit={handleCreateQuote} className="add-quote-form">
                <div className="form-group">
                  <label className="form-label">Inspirational Quote</label>
                  <textarea
                    rows={3}
                    className="form-input form-textarea"
                    placeholder="Enter an inspirational microfinance, banking, or growth quote..."
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Author Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. B.R. Ambedkar"
                      value={newQuoteAuthor}
                      onChange={(e) => setNewQuoteAuthor(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role / Organization</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Social Economist"
                      value={newQuoteRole}
                      onChange={(e) => setNewQuoteRole(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group mt-4">
                  <label className="form-label">Theme Category Tag</label>
                  <select
                    className="form-input"
                    value={newQuoteTag}
                    onChange={(e) => setNewQuoteTag(e.target.value)}
                  >
                    <option value="Empowerment">Empowerment</option>
                    <option value="Discipline">Discipline</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Inclusion">Inclusion</option>
                    <option value="Growth">Growth</option>
                  </select>
                </div>


                <div className="form-actions-full">
                  <button type="submit" className="btn-primary-action">
                    <Zap size={15} />
                    <span>Add Quote to Live Carousel</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-reset-danger" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>Reset All to Defaults</span>
          </button>

          <button type="button" className="btn-secondary-action" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
