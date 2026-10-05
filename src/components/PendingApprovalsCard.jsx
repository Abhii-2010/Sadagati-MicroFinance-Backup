import { useDashboard } from '../context/DashboardContext'

export default function PendingApprovalsCard() {
  const { pendingApprovals, setActiveModal, setSelectedApplication, formatINR } = useDashboard()

  const handleReview = (app) => {
    setSelectedApplication(app)
    setActiveModal('review-app')
  }

  const handleViewAll = () => {
    setActiveModal('view-all-approvals')
  }

  return (
    <div className="card-box pending-approvals-card">
      <div className="card-header-with-action">
        <div className="card-title-group">
          <h3 className="card-title">Pending Approvals</h3>
          <span className="count-pill pill-amber">{pendingApprovals.length}</span>
        </div>
        <div className="card-header-actions-duo">
          <button
            type="button"
            className="btn-header-action-blue"
            onClick={() => setActiveModal('new-application')}
            title="Submit new application"
          >
            + New Loan
          </button>
          <button
            type="button"
            className="link-view-all"
            onClick={handleViewAll}
          >
            View All
          </button>
        </div>
      </div>

      <div className="approvals-list">
        {pendingApprovals.length === 0 ? (
          <div className="empty-state-card">
            <span>No pending applications to review</span>
          </div>
        ) : (
          pendingApprovals.map((app) => (
            <div key={app.id} className="approval-row-item">
              <div className="approval-info">
                <div className="approval-id">{app.id}</div>
                <div className="approval-meta">
                  {formatINR(app.amount)} • {app.tenure}
                </div>
              </div>

              <button
                type="button"
                className="btn-outline-review"
                onClick={() => handleReview(app)}
              >
                Review
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
