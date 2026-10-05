import { useState } from 'react'
import {
  X,
  History,
  Search,
  Download,
  Clock,
  User,
  Activity
} from 'lucide-react'

import { useDashboard } from '../context/DashboardContext'

export default function LiveTraceDrawer({ isOpen, onClose }) {
  const { traceLogs, lastSyncTime } = useDashboard()
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  const categories = ['ALL', 'COLLECTION', 'PORTFOLIO', 'STATUS', 'SYSTEM']

  const filteredLogs = traceLogs.filter((log) => {
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.delta && log.delta.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(traceLogs, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `sadagati-trace-logs-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'COLLECTION':
        return 'cat-collection'
      case 'PORTFOLIO':
        return 'cat-portfolio'
      case 'STATUS':
        return 'cat-status'
      case 'SYSTEM':
      default:
        return 'cat-system'
    }
  }

  return (
    <div className="trace-drawer-overlay" onClick={onClose}>
      <div
        className="trace-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="trace-drawer-header">
          <div className="drawer-title-group">
            <div className="drawer-icon-wrap">
              <History size={18} />
            </div>
            <div>
              <h2 className="drawer-title">Live Audit & Trace Trail</h2>
              <p className="drawer-sub">
                Real-time chronological events • <span className="sync-text">{lastSyncTime}</span>
              </p>
            </div>
          </div>

          <div className="drawer-actions">
            <button
              type="button"
              className="drawer-icon-btn"
              onClick={exportLogs}
              title="Export Trace Logs to JSON"
            >
              <Download size={16} />
            </button>
            <button
              type="button"
              className="drawer-icon-btn"
              onClick={onClose}
              title="Close Drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="trace-filter-bar">
          <div className="trace-search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search traces by agent, center, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="trace-search-input"
            />
          </div>

          <div className="category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Trace List Feed */}
        <div className="trace-logs-stream">
          {filteredLogs.length === 0 ? (
            <div className="empty-trace-state">
              <Activity size={32} className="empty-trace-icon" />
              <p>No trace events found matching the filter criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="trace-item-card">
                <div className="trace-timeline-indicator">
                  <div className={`indicator-dot ${getCategoryBadgeClass(log.category)}`} />
                  <div className="indicator-line" />
                </div>

                <div className="trace-item-body">
                  <div className="trace-item-head">
                    <span className={`trace-cat-tag ${getCategoryBadgeClass(log.category)}`}>
                      {log.category}
                    </span>
                    <span className="trace-time">
                      <Clock size={11} /> {log.timeFormatted}
                    </span>
                  </div>

                  <h4 className="trace-event-title">{log.title}</h4>
                  <p className="trace-event-detail">{log.detail}</p>

                  <div className="trace-item-meta">
                    <span className="trace-actor">
                      <User size={12} /> {log.actor}
                    </span>

                    {log.delta && (
                      <span className={`trace-delta-pill ${log.delta.startsWith('+') ? 'delta-pos' : 'delta-neutral'}`}>
                        {log.delta}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="trace-drawer-footer">
          <div className="total-traces-count">
            Showing <strong>{filteredLogs.length}</strong> of {traceLogs.length} recorded events
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
          >
            Close Trace Hub
          </button>
        </div>
      </div>
    </div>
  )
}
