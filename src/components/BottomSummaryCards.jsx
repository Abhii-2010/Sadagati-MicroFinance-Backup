import {
  Users,
  Send,
  Clock,
  PieChart
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function BottomSummaryCards() {
  const { metrics, customers } = useDashboard()

  return (
    <div className="bottom-summary-grid">
      {/* 1. Total Customers */}
      <div className="summary-mini-card">
        <div className="mini-icon-box icon-soft-blue">
          <Users size={16} />
        </div>
        <div className="mini-content">
          <div className="mini-value">{customers ? customers.length : (metrics.totalCustomers || 0)}</div>
          <div className="mini-label">Total Customers</div>
        </div>
      </div>

      {/* 2. Disbursed this Month */}
      <div className="summary-mini-card">
        <div className="mini-icon-box icon-soft-emerald">
          <Send size={16} />
        </div>
        <div className="mini-content">
          <div className="mini-value">{metrics.disbursedThisMonth}</div>
          <div className="mini-label">Disbursed this Month</div>
        </div>
      </div>

      {/* 3. Pending Applications */}
      <div className="summary-mini-card">
        <div className="mini-icon-box icon-soft-amber">
          <Clock size={16} />
        </div>
        <div className="mini-content">
          <div className="mini-value">{metrics.pendingApplicationsCount}</div>
          <div className="mini-label">Pending Applications</div>
        </div>
      </div>

      {/* 4. NPA Ratio */}
      <div className="summary-mini-card">
        <div className="mini-icon-box icon-soft-rose">
          <PieChart size={16} />
        </div>
        <div className="mini-content">
          <div className="mini-value">{metrics.npaRatio.toFixed(1)}%</div>
          <div className="mini-label">NPA Ratio</div>
        </div>
      </div>
    </div>
  )
}
