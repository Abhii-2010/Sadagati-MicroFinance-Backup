import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Coins,
  MapPin,
  CreditCard,
  Send,
  BookOpen,
  BarChart2,
  Package,
  Building2,
  UserCheck,
  ClipboardList,
  Settings,
  Search,
  Bell,
  Menu,
  ShieldCheck,
  User,
  Plus,
  RotateCcw,
  Database,
  LogOut
} from 'lucide-react'

import { DashboardProvider, useDashboard } from './context/DashboardContext'
import DashboardView from './components/DashboardView'
import CustomersView from './components/views/CustomersView'
import LoanApplicationsView from './components/views/LoanApplicationsView'
import LoanPortfolioView from './components/views/LoanPortfolioView'
import CollectionsView from './components/views/CollectionsView'
import PaymentsView from './components/views/PaymentsView'
import DisbursementsView from './components/views/DisbursementsView'
import ReportsView from './components/views/ReportsView'
import AccountingView from './components/views/AccountingView'
import AuditLogsView from './components/views/AuditLogsView'
import FieldVisitsView from './components/views/FieldVisitsView'
import LoanProductsView from './components/views/LoanProductsView'
import BranchesView from './components/views/BranchesView'
import UserManagementView from './components/views/UserManagementView'
import DataMigrationView from './components/views/DataMigrationView'
import SettingsView from './components/views/SettingsView'
import ToastNotificationStack from './components/ToastNotificationStack'
import DashboardModals from './components/DashboardModals'
import LoginView from './components/auth/LoginView'
import EmployeePortal from './components/employee/EmployeePortal'
import AuthLoadingScreen from './components/auth/AuthLoadingScreen'
import AccessDeniedView from './components/auth/AccessDeniedView'
import NotFoundView from './components/auth/NotFoundView'
import './App.css'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'loan-applications', label: 'Loan Applications', icon: FileText },
  { id: 'loan-portfolio', label: 'Loan Portfolio', icon: Briefcase },
  { id: 'collections', label: 'Collections', icon: Coins },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'disbursements', label: 'Disbursements', icon: Send },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
  { id: 'field-visits', label: 'Field Visits', icon: MapPin },
  { id: 'accounting', label: 'Accounting', icon: BookOpen },
  { id: 'loan-products', label: 'Loan Products', icon: Package },
  { id: 'branches', label: 'Branches', icon: Building2 },
  { id: 'user-management', label: 'User Management', icon: UserCheck },
  { id: 'data-migration', label: 'Data Migration', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings }
]

