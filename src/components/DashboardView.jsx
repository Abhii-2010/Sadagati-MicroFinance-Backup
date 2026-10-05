import { Plus } from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'
import TopMetricCards from './TopMetricCards'
import CollectionTrendChart from './CollectionTrendChart'
import PortfolioStatusDonut from './PortfolioStatusDonut'
import PendingApprovalsCard from './PendingApprovalsCard'
import RecentPaymentsCard from './RecentPaymentsCard'
import CollectionTrackerCard from './CollectionTrackerCard'
import BottomSummaryCards from './BottomSummaryCards'

export default function DashboardView() {
  const { setActiveModal } = useDashboard()

  return (
    <div className="dashboard-content-area">
      {/* Welcome Banner Row */}
      <div className="welcome-banner-row">
        <div className="welcome-text-col">
          <div className="welcome-pill-live">
            <span className="live-status-ping" /> LIVE PORTFOLIO ACTIVE
          </div>
          <h2 className="welcome-heading">Welcome back, Abhi</h2>
          <p className="welcome-subtext">Real-time microfinance ledger — all payments & approvals update live.</p>
        </div>

        <div className="welcome-actions-cluster">
          <button
            type="button"
            className="btn-action-emerald"
            onClick={() => setActiveModal('record-payment')}
            title="Record a loan collection deposit"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Record Payment</span>
          </button>

          <button
            type="button"
            className="btn-new-application"
            onClick={() => setActiveModal('new-application')}
            title="Register a new borrower loan application"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Top Metric Cards */}
      <TopMetricCards />

      {/* Row 2: Collection Trend Chart & Portfolio Status Donut */}
      <div className="charts-split-grid">
        <div className="chart-col-trend">
          <CollectionTrendChart />
        </div>
        <div className="chart-col-status">
          <PortfolioStatusDonut />
        </div>
      </div>

      {/* Row 3: Pending Approvals & Recent Payments */}
      <div className="activity-split-grid">
        <div className="activity-col-approvals">
          <PendingApprovalsCard />
        </div>
        <div className="activity-col-payments">
          <RecentPaymentsCard />
        </div>
      </div>

      {/* Row 4: Collection Tracker — Today */}
      <CollectionTrackerCard />

      {/* Row 5: 4 Bottom Mini Summary Cards */}
      <BottomSummaryCards />
    </div>
  )
}
