import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Coins,
  CheckSquare,
  Activity,
  User,
  Menu,
  Bell,
  LogOut,
  ShieldCheck,
  Plus,
  CreditCard,
  Building2,
  ChevronDown
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import EmployeeDashboardView from './EmployeeDashboardView'
import EmployeeCustomersView from './EmployeeCustomersView'
import EmployeeApplicationsView from './EmployeeApplicationsView'
import EmployeeLoansView from './EmployeeLoansView'
import EmployeeCollectionsView from './EmployeeCollectionsView'
import EmployeeTasksView from './EmployeeTasksView'
import EmployeeActivityView from './EmployeeActivityView'
import EmployeeProfileView from './EmployeeProfileView'
import EmployeeAddCustomerModal from './EmployeeAddCustomerModal'
import EmployeeNewApplicationModal from './EmployeeNewApplicationModal'
import EmployeeRecordPaymentModal from './EmployeeRecordPaymentModal'
import ReceiptModal from './ReceiptModal'
import './EmployeePortal.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'applications', label: 'Loan Applications', icon: FileText },
  { id: 'loans', label: 'Loans', icon: Briefcase },
  { id: 'collections', label: 'Collections', icon: Coins },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'activity', label: 'My Activity', icon: Activity },
  { id: 'profile', label: 'My Profile', icon: User }
]

export default function EmployeePortal() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isNewAppOpen, setIsNewAppOpen] = useState(false)
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)
  const [preselectedLoanId, setPreselectedLoanId] = useState(null)
  const [currentReceipt, setCurrentReceipt] = useState(null)

  const {
    currentUser,
    users,
    switchUser,
    logout,
    branchApplications
  } = useDashboard()

  const pendingCount = branchApplications.filter(
    (a) => a.status === 'Pending Review' || a.status === 'Submitted'
  ).length

  const handleOpenPaymentForLoan = (loanId) => {
    setPreselectedLoanId(loanId)
    setIsRecordPaymentOpen(true)
  }

  const handlePaymentSuccess = (newPayment) => {
    setCurrentReceipt(newPayment)
  }

  return (
    <div className={`emp-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Employee Sidebar */}
      <aside className="emp-sidebar">
        <div className="emp-sidebar-header">
          <div className="emp-logo-shield">
            <ShieldCheck size={22} />
          </div>
          {!sidebarCollapsed && (
            <div className="emp-brand-meta">
              <span className="emp-brand-name">Sadagati MF</span>
              <span className="emp-brand-portal-tag">Employee Portal</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="emp-sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            const hasPendingBadge = item.id === 'applications' && pendingCount > 0

            return (
              <button
                key={item.id}
                type="button"
                className={`emp-nav-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={17} className="emp-nav-icon" />
                {!sidebarCollapsed && <span className="emp-nav-label">{item.label}</span>}
                {!sidebarCollapsed && hasPendingBadge && (
                  <span className="emp-nav-pill">{pendingCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="emp-sidebar-footer">
          <div className="emp-user-card">
            <div className="emp-user-avatar">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="emp-user-info">
                <span className="emp-user-name">{currentUser?.name}</span>
                <span className="emp-user-role">{currentUser?.designation || currentUser?.role}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Pane */}
      <div className="emp-main-pane">
        {/* Topbar */}
        <header className="emp-topbar">
          <div className="emp-topbar-left">
            <button
              type="button"
              className="emp-btn-hamburger"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle sidebar"
            >
              <Menu size={17} />
            </button>

            {/* Active page label */}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
              {NAV_ITEMS.find(n => n.id === activeNav)?.label || 'Dashboard'}
            </span>

            {/* Branch Context Chip */}
            <div className="emp-branch-context-chip">
              <div className="emp-branch-dot" />
              <span className="emp-branch-name">{currentUser?.branch || 'Jaipur Central Branch'}</span>
              <span className="emp-branch-code">{currentUser?.branchId || 'BR-001'}</span>
            </div>
          </div>

          <div className="emp-topbar-right">
            {/* Quick Action Topbar Buttons */}
            <button
              type="button"
              className="emp-quick-action-emerald"
              onClick={() => {
                setPreselectedLoanId(null)
                setIsRecordPaymentOpen(true)
              }}
            >
              <CreditCard size={14} />
              <span>₹ Record Payment</span>
            </button>

            <button
              type="button"
              className="emp-quick-action-sapphire"
              onClick={() => setIsAddCustomerOpen(true)}
            >
              <Plus size={14} />
              <span>+ Customer</span>
            </button>

            {/* Fast Role Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Switch:</span>
              <select
                className="emp-role-switcher-select"
                value={currentUser?.id || ''}
                onChange={(e) => switchUser(e.target.value)}
                title="Quickly switch role to test Admin sync and branch isolation"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.role === 'Admin' ? '🛡️ Admin' : '👤 Field'} • {u.name} ({u.branch?.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="emp-btn-icon"
              title="Notifications"
              onClick={() => setActiveNav('applications')}
            >
              <Bell size={16} />
              {pendingCount > 0 && <span className="emp-notif-pill">{pendingCount}</span>}
            </button>

            {/* Logout button */}
            <button
              type="button"
              className="emp-btn-logout"
              onClick={logout}
              title="Sign out of Employee Portal"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Body Component */}
        <main className="emp-content-area">
          {activeNav === 'dashboard' && (
            <EmployeeDashboardView
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
              onOpenNewApp={() => setIsNewAppOpen(true)}
              onOpenRecordPayment={() => {
                setPreselectedLoanId(null)
                setIsRecordPaymentOpen(true)
              }}
              onSelectLoanForPayment={handleOpenPaymentForLoan}
            />
          )}

          {activeNav === 'customers' && (
            <EmployeeCustomersView
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
              onSelectLoanForPayment={handleOpenPaymentForLoan}
            />
          )}

          {activeNav === 'applications' && (
            <EmployeeApplicationsView
              onOpenNewApp={() => setIsNewAppOpen(true)}
            />
          )}

          {activeNav === 'loans' && (
            <EmployeeLoansView
              onSelectLoanForPayment={handleOpenPaymentForLoan}
            />
          )}

          {activeNav === 'collections' && (
            <EmployeeCollectionsView
              onOpenRecordPayment={() => {
                setPreselectedLoanId(null)
                setIsRecordPaymentOpen(true)
              }}
              onOpenReceipt={(receipt) => setCurrentReceipt(receipt)}
            />
          )}

          {activeNav === 'tasks' && (
            <EmployeeTasksView
              onSelectLoanForPayment={handleOpenPaymentForLoan}
            />
          )}

          {activeNav === 'activity' && <EmployeeActivityView />}

          {activeNav === 'profile' && <EmployeeProfileView />}
        </main>
      </div>

      {/* Modals */}
      <EmployeeAddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <EmployeeNewApplicationModal
        isOpen={isNewAppOpen}
        onClose={() => setIsNewAppOpen(false)}
      />

      <EmployeeRecordPaymentModal
        isOpen={isRecordPaymentOpen}
        preselectedLoanId={preselectedLoanId}
        onClose={() => {
          setIsRecordPaymentOpen(false)
          setPreselectedLoanId(null)
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {currentReceipt && (
        <ReceiptModal
          receipt={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
        />
      )}
    </div>
  )
}
