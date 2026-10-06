import { useState, useMemo } from 'react'
import {
  Users,
  CheckCircle2,
  Shield,
  Building2,
  Search,
  Plus,
  Mail,
  MoreVertical,
  X,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Phone,
  UserCheck,
  Ban,
  Trash2,
  Edit2,
  Sliders,
  Send,
  Eye,
  KeyRound
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './UserManagement.css'

const MODULE_LIST = [
  { id: 'dashboard', label: 'Dashboard & Portfolio Analytics' },
  { id: 'customers', label: 'Customers & KYC Records' },
  { id: 'loanApplications', label: 'Loan Applications (Apply & Review)' },
  { id: 'loanPortfolio', label: 'Loan Portfolio & Schedules' },
  { id: 'collections', label: 'Daily Field Collections' },
  { id: 'fieldVisits', label: 'Field Visits & Geolocation Routing' },
  { id: 'payments', label: 'Payments & Direct Receipts' },
  { id: 'disbursements', label: 'Loan Fund Disbursements' },
  { id: 'accounting', label: 'Accounting & General Ledger' },
  { id: 'reports', label: 'Financial Reports & Audits' },
  { id: 'loanProducts', label: 'Loan Products Configuration' },
  { id: 'branches', label: 'Branch Operations & Cash Limits' },
  { id: 'userManagement', label: 'User Management & Permissions' },
  { id: 'settings', label: 'System Configuration' }
]

const DEFAULT_LIMITED_PERMISSIONS = {
  dashboard: { read: true, write: false },
  customers: { read: true, write: true },
  loanApplications: { read: true, write: true },
  loanPortfolio: { read: true, write: false },
  collections: { read: true, write: true },
  fieldVisits: { read: true, write: true },
  payments: { read: true, write: true },
  disbursements: { read: false, write: false },
  accounting: { read: false, write: false },
  reports: { read: true, write: false },
  loanProducts: { read: false, write: false },
  branches: { read: false, write: false },
  userManagement: { read: false, write: false },
  settings: { read: false, write: false }
}

const DEFAULT_FULL_PERMISSIONS = {
  dashboard: { read: true, write: true },
  customers: { read: true, write: true },
  loanApplications: { read: true, write: true },
  loanPortfolio: { read: true, write: true },
  collections: { read: true, write: true },
  fieldVisits: { read: true, write: true },
  payments: { read: true, write: true },
  disbursements: { read: true, write: true },
  accounting: { read: true, write: true },
  reports: { read: true, write: true },
  loanProducts: { read: true, write: true },
  branches: { read: true, write: true },
  userManagement: { read: true, write: true },
  settings: { read: true, write: true }
}

export default function UserManagementView() {
  const {
    users = [],
    invitations = [],
    branches = [],
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    createInvitation,
    acceptInvitation,
    revokeInvitation,
    resendInvitation,
    addToast
  } = useDashboard()

  const [activeTab, setActiveTab] = useState('staff') // 'staff' | 'invitations'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL')
  const [openDropdownId, setOpenDropdownId] = useState(null)

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteModalTab, setInviteModalTab] = useState('email') // 'email' | 'direct'
  const [activeSentInvite, setActiveSentInvite] = useState(null)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false)
  const [onboardingInvite, setOnboardingInvite] = useState(null)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Invite Form State
  const initialForm = {
    email: '',
    name: '',
    phone: '',
    role: 'User',
    branch: '-',
    accessLevel: 'limited', // 'full' | 'limited'
    permissions: { ...DEFAULT_LIMITED_PERMISSIONS },
    limits: {
      maxApprovalAmount: 25000,
      maxDisbursementAmount: 0,
      canApproveLoans: false,
      canDisburseLoans: false,
      canDeleteRecords: false
    }
  }

  const [formData, setFormData] = useState(initialForm)

  // Onboarding Form State (when invited user enters their details)
  const [onboardingForm, setOnboardingForm] = useState({
    name: '',
    phone: '',
    designation: 'Operations Specialist',
    password: '',
    confirmPassword: '',
    pin: '1234',
    agreeTerms: true
  })

  // Open Invite Modal
  const handleOpenInviteModal = (tab = 'email') => {
    setInviteModalTab(tab)
    setFormData(initialForm)
    setIsInviteModalOpen(true)
  }

  // Handle Access Level Change
  const handleAccessLevelChange = (level) => {
    if (level === 'full') {
      setFormData((prev) => ({
        ...prev,
        accessLevel: 'full',
        permissions: { ...DEFAULT_FULL_PERMISSIONS },
        limits: {
          maxApprovalAmount: 500000,
          maxDisbursementAmount: 1000000,
          canApproveLoans: true,
          canDisburseLoans: true,
          canDeleteRecords: true
        }
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        accessLevel: 'limited',
        permissions: { ...DEFAULT_LIMITED_PERMISSIONS },
        limits: {
          maxApprovalAmount: 25000,
          maxDisbursementAmount: 0,
          canApproveLoans: false,
          canDisburseLoans: false,
          canDeleteRecords: false
        }
      }))
    }
  }

  // Submit Invite or Direct Add
  const handleSubmitInviteOrAdd = (e) => {
    e.preventDefault()

    if (inviteModalTab === 'email') {
      if (!formData.email) {
        addToast('Please provide a valid staff email', 'error')
        return
      }
      const newInvite = createInvitation({
        email: formData.email,
        role: formData.role,
        branch: formData.branch,
        accessLevel: formData.accessLevel,
        permissions: formData.permissions,
        limits: formData.limits
      })
      setIsInviteModalOpen(false)
      setActiveSentInvite(newInvite)
    } else {
      // Direct Add
      if (!formData.name || !formData.email) {
        addToast('Please enter both name and email', 'error')
        return
      }
      addUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        branch: formData.branch,
        accessLevel: formData.accessLevel,
        permissions: formData.permissions,
        limits: formData.limits,
        status: 'Active'
      })
      setIsInviteModalOpen(false)
    }
  }

  // Open Onboarding for an invite
  const handleOpenOnboarding = (invite) => {
    setOnboardingInvite(invite)
    setOnboardingForm({
      name: '',
      phone: '',
      designation: invite.role === 'Admin' ? 'Administrator' : `${invite.role} Associate`,
      password: '',
      confirmPassword: '',
      pin: '1234',
      agreeTerms: true
    })
    setIsOnboardingModalOpen(true)
  }

  // Submit Onboarding
  const handleSubmitOnboarding = (e) => {
    e.preventDefault()
    if (!onboardingForm.name.trim()) {
      addToast('Please enter your full name', 'error')
      return
    }
    if (!onboardingForm.password) {
      addToast('Please create a password for your account', 'error')
      return
    }
    if (onboardingForm.password !== onboardingForm.confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    acceptInvitation(onboardingInvite.token || onboardingInvite.id, {
      name: onboardingForm.name,
      phone: onboardingForm.phone,
      designation: onboardingForm.designation,
      email: onboardingInvite.email,
      role: onboardingInvite.role,
      branch: onboardingInvite.branch,
      accessLevel: onboardingInvite.accessLevel,
      permissions: onboardingInvite.permissions,
      limits: onboardingInvite.limits,
      password: onboardingForm.password
    })

    setIsOnboardingModalOpen(false)
    setActiveSentInvite(null)
    setActiveTab('staff')
  }

  // Copy invitation link helper
  const handleCopyInviteLink = (invite) => {
    const inviteUrl = `${window.location.origin}/?invite=${invite.token}`
    navigator.clipboard?.writeText(inviteUrl)
    setCopiedLink(true)
    addToast('Invitation link copied to clipboard!', 'info')
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Counters for 4 KPI Cards (matches Screenshot)
  const totalUsersCount = users.length
  const activeUsersCount = users.filter((u) => u.status === 'Active').length
  const adminsCount = users.filter((u) => u.role === 'Admin').length
  const fieldAgentsCount = users.filter((u) => u.role === 'Field Agent').length

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchTerm.trim() ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phone && u.phone.includes(searchTerm))

      const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter

      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, selectedRoleFilter])

  return (
    <div className="um-container" onClick={() => setOpenDropdownId(null)}>
      {/* --------------------------------------------------------------------
          1. HEADER ROW: Title, Subtitle, Invite User button (Matches Base44 LMS)
          -------------------------------------------------------------------- */}
      <div className="um-header-row">
        <div className="um-header-titles">
          <h2 className="um-main-heading">User Management</h2>
          <p className="um-sub-heading">Manage staff accounts and permissions</p>
        </div>

        <div className="um-header-actions">
          <button
            type="button"
            className="btn-add-user-direct"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenInviteModal('direct')
            }}
          >
            <Plus size={15} />
            <span>Add User</span>
          </button>

          <button
            type="button"
            className="btn-invite-user-main"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenInviteModal('email')
            }}
          >
            <Plus size={16} />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          2. KPI CARDS (TOTAL USERS, ACTIVE USERS, ADMINS, FIELD AGENTS)
          Matches Screenshot values: 4, 4, 2, 0
          -------------------------------------------------------------------- */}
      <div className="um-kpi-grid">
        {/* TOTAL USERS */}
        <div className="um-kpi-card">
          <div className="um-kpi-info">
            <span className="um-kpi-title">TOTAL USERS</span>
            <strong className="um-kpi-value">{totalUsersCount}</strong>
            <span className="um-kpi-sub">All staff members</span>
          </div>
          <div className="um-kpi-icon-box blue">
            <Users size={20} />
          </div>
        </div>

        {/* ACTIVE USERS */}
        <div className="um-kpi-card">
          <div className="um-kpi-info">
            <span className="um-kpi-title">ACTIVE USERS</span>
            <strong className="um-kpi-value">{activeUsersCount}</strong>
            <span className="um-kpi-sub">Currently active</span>
          </div>
          <div className="um-kpi-icon-box green">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* ADMINS */}
        <div className="um-kpi-card">
          <div className="um-kpi-info">
            <span className="um-kpi-title">ADMINS</span>
            <strong className="um-kpi-value">{adminsCount}</strong>
            <span className="um-kpi-sub">Admin users</span>
          </div>
          <div className="um-kpi-icon-box purple">
            <Shield size={20} />
          </div>
        </div>

        {/* FIELD AGENTS */}
        <div className="um-kpi-card">
          <div className="um-kpi-info">
            <span className="um-kpi-title">FIELD AGENTS</span>
            <strong className="um-kpi-value">{fieldAgentsCount}</strong>
            <span className="um-kpi-sub">Collection agents</span>
          </div>
          <div className="um-kpi-icon-box amber">
            <Building2 size={20} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          3. TABS: Staff Members vs Pending Invitations
          -------------------------------------------------------------------- */}
      <div className="um-tabs-row">
        <button
          type="button"
          className={`um-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <span>Staff Members</span>
          <span className="um-tab-badge">{users.length}</span>
        </button>

        <button
          type="button"
          className={`um-tab-btn ${activeTab === 'invitations' ? 'active' : ''}`}
          onClick={() => setActiveTab('invitations')}
        >
          <span>Pending Invitations</span>
          <span className="um-tab-badge">{invitations.filter((i) => i.status === 'Pending').length}</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          4. SEARCH AND ROLE FILTERS (Matching Screenshot)
          -------------------------------------------------------------------- */}
      <div className="um-filter-row">
        <div className="um-search-box">
          <Search size={15} className="um-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="um-search-input"
          />
        </div>

        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="um-role-select"
        >
          <option value="ALL">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
          <option value="Field Agent">Field Agent</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* --------------------------------------------------------------------
          5. USERS TABLE OR PENDING INVITATIONS TABLE
          -------------------------------------------------------------------- */}
      {activeTab === 'staff' ? (
        <div className="um-table-card">
          <div className="um-table-responsive">
            <table className="um-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>CONTACT</th>
                  <th>ROLE</th>
                  <th>BRANCH</th>
                  <th>STATUS</th>
                  <th>LAST LOGIN</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="um-empty-row">
                      No staff members match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const firstLetter = (user.name || user.email || 'U')[0]
                    const roleClass = (user.role || 'user').toLowerCase().replace(' ', '-')
                    const isActive = user.status === 'Active'

                    return (
                      <tr key={user.id}>
                        {/* USER: Avatar + Name + Email */}
                        <td>
                          <div className="um-user-cell">
                            <div className="um-avatar">{firstLetter}</div>
                            <div className="um-user-meta">
                              <span className="um-user-name">{user.name}</span>
                              <span className="um-user-email">{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT: Mail icon + email */}
                        <td>
                          <div className="um-contact-cell">
                            <Mail size={13} />
                            <span>{user.email}</span>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td>
                          <span className={`um-role-badge ${roleClass}`}>
                            {user.role}
                          </span>
                        </td>

                        {/* BRANCH */}
                        <td>
                          <div className="um-branch-cell">
                            <Building2 size={13} />
                            <span>{user.branch || '-'}</span>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <div className={`um-status-cell ${isActive ? 'active' : 'inactive'}`}>
                            {isActive ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                            <span>{user.status}</span>
                          </div>
                        </td>

                        {/* LAST LOGIN */}
                        <td>
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                            {user.lastLogin || 'Never'}
                          </span>
                        </td>

                        {/* ACTIONS: Three dots menu */}
                        <td>
                          <div className="um-actions-cell" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-um-dots"
                              onClick={() =>
                                setOpenDropdownId(openDropdownId === user.id ? null : user.id)
                              }
                              title="Actions"
                            >
                              •••
                            </button>

                            {openDropdownId === user.id && (
                              <div className="um-dropdown-menu">
                                <button
                                  type="button"
                                  className="um-dropdown-item"
                                  onClick={() => {
                                    setViewingUser(user)
                                    setIsPermissionsModalOpen(true)
                                    setOpenDropdownId(null)
                                  }}
                                >
                                  <Sliders size={13} />
                                  <span>View Limits & Permissions</span>
                                </button>

                                <button
                                  type="button"
                                  className="um-dropdown-item"
                                  onClick={() => {
                                    toggleUserStatus(user.id)
                                    setOpenDropdownId(null)
                                  }}
                                >
                                  {isActive ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                                  <span>{isActive ? 'Deactivate User' : 'Activate User'}</span>
                                </button>

                                {user.role !== 'Admin' && (
                                  <button
                                    type="button"
                                    className="um-dropdown-item danger"
                                    onClick={() => {
                                      if (confirm(`Remove user ${user.name}?`)) {
                                        deleteUser(user.id)
                                      }
                                      setOpenDropdownId(null)
                                    }}
                                  >
                                    <Trash2 size={13} />
                                    <span>Delete Staff</span>
                                  </button>
                                )}
                              </div>
                            )}
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
      ) : (
        /* PENDING INVITATIONS TABLE */
        <div className="um-table-card">
          <div className="um-table-responsive">
            <table className="um-table">
              <thead>
                <tr>
                  <th>INVITED EMAIL</th>
                  <th>ASSIGNED ROLE</th>
                  <th>ACCESS LEVEL</th>
                  <th>BRANCH</th>
                  <th>SENT DATE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {invitations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="um-empty-row">
                      No invitations pending. Click "+ Invite User" above to send an email invite.
                    </td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <div className="um-contact-cell">
                          <Mail size={14} style={{ color: '#38bdf8' }} />
                          <strong style={{ color: '#ffffff' }}>{inv.email}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`um-role-badge ${(inv.role || 'user').toLowerCase()}`}>
                          {inv.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: inv.accessLevel === 'full' ? '#c084fc' : '#38bdf8', fontSize: '12px', fontWeight: 600 }}>
                          {inv.accessLevel === 'full' ? '🛡️ Full Access' : '⚙️ Limited Access'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#94a3b8' }}>{inv.branch || '-'}</span>
                      </td>
                      <td>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                          {new Date(inv.invitedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className={`um-status-cell ${inv.status === 'Accepted' ? 'active' : 'inactive'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {inv.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                className="btn-copy-link"
                                onClick={() => handleCopyInviteLink(inv)}
                                title="Copy invitation onboarding URL"
                              >
                                <Copy size={12} />
                                <span>Copy Link</span>
                              </button>

                              <button
                                type="button"
                                className="btn-test-onboard"
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                                onClick={() => handleOpenOnboarding(inv)}
                                title="Open user details onboarding flow"
                              >
                                <ExternalLink size={12} />
                                <span>Complete Details</span>
                              </button>

                              <button
                                type="button"
                                className="btn-um-dots"
                                style={{ color: '#f87171' }}
                                onClick={() => revokeInvitation(inv.id)}
                                title="Revoke Invitation"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: INVITE USER / ADD USER WITH FULL ACCESS OR LIMITATIONS
          ==================================================================== */}
      {isInviteModalOpen && (
        <div className="um-modal-overlay">
          <div className="um-modal-box">
            {/* Modal Header */}
            <div className="um-modal-header">
              <h3 className="um-modal-title">
                {inviteModalTab === 'email' ? 'Invite Staff Member by Email' : 'Add Staff Member Directly'}
              </h3>
              <button
                type="button"
                className="um-modal-close-btn"
                onClick={() => setIsInviteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Inner Tabs: Invite via Email vs Add Directly */}
            <div className="um-modal-tabs">
              <button
                type="button"
                className={`um-modal-tab ${inviteModalTab === 'email' ? 'active' : ''}`}
                onClick={() => setInviteModalTab('email')}
              >
                <Mail size={15} />
                <span>Invite via Email</span>
              </button>
              <button
                type="button"
                className={`um-modal-tab ${inviteModalTab === 'direct' ? 'active' : ''}`}
                onClick={() => setInviteModalTab('direct')}
              >
                <UserCheck size={15} />
                <span>Add Directly</span>
              </button>
            </div>

            <form onSubmit={handleSubmitInviteOrAdd} style={{ display: 'contents' }}>
              <div className="um-modal-body">
                {inviteModalTab === 'direct' && (
                  <div className="um-form-row-2">
                    <div className="um-form-group">
                      <label className="um-form-label">
                        Full Name <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="um-form-input"
                        placeholder="e.g. Ramesh Chandra"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="um-form-group">
                      <label className="um-form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="um-form-input"
                        placeholder="+91 98000 00000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="um-form-group">
                  <label className="um-form-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <input
                    type="email"
                    className="um-form-input"
                    placeholder="staff.member@sadagati.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  {inviteModalTab === 'email' && (
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      An onboarding invitation link will be generated for this email. The recipient will enter their profile & credentials to access the system.
                    </span>
                  )}
                </div>

                <div className="um-form-row-2">
                  <div className="um-form-group">
                    <label className="um-form-label">Role Assignment</label>
                    <select
                      className="um-form-select"
                      value={formData.role}
                      onChange={(e) => {
                        const newRole = e.target.value
                        if (newRole === 'Admin') {
                          handleAccessLevelChange('full')
                        }
                        setFormData((prev) => ({ ...prev, role: newRole }))
                      }}
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Manager">Manager (Branch Operations)</option>
                      <option value="Employee">Employee (Loan Officer)</option>
                      <option value="Field Agent">Field Agent (Collections)</option>
                      <option value="User">User (Standard Access)</option>
                    </select>
                  </div>

                  <div className="um-form-group">
                    <label className="um-form-label">Branch Assignment</label>
                    <select
                      className="um-form-select"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    >
                      <option value="-">- No Specific Branch -</option>
                      {branches.map((b) => (
                        <option key={b.id || b.code} value={b.name}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ------------------------------------------------------------
                    USER LIMITATIONS VS FULL ACCESS SELECTOR
                    (Requested: "give options of user limitations or full access")
                    ------------------------------------------------------------ */}
                <div className="um-access-section">
                  <div className="um-access-header">
                    <span className="um-access-title">Access Level & Limitations</span>
                    <span className="um-access-subtitle">Control scope of operations</span>
                  </div>

                  <div className="um-access-cards-grid">
                    {/* FULL ACCESS CARD */}
                    <div
                      className={`um-access-card ${formData.accessLevel === 'full' ? 'selected' : ''}`}
                      onClick={() => handleAccessLevelChange('full')}
                    >
                      <div className="um-access-card-top">
                        <span className="um-access-card-badge">
                          <Shield size={14} style={{ color: '#c084fc' }} />
                          Full Access
                        </span>
                        <div className="um-access-radio">
                          {formData.accessLevel === 'full' && <div className="um-access-radio-inner" />}
                        </div>
                      </div>
                      <p className="um-access-card-desc">
                        Unrestricted permissions. Full control over ledgers, loan approvals, disbursements, branches, and staff.
                      </p>
                    </div>

                    {/* LIMITED ACCESS CARD */}
                    <div
                      className={`um-access-card ${formData.accessLevel === 'limited' ? 'selected' : ''}`}
                      onClick={() => handleAccessLevelChange('limited')}
                    >
                      <div className="um-access-card-top">
                        <span className="um-access-card-badge">
                          <Sliders size={14} style={{ color: '#38bdf8' }} />
                          Limited Access
                        </span>
                        <div className="um-access-radio">
                          {formData.accessLevel === 'limited' && <div className="um-access-radio-inner" />}
                        </div>
                      </div>
                      <p className="um-access-card-desc">
                        Custom operational limits, module permissions, and single-loan approval / disbursement caps.
                      </p>
                    </div>
                  </div>
                </div>

                {/* LIMITATIONS CONFIGURATOR (Visible when Limited Access is selected) */}
                {formData.accessLevel === 'limited' && (
                  <div className="um-limits-box">
                    <p className="um-limits-subtitle">Permitted Banking Modules</p>

                    <div className="um-permissions-grid">
                      {MODULE_LIST.map((mod) => (
                        <label key={mod.id} className="um-perm-item">
                          <input
                            type="checkbox"
                            className="um-perm-checkbox"
                            checked={!!formData.permissions?.[mod.id]?.read}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setFormData((prev) => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  [mod.id]: {
                                    read: checked,
                                    write: checked
                                  }
                                }
                              }))
                            }}
                          />
                          <span>{mod.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="um-financial-caps-row">
                      <div className="um-form-group">
                        <label className="um-form-label">Max Approval Limit (₹)</label>
                        <input
                          type="number"
                          className="um-form-input"
                          value={formData.limits.maxApprovalAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: {
                                ...formData.limits,
                                maxApprovalAmount: Number(e.target.value) || 0
                              }
                            })
                          }
                          placeholder="25000"
                        />
                      </div>

                      <div className="um-form-group">
                        <label className="um-form-label">Max Disbursement Limit (₹)</label>
                        <input
                          type="number"
                          className="um-form-input"
                          value={formData.limits.maxDisbursementAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: {
                                ...formData.limits,
                                maxDisbursementAmount: Number(e.target.value) || 0
                              }
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '6px' }}>
                      <label className="um-perm-item">
                        <input
                          type="checkbox"
                          className="um-perm-checkbox"
                          checked={formData.limits.canApproveLoans}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, canApproveLoans: e.target.checked }
                            })
                          }
                        />
                        <span>Can Approve Loan Applications</span>
                      </label>

                      <label className="um-perm-item">
                        <input
                          type="checkbox"
                          className="um-perm-checkbox"
                          checked={formData.limits.canDisburseLoans}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              limits: { ...formData.limits, canDisburseLoans: e.target.checked }
                            })
                          }
                        />
                        <span>Can Disburse Funds</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="um-modal-actions">
                <button
                  type="button"
                  className="btn-um-modal-cancel"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-um-modal-submit">
                  {inviteModalTab === 'email' ? 'Send Invitation Email' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: INVITATION SENT & EMAIL FORWARD SIMULATION
          (Requested: "invite user by email and when the email forward then
          they have to add there details for users to enter in the applications")
          ==================================================================== */}
      {activeSentInvite && (
        <div className="um-modal-overlay">
          <div className="um-modal-box" style={{ maxWidth: '520px' }}>
            <div className="um-modal-header">
              <h3 className="um-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                Invitation Sent Successfully
              </h3>
              <button
                type="button"
                className="um-modal-close-btn"
                onClick={() => setActiveSentInvite(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="um-modal-body">
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
                An invitation email has been prepared for <strong style={{ color: '#ffffff' }}>{activeSentInvite.email}</strong> with role <span className="um-role-badge admin">{activeSentInvite.role}</span>.
              </p>

              <div className="um-invite-preview-box">
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Forwardable Onboarding Link
                </span>

                <div className="um-link-copy-row">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?invite=${activeSentInvite.token}`}
                    className="um-link-input"
                  />
                  <button
                    type="button"
                    className="btn-copy-link"
                    onClick={() => handleCopyInviteLink(activeSentInvite)}
                  >
                    {copiedLink ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  When the staff member clicks this link, they will be prompted to enter their name, phone, password, and designation to finalize registration and enter the core banking system.
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Test the onboarding workflow now:</span>
                <button
                  type="button"
                  className="btn-test-onboard"
                  onClick={() => handleOpenOnboarding(activeSentInvite)}
                >
                  <ExternalLink size={16} />
                  <span>Simulate User Entering Details & Joining</span>
                </button>
              </div>
            </div>

            <div className="um-modal-actions">
              <button
                type="button"
                className="btn-um-modal-cancel"
                onClick={() => setActiveSentInvite(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: ONBOARDING - USER ENTERS DETAILS TO ENTER APPLICATION
          (Requested: "they have to add there details for users to enter in the applications")
          ==================================================================== */}
      {isOnboardingModalOpen && onboardingInvite && (
        <div className="um-modal-overlay">
          <div className="um-modal-box" style={{ maxWidth: '560px' }}>
            <div className="um-modal-header">
              <div>
                <h3 className="um-modal-title">Staff Onboarding & Activation</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  Enter personal details to activate core banking credentials
                </p>
              </div>
              <button
                type="button"
                className="um-modal-close-btn"
                onClick={() => setIsOnboardingModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitOnboarding} style={{ display: 'contents' }}>
              <div className="um-modal-body">
                {/* Invited details banner */}
                <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>INVITED EMAIL</span>
                    <strong style={{ fontSize: '13px', color: '#ffffff' }}>{onboardingInvite.email}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>ASSIGNED ROLE</span>
                    <span className="um-role-badge manager">{onboardingInvite.role}</span>
                  </div>
                </div>

                <div className="um-form-row-2">
                  <div className="um-form-group">
                    <label className="um-form-label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="um-form-input"
                      placeholder="e.g. Ramesh Chandra Yadav"
                      value={onboardingForm.name}
                      onChange={(e) =>
                        setOnboardingForm({ ...onboardingForm, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="um-form-group">
                    <label className="um-form-label">
                      Mobile Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      className="um-form-input"
                      placeholder="+91 98290 00000"
                      value={onboardingForm.phone}
                      onChange={(e) =>
                        setOnboardingForm({ ...onboardingForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">Designation / Job Title</label>
                  <input
                    type="text"
                    className="um-form-input"
                    placeholder="e.g. Senior Branch Credit Officer"
                    value={onboardingForm.designation}
                    onChange={(e) =>
                      setOnboardingForm({ ...onboardingForm, designation: e.target.value })
                    }
                  />
                </div>

                <div className="um-form-row-2">
                  <div className="um-form-group">
                    <label className="um-form-label">
                      Create Password <span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      className="um-form-input"
                      placeholder="••••••••"
                      value={onboardingForm.password}
                      onChange={(e) =>
                        setOnboardingForm({ ...onboardingForm, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="um-form-group">
                    <label className="um-form-label">
                      Confirm Password <span className="req">*</span>
                    </label>
                    <input
                      type="password"
                      className="um-form-input"
                      placeholder="••••••••"
                      value={onboardingForm.confirmPassword}
                      onChange={(e) =>
                        setOnboardingForm({ ...onboardingForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="um-form-group">
                  <label className="um-form-label">
                    4-Digit Security PIN (For Field Collection Receipting)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    className="um-form-input"
                    value={onboardingForm.pin}
                    onChange={(e) =>
                      setOnboardingForm({ ...onboardingForm, pin: e.target.value })
                    }
                    placeholder="1234"
                  />
                </div>

                <label className="um-perm-item" style={{ alignItems: 'flex-start', gap: '10px' }}>
                  <input
                    type="checkbox"
                    className="um-perm-checkbox"
                    checked={onboardingForm.agreeTerms}
                    onChange={(e) =>
                      setOnboardingForm({ ...onboardingForm, agreeTerms: e.target.checked })
                    }
                    required
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                    I agree to the Sadagati MicroFinance Core Banking Information Security & Compliance Policies. I understand my actions are audited in the institutional audit ledger.
                  </span>
                </label>
              </div>

              <div className="um-modal-actions">
                <button
                  type="button"
                  className="btn-um-modal-cancel"
                  onClick={() => setIsOnboardingModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-test-onboard" style={{ padding: '8px 20px' }}>
                  <UserCheck size={16} />
                  <span>Complete Setup & Enter Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: VIEW USER LIMITATIONS & PERMISSIONS SUMMARY
          ==================================================================== */}
      {isPermissionsModalOpen && viewingUser && (
        <div className="um-modal-overlay">
          <div className="um-modal-box" style={{ maxWidth: '580px' }}>
            <div className="um-modal-header">
              <div>
                <h3 className="um-modal-title">Staff Permissions & Limitations</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  {viewingUser.name} ({viewingUser.email})
                </p>
              </div>
              <button
                type="button"
                className="um-modal-close-btn"
                onClick={() => setIsPermissionsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="um-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ROLE</span>
                  <strong style={{ fontSize: '13px', color: '#ffffff' }}>{viewingUser.role}</strong>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>ACCESS LEVEL</span>
                  <strong style={{ fontSize: '13px', color: viewingUser.accessLevel === 'full' ? '#c084fc' : '#38bdf8' }}>
                    {viewingUser.accessLevel === 'full' ? 'Full Access' : 'Limited Access'}
                  </strong>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>STATUS</span>
                  <strong style={{ fontSize: '13px', color: '#10b981' }}>{viewingUser.status}</strong>
                </div>
              </div>

              <div className="um-limits-box">
                <span className="um-limits-subtitle">Financial Limitations</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Max Loan Approval:</span>{' '}
                    <strong style={{ color: '#ffffff' }}>₹{viewingUser.limits?.maxApprovalAmount?.toLocaleString('en-IN') || '50,000'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Max Disbursement:</span>{' '}
                    <strong style={{ color: '#ffffff' }}>₹{viewingUser.limits?.maxDisbursementAmount?.toLocaleString('en-IN') || '0'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Can Approve Loans:</span>{' '}
                    <strong style={{ color: viewingUser.limits?.canApproveLoans ? '#10b981' : '#f87171' }}>
                      {viewingUser.limits?.canApproveLoans ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#94a3b8' }}>Can Disburse Loans:</span>{' '}
                    <strong style={{ color: viewingUser.limits?.canDisburseLoans ? '#10b981' : '#f87171' }}>
                      {viewingUser.limits?.canDisburseLoans ? 'Yes' : 'No'}
                    </strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="um-limits-subtitle" style={{ display: 'block', marginBottom: '8px' }}>
                  Accessible Banking Modules
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {MODULE_LIST.map((m) => {
                    const isAllowed = viewingUser.accessLevel === 'full' || viewingUser.permissions?.[m.id]?.read !== false
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isAllowed ? '#e2e8f0' : '#475569' }}>
                        {isAllowed ? (
                          <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                        ) : (
                          <Ban size={13} style={{ color: '#64748b' }} />
                        )}
                        <span>{m.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="um-modal-actions">
              <button
                type="button"
                className="btn-um-modal-cancel"
                onClick={() => setIsPermissionsModalOpen(false)}
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
