import { useState } from 'react'
import {
  User,
  Search,
  Plus,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertOctagon,
  MoreHorizontal
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function CustomersView() {
  const { customers, setActiveModal } = useDashboard()
  const [searchTerm, setSearchTerm] = useState('')

  // Dynamically compute KPI counters
  const totalCount = customers.length
  const verifiedCount = customers.filter(
    (c) => (c.kycStatus || '').toLowerCase() === 'verified'
  ).length
  const pendingCount = customers.filter(
    (c) => (c.kycStatus || '').toLowerCase() === 'pending'
  ).length
  const blacklistedCount = customers.filter(
    (c) =>
      (c.status || '').toLowerCase() === 'blacklisted' ||
      (c.kycStatus || '').toLowerCase() === 'blacklisted'
  ).length

  // Filter customers by name, phone, or SGTPL customer ID
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true
    const q = searchTerm.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.employment && c.employment.toLowerCase().includes(q))
    )
  })

  return (
    <div className="cust-view-container">
      {/* Header Row */}
      <div className="cust-header-row">
        <div>
          <h2 className="cust-heading">Customers</h2>
          <p className="cust-subheading">Manage customer profiles and KYC</p>
        </div>

        <button
          type="button"
          className="btn-add-customer-main"
          onClick={() => setActiveModal('new-customer')}
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* 4 Stat Cards Row */}
      <div className="cust-kpi-grid">
        {/* Total Customers */}
        <div className="cust-kpi-card">
          <div className="cust-kpi-left">
            <span className="cust-kpi-label">Total Customers</span>
            <strong className="cust-kpi-num total">{totalCount}</strong>
          </div>
          <div className="cust-kpi-icon-box total">
            <User size={19} />
          </div>
        </div>

        {/* KYC Verified */}
        <div className="cust-kpi-card">
          <div className="cust-kpi-left">
            <span className="cust-kpi-label">KYC Verified</span>
            <strong className="cust-kpi-num verified">{verifiedCount}</strong>
          </div>
          <div className="cust-kpi-icon-box verified">
            <CheckCircle2 size={19} />
          </div>
        </div>

        {/* KYC Pending */}
        <div className="cust-kpi-card">
          <div className="cust-kpi-left">
            <span className="cust-kpi-label">KYC Pending</span>
            <strong className="cust-kpi-num pending">{pendingCount}</strong>
          </div>
          <div className="cust-kpi-icon-box pending">
            <AlertCircle size={19} />
          </div>
        </div>

        {/* Blacklisted */}
        <div className="cust-kpi-card">
          <div className="cust-kpi-left">
            <span className="cust-kpi-label">Blacklisted</span>
            <strong className="cust-kpi-num blacklisted">{blacklistedCount}</strong>
          </div>
          <div className="cust-kpi-icon-box blacklisted">
            <AlertOctagon size={19} />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="cust-search-bar">
        <Search size={16} className="cust-search-icon" />
        <input
          type="text"
          placeholder="Search by name, mobile, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="cust-search-input"
        />
      </div>

      {/* Customer Table */}
      <div className="cust-table-card">
        <table className="cust-table">
          <thead>
            <tr>
              <th>CUSTOMER ID</th>
              <th>NAME</th>
              <th>CONTACT</th>
              <th>LOCATION</th>
              <th>KYC STATUS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="cust-empty-row">
                  No customers match your search criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((cust) => {
                const initial = (cust.name || 'c').trim().charAt(0).toLowerCase()
                const kycBadgeClass = (cust.kycStatus || 'pending').toLowerCase()
                const statusBadgeClass = (cust.status || 'active').toLowerCase()

                return (
                  <tr key={cust.id}>
                    <td>
                      <span className="cust-id-link">{cust.id}</span>
                    </td>
                    <td>
                      <div className="cust-name-cell">
                        <div className="cust-avatar-circle">{initial}</div>
                        <div className="cust-name-meta">
                          <span className="cust-name-title">{cust.name}</span>
                          <span className="cust-name-sub">
                            {cust.employment || 'self employed'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cust-icon-cell">
                        <Phone size={13} />
                        <span>{cust.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cust-icon-cell">
                        <MapPin size={13} />
                        <span>{cust.location || ', '}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`cust-status-badge ${kycBadgeClass}`}>
                        {cust.kycStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`cust-status-badge ${statusBadgeClass}`}>
                        {cust.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cust-btn-dots"
                        title="Customer options"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
