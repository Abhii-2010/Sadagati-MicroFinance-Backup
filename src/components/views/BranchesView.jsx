import { useState, useMemo } from 'react'
import {
  Building2,
  CheckCircle2,
  Users,
  Search,
  Plus,
  X,
  Edit3,
  Ban,
  Trash2,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './Branches.css'

export default function BranchesView() {
  const {
    branches,
    addBranch,
    updateBranch,
    toggleBranchStatus,
    deleteBranch,
    formatINR
  } = useDashboard()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Form State for Add New Branch (matches Screenshot 2)
  const initialBranchForm = {
    branchCode: 'BR001',
    branchName: '',
    addressLine1: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    region: '',
    zone: '',
    cashLimit: '',
    disbursementLimit: '',
    active: true
  }

  const [branchForm, setBranchForm] = useState(initialBranchForm)

  // Open Add Modal with next branch code
  const handleOpenAdd = () => {
    const nextNum = (branches?.length || 0) + 1
    const nextCode = `BR00${nextNum}`
    setBranchForm({
      ...initialBranchForm,
      branchCode: nextCode
    })
    setIsAddModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (branch) => {
    setEditingBranch(branch)
    setBranchForm({
      branchCode: branch.code || branch.id,
      branchName: branch.name,
      addressLine1: branch.address || '',
      city: branch.city || '',
      district: branch.district || '',
      state: branch.state || '',
      pincode: branch.pincode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      region: branch.region || '',
      zone: branch.zone || '',
      cashLimit: branch.cashLimit || '',
      disbursementLimit: branch.disbursementLimit || '',
      active: branch.status === 'Active'
    })
    setIsEditModalOpen(true)
  }

  // Submit Add / Edit Form
  const handleSubmit = (e) => {
    e.preventDefault()

    const branchPayload = {
      code: branchForm.branchCode || `BR00${(branches?.length || 0) + 1}`,
      id: branchForm.branchCode || `BR00${(branches?.length || 0) + 1}`,
      name: branchForm.branchName || 'Main Branch',
      address: branchForm.addressLine1,
      city: branchForm.city,
      district: branchForm.district,
      state: branchForm.state,
      pincode: branchForm.pincode,
      phone: branchForm.phone,
      email: branchForm.email,
      region: branchForm.region,
      zone: branchForm.zone,
      cashLimit: Number(branchForm.cashLimit) || 500000,
      disbursementLimit: Number(branchForm.disbursementLimit) || 2000000,
      active: branchForm.active,
      status: branchForm.active ? 'Active' : 'Inactive'
    }

    if (isEditModalOpen && editingBranch) {
      updateBranch(editingBranch.id || editingBranch.code, branchPayload)
      setIsEditModalOpen(false)
      setEditingBranch(null)
    } else {
      addBranch(branchPayload)
      setIsAddModalOpen(false)
    }
  }

  // Computed Counters
  const totalBranchesCount = branches?.length || 0
  const activeBranchesCount = (branches || []).filter((b) => b.status === 'Active').length
  const totalStaffCount = 4 // Base44 LMS initial staff count

  // Filtered branches by search
  const filteredBranches = useMemo(() => {
    if (!searchTerm.trim()) return branches || []
    const q = searchTerm.toLowerCase()
    return (branches || []).filter((b) => {
      return (
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.code && b.code.toLowerCase().includes(q)) ||
        (b.city && b.city.toLowerCase().includes(q)) ||
        (b.district && b.district.toLowerCase().includes(q)) ||
        (b.region && b.region.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q))
      )
    })
  }, [branches, searchTerm])

  return (
    <div className="br-container">
      {/* --------------------------------------------------------------------
          1. HEADER ROW: Matches Base44 LMS screenshot
          -------------------------------------------------------------------- */}
      <div className="br-header-row">
        <div className="br-header-titles">
          <h2 className="br-main-heading">Branches</h2>
          <p className="br-sub-heading">Manage branch offices</p>
        </div>

        <button
          type="button"
          className="btn-add-branch-main"
          onClick={handleOpenAdd}
        >
          <Plus size={16} />
          <span>Add Branch</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          2. TOP KPI CARDS (Total Branches, Active, Total Staff)
          -------------------------------------------------------------------- */}
      <div className="br-kpi-grid">
        {/* Total Branches */}
        <div className="br-kpi-card">
          <div className="br-kpi-info">
            <span className="br-kpi-title">Total Branches</span>
            <strong className="br-kpi-value">{totalBranchesCount}</strong>
          </div>
          <div className="br-kpi-icon-box blue">
            <Building2 size={20} />
          </div>
        </div>

        {/* Active */}
        <div className="br-kpi-card">
          <div className="br-kpi-info">
            <span className="br-kpi-title">Active</span>
            <strong className="br-kpi-value">{activeBranchesCount}</strong>
          </div>
          <div className="br-kpi-icon-box green">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Total Staff */}
        <div className="br-kpi-card">
          <div className="br-kpi-info">
            <span className="br-kpi-title">Total Staff</span>
            <strong className="br-kpi-value">{totalStaffCount}</strong>
          </div>
          <div className="br-kpi-icon-box purple">
            <Users size={20} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          3. SEARCH BAR
          -------------------------------------------------------------------- */}
      <div className="br-search-box">
        <Search size={15} className="br-search-icon" />
        <input
          type="text"
          placeholder="Search branches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="br-search-input"
        />
      </div>

      {/* --------------------------------------------------------------------
          4. BRANCHES TABLE
          BRANCH | LOCATION | CONTACT | REGION / ZONE | STAFF | STATUS | ACTIONS
          -------------------------------------------------------------------- */}
      <div className="br-table-card">
        <div className="br-table-responsive">
          <table className="br-table">
            <thead>
              <tr>
                <th>BRANCH</th>
                <th>LOCATION</th>
                <th>CONTACT</th>
                <th>REGION / ZONE</th>
                <th>STAFF</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="br-empty-row">
                    No branches found
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const isActive = branch.status === 'Active'

                  return (
                    <tr key={branch.id || branch.code}>
                      {/* BRANCH */}
                      <td>
                        <div className="br-name-cell">
                          <span className="br-code-badge">{branch.code}</span>
                          <span className="br-name-title">{branch.name}</span>
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td>
                        <div className="br-location-cell">
                          <span>{branch.address || branch.city}</span>
                          <span style={{ color: '#64748b', fontSize: '11px' }}>
                            {branch.district ? `${branch.district}, ` : ''}
                            {branch.state} {branch.pincode ? `- ${branch.pincode}` : ''}
                          </span>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div className="br-contact-cell">
                          {branch.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} /> {branch.phone}
                            </span>
                          )}
                          {branch.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                              <Mail size={11} /> {branch.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* REGION / ZONE */}
                      <td>
                        <span style={{ color: '#cbd5e1' }}>
                          {branch.region || 'North'} {branch.zone ? `/ ${branch.zone}` : ''}
                        </span>
                      </td>

                      {/* STAFF */}
                      <td>
                        <span style={{ color: '#cbd5e1' }}>
                          {branch.staffCount || 1} Officers
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`br-status-pill ${isActive ? 'active' : 'inactive'}`}>
                          {branch.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="br-actions-cell">
                          <button
                            type="button"
                            className="btn-br-action"
                            onClick={() => handleOpenEdit(branch)}
                            title="Edit Branch"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn-br-action"
                            onClick={() => toggleBranchStatus(branch.id || branch.code)}
                            title={isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Ban size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn-br-action danger"
                            onClick={() => {
                              if (confirm(`Delete branch ${branch.name}?`)) {
                                deleteBranch(branch.id || branch.code)
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MODAL: ADD NEW BRANCH (Exact Match to Screenshot 2)
          ==================================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="br-modal-overlay">
          <div className="br-modal-box">
            {/* Modal Header */}
            <div className="br-modal-header">
              <h3 className="br-modal-title">
                {isEditModalOpen ? `Edit Branch: ${editingBranch?.name}` : 'Add New Branch'}
              </h3>
              <button
                type="button"
                className="br-modal-close-btn"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                  setEditingBranch(null)
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="br-modal-body">
                {/* Row 1: Branch Code * | Branch Name * */}
                <div className="br-form-row-2">
                  <div className="br-form-group">
                    <label className="br-form-label">
                      Branch Code <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.branchCode}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, branchCode: e.target.value })
                      }
                      placeholder="BR001"
                      required
                    />
                  </div>

                  <div className="br-form-group">
                    <label className="br-form-label">
                      Branch Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.branchName}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, branchName: e.target.value })
                      }
                      placeholder="e.g. Central Jaipur Branch"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Address Line 1 */}
                <div className="br-form-group">
                  <label className="br-form-label">Address Line 1</label>
                  <input
                    type="text"
                    className="br-form-input"
                    value={branchForm.addressLine1}
                    onChange={(e) =>
                      setBranchForm({ ...branchForm, addressLine1: e.target.value })
                    }
                    placeholder="Physical branch street address..."
                  />
                </div>

                {/* Row 3: City | District */}
                <div className="br-form-row-2">
                  <div className="br-form-group">
                    <label className="br-form-label">City</label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.city}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, city: e.target.value })
                      }
                      placeholder="e.g. Jaipur"
                    />
                  </div>

                  <div className="br-form-group">
                    <label className="br-form-label">District</label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.district}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, district: e.target.value })
                      }
                      placeholder="e.g. Jaipur"
                    />
                  </div>
                </div>

                {/* Row 4: State | Pincode */}
                <div className="br-form-row-2">
                  <div className="br-form-group">
                    <label className="br-form-label">State</label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.state}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, state: e.target.value })
                      }
                      placeholder="e.g. Rajasthan"
                    />
                  </div>

                  <div className="br-form-group">
                    <label className="br-form-label">Pincode</label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.pincode}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, pincode: e.target.value })
                      }
                      placeholder="e.g. 302001"
                    />
                  </div>
                </div>

                {/* Row 5: Phone | Email */}
                <div className="br-form-row-2">
                  <div className="br-form-group">
                    <label className="br-form-label">Phone</label>
                    <input
                      type="tel"
                      className="br-form-input"
                      value={branchForm.phone}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, phone: e.target.value })
                      }
                      placeholder="+91 98000 00000"
                    />
                  </div>

                  <div className="br-form-group">
                    <label className="br-form-label">Email</label>
                    <input
                      type="email"
                      className="br-form-input"
                      value={branchForm.email}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, email: e.target.value })
                      }
                      placeholder="branch@sadagati.com"
                    />
                  </div>
                </div>

                {/* Row 6: Region | Zone */}
                <div className="br-form-row-2">
                  <div className="br-form-group">
                    <label className="br-form-label">Region</label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.region}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, region: e.target.value })
                      }
                      placeholder="e.g. North"
                    />
                  </div>

                  <div className="br-form-group">
                    <label className="br-form-label">Zone</label>
                    <input
                      type="text"
                      className="br-form-input"
                      value={branchForm.zone}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, zone: e.target.value })
                      }
                      placeholder="e.g. Zone 1"
                    />
                  </div>
                </div>

                {/* Row 7: Cash Limit (₹) | Disbursement Limit (₹) */}
                <div className="br-form-row-2">
                  <div className="br-form-group">
                    <label className="br-form-label">Cash Limit (₹)</label>
                    <input
                      type="number"
                      className="br-form-input"
                      value={branchForm.cashLimit}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, cashLimit: e.target.value })
                      }
                      placeholder="500000"
                    />
                  </div>

                  <div className="br-form-group">
                    <label className="br-form-label">Disbursement Limit (₹)</label>
                    <input
                      type="number"
                      className="br-form-input"
                      value={branchForm.disbursementLimit}
                      onChange={(e) =>
                        setBranchForm({ ...branchForm, disbursementLimit: e.target.value })
                      }
                      placeholder="2000000"
                    />
                  </div>
                </div>

                {/* Row 8: Active Toggle Switch Card */}
                <div
                  className="br-switch-card"
                  onClick={() =>
                    setBranchForm({
                      ...branchForm,
                      active: !branchForm.active
                    })
                  }
                >
                  <div className="br-switch-info">
                    <span className="br-switch-title">Active</span>
                    <span className="br-switch-sub">Branch is operational</span>
                  </div>
                  <div
                    className={`br-switch-toggle ${
                      branchForm.active ? 'is-checked' : ''
                    }`}
                  >
                    <div className="br-switch-knob"></div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions: Cancel (left) | Add Branch (right) */}
              <div className="br-modal-actions">
                <button
                  type="button"
                  className="btn-br-modal-cancel"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setIsEditModalOpen(false)
                    setEditingBranch(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-br-modal-submit">
                  {isEditModalOpen ? 'Save Changes' : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
