import {
  CreditCard,
  TrendingUp,
  Wallet,
  AlertTriangle
} from 'lucide-react'
import { useDashboard } from '../context/DashboardContext'

export default function TopMetricCards() {
  const { metrics, formatINR } = useDashboard()

  return (
    <div className="top-metrics-grid">
      {/* 1. TOTAL PORTFOLIO */}
      <div className="metric-card-box">
        <div className="metric-card-top">
          <span className="metric-card-label">TOTAL PORTFOLIO</span>
          <div className="metric-icon-wrap icon-blue">
            <CreditCard size={18} className="metric-icon-svg" />
          </div>
        </div>

        <div className="metric-card-value">
          {formatINR(metrics.totalPortfolio)}
        </div>

        <div className="metric-card-bottom">
          <span className="metric-card-sub">{metrics.activeLoans} Active Loans</span>
          <span className="metric-card-trend-green">
            +{metrics.portfolioGrowthRate}% from last month
          </span>
        </div>
      </div>

      {/* 2. OUTSTANDING AMOUNT */}
      <div className="metric-card-box">
        <div className="metric-card-top">
          <span className="metric-card-label">OUTSTANDING AMOUNT</span>
          <div className="metric-icon-wrap icon-emerald">
            <TrendingUp size={18} className="metric-icon-svg" />
          </div>
        </div>

        <div className="metric-card-value">
          {formatINR(metrics.outstandingAmount)}
        </div>

        <div className="metric-card-bottom">
          <span className="metric-card-sub">{metrics.outstandingBreakdown}</span>
        </div>
      </div>

      {/* 3. TODAY'S COLLECTION */}
      <div className="metric-card-box">
        <div className="metric-card-top">
          <span className="metric-card-label">TODAY'S COLLECTION</span>
          <div className="metric-icon-wrap icon-purple">
            <Wallet size={18} className="metric-icon-svg" />
          </div>
        </div>

        <div className="metric-card-value">
          {formatINR(metrics.todaysCollection)}
        </div>

        <div className="metric-card-bottom">
          <span className="metric-card-sub">
            {metrics.paymentsReceivedCount} payments received
          </span>
        </div>
      </div>

      {/* 4. OVERDUE AMOUNT */}
      <div className="metric-card-box">
        <div className="metric-card-top">
          <span className="metric-card-label">OVERDUE AMOUNT</span>
          <div className="metric-icon-wrap icon-rose">
            <AlertTriangle size={18} className="metric-icon-svg" />
          </div>
        </div>

        <div className="metric-card-value">
          {formatINR(metrics.overdueAmount)}
        </div>

        <div className="metric-card-bottom">
          <span className="metric-card-sub">
            {metrics.npaAccountsCount} NPA accounts
          </span>
        </div>
      </div>
    </div>
  )
}
