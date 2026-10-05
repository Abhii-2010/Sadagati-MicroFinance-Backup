import { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  ExternalLink,
  Building2,
  CreditCard
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import { formatINR } from '../../utils/formatters'

export default function EmployeeCustomersView({ onOpenAddCustomer, onSelectLoanForPayment }) {
  const { branchCustomers, currentUser, branchLoans } = useDashboard()
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState('ALL')
  const [selectedCust, setSelectedCust] = useState(null)

  const filteredCustomers = useMemo(() => {
    return branchCustomers.filter((c) => {
      const matchSearch =
        !search ||
        (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
        (c.id && c.id.toLowerCase().includes(search.toLowerCase())) ||
        (c.phone && c.phone.includes(search)) ||
        (c.primaryMobile && c.primaryMobile.includes(search))

      const matchKyc =
        kycFilter === 'ALL' ||
        (kycFilter === 'VERIFIED' && c.kycStatus === 'Verified') ||
        (kycFilter === 'PENDING' && c.kycStatus === 'Pending')

      return matchSearch && matchKyc
    })
  }, [branchCustomers, search, kycFilter])

  return (
    <div>
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Branch Customers</h1>
          <p className="emp-page-subtitle">
            Showing customers assigned to <strong>{currentUser?.branch}</strong> ({filteredCustomers.length} total)
          </p>
        </div>

        <button type="button" className="emp-quick-action-emerald" onClick={onOpenAddCustomer}>
          <Plus size={14} />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by Customer ID (SGTPL...), Name, or Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: '38px', background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0 12px 0 36px', color: '#fff', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'VERIFIED', 'PENDING'].map((k) => (
            <button
              key={k}
              type="button"
              className={`emp-nav-btn ${kycFilter === k ? 'is-active' : ''}`}
              style={{ width: 'auto', padding: '0 12px', height: '38px' }}
              onClick={() => setKycFilter(k)}
            >
              {k === 'ALL' ? 'All KYC' : k === 'VERIFIED' ? 'Verified' : 'Pending KYC'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="emp-card-section" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Location / Center</th>
                <th>KYC Status</th>
                <th>Active Loans</th>
                <th>Join Date</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No customers found matching your filter in {currentUser?.branch}.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedCust(c)}>
                    <td>
                      <span className="badge-sapphire">{c.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{c.name || c.fullName}</strong>
                      {c.husbandName && (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>w/o {c.husbandName}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                        <Phone size={12} color="#10b981" />
                        <span>{c.phone || c.primaryMobile}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {c.center || c.location || `${c.city || 'Jaipur'}`}
                      </div>
                    </td>
                    <td>
                      {c.kycStatus === 'Verified' ? (
                        <span className="badge-emerald">Verified</span>
                      ) : (
                        <span className="badge-amber">Pending</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: c.activeLoans > 0 ? '#38bdf8' : '#64748b' }}>
                        {c.activeLoans || 0} active
                      </span>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{c.joinDate || 'Recent'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="emp-quick-action-sapphire"
                        style={{ padding: '4px 10px', fontSize: '11px', marginLeft: 'auto' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCust(c)
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCust && (
        <div className="emp-modal-backdrop" onClick={() => setSelectedCust(null)}>
          <div className="emp-modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="emp-modal-header">
              <div>
                <h3 className="emp-modal-title">{selectedCust.name || selectedCust.fullName}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                  ID: <strong style={{ color: '#38bdf8' }}>{selectedCust.id}</strong> • Branch: {selectedCust.branch || currentUser?.branch}
                </p>
              </div>
              <button type="button" className="emp-btn-icon" onClick={() => setSelectedCust(null)}>
                ✕
              </button>
            </div>

            <div className="emp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>KYC Status</span>
                  <strong style={{ color: selectedCust.kycStatus === 'Verified' ? '#34d399' : '#fbbf24' }}>
                    {selectedCust.kycStatus || 'Verified'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Credit Score</span>
                  <strong style={{ color: '#38bdf8' }}>{selectedCust.creditScore || 720}</strong>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Total Borrowed</span>
                  <strong style={{ color: '#ffffff' }}>{formatINR(selectedCust.totalBorrowed || 0)}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Primary Mobile</span>
                  <span style={{ color: '#ffffff' }}>{selectedCust.phone || selectedCust.primaryMobile}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Occupation</span>
                  <span style={{ color: '#ffffff' }}>{selectedCust.occupation || selectedCust.employment || 'Self Employed'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Aadhaar Number</span>
                  <span style={{ color: '#ffffff' }}>{selectedCust.aadhaarNumber || 'Verified on file'}</span>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>PAN Card</span>
                  <span style={{ color: '#ffffff' }}>{selectedCust.panNumber || 'Verified on file'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Address</span>
                  <span style={{ color: '#ffffff' }}>{selectedCust.fullAddress || selectedCust.addressLine || `${selectedCust.city || 'Jaipur'}, Rajasthan`}</span>
                </div>
              </div>
            </div>

            <div className="emp-modal-footer">
              <button
                type="button"
                className="emp-quick-action-emerald"
                onClick={() => setSelectedCust(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
