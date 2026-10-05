import { useState } from 'react'
import {
  Search,
  Download,
  Clock,
  Activity,
  User
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function AuditLogsView() {
  const { auditLogs, searchQuery, setSearchQuery } = useDashboard()
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute('download', `sadagati-audit-logs-${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="module-view-container">
      {/* Header */}
      <div className="module-header-row">
        <div>
          <h2 className="module-heading">Live System Audit & Compliance Trail</h2>
          <p className="module-subtext">
            Immutable chronological trace of all loan disbursals, repayments, underwriting decisions, and status shifts.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={exportJSON}
          title="Download trace logs as JSON"
        >
          <Download size={15} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="view-filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search audit trail by event, detail, actor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-field"
          />
        </div>

        <div className="filter-pills-cluster">
          {['ALL', 'COLLECTION', 'PORTFOLIO', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn-filter-pill ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="audit-timeline-container">
        {filteredLogs.length === 0 ? (
          <div className="table-empty-cell p-8">
            No audit records match the current filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="audit-event-card">
              <div className="event-icon-col">
                <div
                  className={`event-icon-circle ${
                    log.category === 'COLLECTION'
                      ? 'cat-collection'
                      : log.category === 'PORTFOLIO'
                      ? 'cat-portfolio'
                      : 'cat-system'
                  }`}
                >
                  <Activity size={14} />
                </div>
              </div>

              <div className="event-body-col">
                <div className="event-header-line">
                  <strong className="event-title">{log.title}</strong>
                  <span className={`event-category-badge ${log.category.toLowerCase()}`}>
                    {log.category}
                  </span>
                </div>
                <p className="event-detail-text">{log.detail}</p>
                <div className="event-meta-line">
                  <span className="event-meta-item">
                    <Clock size={12} /> {log.timestamp}
                  </span>
                  <span className="event-meta-item">
                    <User size={12} /> {log.actor}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