function AppLayout() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    searchQuery,
    setSearchQuery,
    setActiveModal,
    pendingApprovals,
    resetToScreenshotState,
    currentUser,
    users,
    switchUser,
    logout
  } = useDashboard()

  const currentItem = NAV_ITEMS.find((item) => item.id === activeNav)

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Dark Sidebar */}
      <aside className="app-sidebar">
        {/* Brand header */}
        <div className="sidebar-brand-box" onClick={() => setActiveNav('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-logo-icon">
            <ShieldCheck size={20} className="shield-svg" />
          </div>
          {!sidebarCollapsed && (
            <div className="brand-titles">
              <span className="brand-main-title">Sadagati</span>
              <span className="brand-sub-title">Microfinance App</span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav-menu">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeNav === item.id
            const isPendingAppItem = item.id === 'loan-applications' && pendingApprovals.length > 0

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-button ${isActive ? 'is-active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={17} className="nav-btn-icon" />
                {!sidebarCollapsed && <span className="nav-btn-text">{item.label}</span>}
                {!sidebarCollapsed && isPendingAppItem && (
                  <span className="nav-badge-pill">{pendingApprovals.length}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom profile & Reset option */}
        <div className="sidebar-bottom-profile">
          <div className="profile-chip">
            <div className="profile-avatar-circle">
              <User size={15} />
            </div>
            {!sidebarCollapsed && (
              <span className="profile-name">
                {currentUser?.name || 'Abhi'} ({currentUser?.role || 'Admin'})
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-pane">
        {/* Top Navbar */}
        <header className="app-topbar">
          <div className="topbar-left-cluster">
            <button
              type="button"
              className="btn-hamburger"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
            <h1 className="topbar-page-heading">
              {currentItem?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="topbar-right-cluster">
            {/* Quick Action Buttons in Topbar */}
            <button
              type="button"
              className="topbar-action-emerald"
              onClick={() => setActiveModal('record-payment')}
              title="Quickly record payment collection"
            >
              <Plus size={14} />
              <span>+ Record Payment</span>
            </button>

            {/* Quick Role & Branch Switcher Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Portal:</span>
              <select
                value={currentUser?.id || ''}
                onChange={(e) => switchUser(e.target.value)}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Switch between Admin and Employee Portal views"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.role === 'Admin' ? '🛡️ Admin' : '👤 Employee'} • {u.name} ({u.branch?.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="topbar-search-box">
              <Search size={14} className="search-icon-inside" />
              <input
                type="text"
                placeholder="Search software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="topbar-search-field"
              />
            </div>

            {/* Notification Bell with Badge */}
            <button
              type="button"
              className="topbar-icon-button"
              onClick={() => setActiveModal('view-all-approvals')}
              title={`${pendingApprovals.length} pending applications`}
            >
              <Bell size={18} />
              {pendingApprovals.length > 0 && (
                <span className="notification-indicator-badge">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* Reset Data Button */}
            <button
              type="button"
              className="btn-reset-demo"
              onClick={() => setActiveModal('reset-data-modal')}
              title="Reset application data for testing or demo"
            >
              <RotateCcw size={14} />
              <span>Reset Data</span>
            </button>

            {/* Admin Profile Chip */}
            <div className="topbar-user-badge">
              <div className="user-icon-circle">
                <User size={15} />
              </div>
              <span className="user-badge-name">{currentUser?.name || 'Abhi'}</span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="btn-reset-demo"
              style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5' }}
              onClick={logout}
              title="Logout from Admin"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="app-body-container">
          {activeNav === 'dashboard' && <DashboardView />}
          {activeNav === 'customers' && <CustomersView />}
          {activeNav === 'loan-applications' && <LoanApplicationsView />}
          {activeNav === 'loan-portfolio' && <LoanPortfolioView />}
          {activeNav === 'collections' && <CollectionsView />}
          {activeNav === 'payments' && <PaymentsView />}
          {activeNav === 'disbursements' && <DisbursementsView />}
          {activeNav === 'reports' && <ReportsView />}
          {activeNav === 'accounting' && <AccountingView />}
          {activeNav === 'audit-logs' && <AuditLogsView />}
          {activeNav === 'field-visits' && <FieldVisitsView />}
          {activeNav === 'loan-products' && <LoanProductsView />}
          {activeNav === 'branches' && <BranchesView />}
          {activeNav === 'user-management' && <UserManagementView />}
          {activeNav === 'data-migration' && <DataMigrationView />}
          {activeNav === 'settings' && <SettingsView />}

          {/* Fallback for secondary administrative pages */}
          {![
            'dashboard',
            'customers',
            'loan-applications',
            'loan-portfolio',
            'collections',
            'payments',
            'disbursements',
            'reports',
            'accounting',
            'audit-logs',
            'field-visits',
            'loan-products',
            'branches',
            'user-management',
            'data-migration',
            'settings'
          ].includes(activeNav) && (
            <NotFoundView onReturn={() => setActiveNav('dashboard')} />
          )}
        </main>
      </div>

      {/* Global Modals (Accessible from any page) */}
      <DashboardModals />

      {/* Real-time Toast Notifications */}
      <ToastNotificationStack />
    </div>
  )
}

function AppRouter() {
  const { currentUser, isAuthRestoring } = useDashboard()
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Minimal authentication boot state to eliminate flicker
  if (isAuthRestoring) {
    return <AuthLoadingScreen />
  }

  // Unauthenticated user -> Login Screen
  if (!currentUser) {
    return <LoginView />
  }

  // 403 Forbidden check: Employee attempting direct access to #admin route
  if (currentHash === '#admin' && currentUser.role !== 'Admin') {
    return (
      <AccessDeniedView
        attemptedArea="Admin Operations Portal"
        onReturn={() => {
          window.location.hash = '#employee'
          setCurrentHash('#employee')
        }}
      />
    )
  }

  // 404 Not Found check: Invalid direct route hash
  if (
    currentHash &&
    !['', '#', '#admin', '#employee', '#dashboard', '#login'].includes(currentHash) &&
    !currentHash.startsWith('#view-')
  ) {
    return (
      <NotFoundView
        onReturn={() => {
          const target = currentUser.role === 'Admin' ? '#admin' : '#employee'
          window.location.hash = target
          setCurrentHash(target)
        }}
      />
    )
  }

  // Role-based routing: Admin -> AppLayout, Employee -> EmployeePortal
  if (currentUser.role === 'Admin') {
    return <AppLayout />
  }

  return <EmployeePortal />
}

export default function App() {
  return (
    <DashboardProvider>
      <AppRouter />
    </DashboardProvider>
  )
}

