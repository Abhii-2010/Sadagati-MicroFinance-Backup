import { useState, useEffect } from 'react'
import {
  Building2,
  Bell,
  Shield,
  Coins,
  Save,
  Mail,
  MessageSquare,
  Globe,
  Lock
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './Settings.css'

export default function SettingsView() {
  const { settings, updateSettings } = useDashboard()

  const [activeTab, setActiveTab] = useState('company') // 'company' | 'notifications' | 'security' | 'loans'

  // Local form state initialized from dashboard context settings
  const [formState, setFormState] = useState(() => ({
    company: {
      companyName: 'Sadagati Microfinance',
      rbiRegistrationNumber: 'NBFC-MFI-XXXXX',
      cinNumber: 'UXXXXX2024PTCXXXXXX',
      gstNumber: 'XXGSTIN1234567',
      email: 'info@sadagati.com',
      phone: '+91 1800-XXX-XXXX',
      ...(settings?.company || {})
    },
    notifications: {
      emailNotifications: false,
      smsNotifications: false,
      whatsappNotifications: false,
      overdueReminders: false,
      ...(settings?.notifications || {})
    },
    security: {
      twoFactorAuth: false,
      ipWhitelist: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      ...(settings?.security || {})
    },
    loanSettings: {
      autoApprovalLimit: 50000,
      maxLoanAmount: 500000,
      npaThresholdDays: 90,
      penaltyGracePeriodDays: 7,
      ...(settings?.loanSettings || {})
    }
  }))

  // Sync if context settings change
  useEffect(() => {
    if (settings) {
      setFormState({
        company: {
          companyName: 'Sadagati Microfinance',
          rbiRegistrationNumber: 'NBFC-MFI-XXXXX',
          cinNumber: 'UXXXXX2024PTCXXXXXX',
          gstNumber: 'XXGSTIN1234567',
          email: 'info@sadagati.com',
          phone: '+91 1800-XXX-XXXX',
          ...(settings.company || {})
        },
        notifications: {
          emailNotifications: false,
          smsNotifications: false,
          whatsappNotifications: false,
          overdueReminders: false,
          ...(settings.notifications || {})
        },
        security: {
          twoFactorAuth: false,
          ipWhitelist: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          ...(settings.security || {})
        },
        loanSettings: {
          autoApprovalLimit: 50000,
          maxLoanAmount: 500000,
          npaThresholdDays: 90,
          penaltyGracePeriodDays: 7,
          ...(settings.loanSettings || {})
        }
      })
    }
  }, [settings])

  // Save handler
  const handleSave = (e) => {
    e?.preventDefault()
    updateSettings(formState)
  }

  // Input change helpers
  const handleCompanyChange = (field, val) => {
    setFormState((prev) => ({
      ...prev,
      company: { ...prev.company, [field]: val }
    }))
  }

  const handleToggleNotification = (field) => {
    setFormState((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field]
      }
    }))
  }

  const handleToggleSecurity = (field) => {
    setFormState((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: !prev.security[field]
      }
    }))
  }

  const handleSecurityChange = (field, val) => {
    setFormState((prev) => ({
      ...prev,
      security: { ...prev.security, [field]: Number(val) || 0 }
    }))
  }

  const handleLoanSettingChange = (field, val) => {
    setFormState((prev) => ({
      ...prev,
      loanSettings: { ...prev.loanSettings, [field]: Number(val) || 0 }
    }))
  }

  return (
    <div className="st-container">
      {/* --------------------------------------------------------------------
          1. HEADER ROW: Title, Subtitle, Save Changes button
          -------------------------------------------------------------------- */}
      <div className="st-header-row">
        <div className="st-header-titles">
          <h2 className="st-main-heading">Settings</h2>
          <p className="st-sub-heading">Configure system preferences and policies</p>
        </div>

        <button
          type="button"
          className="btn-save-settings"
          onClick={handleSave}
          title="Save all configuration changes"
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          2. SETTINGS TABS: Company | Notifications | Security | Loan Settings
          -------------------------------------------------------------------- */}
      <div className="st-tabs-wrapper">
        <button
          type="button"
          className={`st-tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          <Building2 size={16} />
          <span>Company</span>
        </button>

        <button
          type="button"
          className={`st-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          className={`st-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} />
          <span>Security</span>
        </button>

        <button
          type="button"
          className={`st-tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          <Coins size={16} />
          <span>Loan Settings</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          3. TAB 1: COMPANY INFORMATION
          -------------------------------------------------------------------- */}
      {activeTab === 'company' && (
        <div className="st-card">
          <div className="st-card-header">
            <h3 className="st-card-title">Company Information</h3>
            <p className="st-card-subtitle">
              Basic company details and registration information
            </p>
          </div>

          <div className="st-form-grid">
            {/* Row 1: Company Name | RBI Registration Number */}
            <div className="st-form-group">
              <label className="st-form-label">Company Name</label>
              <input
                type="text"
                className="st-form-input"
                value={formState.company.companyName}
                onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                placeholder="Sadagati Microfinance"
              />
            </div>

            <div className="st-form-group">
              <label className="st-form-label">RBI Registration Number</label>
              <input
                type="text"
                className="st-form-input"
                value={formState.company.rbiRegistrationNumber}
                onChange={(e) => handleCompanyChange('rbiRegistrationNumber', e.target.value)}
                placeholder="NBFC-MFI-XXXXX"
              />
            </div>

            {/* Row 2: CIN Number | GST Number */}
            <div className="st-form-group">
              <label className="st-form-label">CIN Number</label>
              <input
                type="text"
                className="st-form-input"
                value={formState.company.cinNumber}
                onChange={(e) => handleCompanyChange('cinNumber', e.target.value)}
                placeholder="UXXXXX2024PTCXXXXXX"
              />
            </div>

            <div className="st-form-group">
              <label className="st-form-label">GST Number</label>
              <input
                type="text"
                className="st-form-input"
                value={formState.company.gstNumber}
                onChange={(e) => handleCompanyChange('gstNumber', e.target.value)}
                placeholder="XXGSTIN1234567"
              />
            </div>

            {/* Row 3: Email | Phone */}
            <div className="st-form-group">
              <label className="st-form-label">Email</label>
              <input
                type="email"
                className="st-form-input"
                value={formState.company.email}
                onChange={(e) => handleCompanyChange('email', e.target.value)}
                placeholder="info@sadagati.com"
              />
            </div>

            <div className="st-form-group">
              <label className="st-form-label">Phone</label>
              <input
                type="text"
                className="st-form-input"
                value={formState.company.phone}
                onChange={(e) => handleCompanyChange('phone', e.target.value)}
                placeholder="+91 1800-XXX-XXXX"
              />
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          4. TAB 2: NOTIFICATION PREFERENCES
          -------------------------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <div className="st-card">
          <div className="st-card-header">
            <h3 className="st-card-title">Notification Preferences</h3>
            <p className="st-card-subtitle">
              Configure how notifications are sent to users and customers
            </p>
          </div>

          <div className="st-toggle-list">
            {/* Email Notifications */}
            <div
              className="st-toggle-card"
              onClick={() => handleToggleNotification('emailNotifications')}
            >
              <div className="st-toggle-left">
                <div className="st-toggle-icon blue">
                  <Mail size={18} />
                </div>
                <div className="st-toggle-info">
                  <span className="st-toggle-title">Email Notifications</span>
                  <span className="st-toggle-desc">Send notifications via email</span>
                </div>
              </div>
              <div
                className={`st-switch ${
                  formState.notifications.emailNotifications ? 'active' : ''
                }`}
              >
                <div className="st-switch-knob" />
              </div>
            </div>

            {/* SMS Notifications */}
            <div
              className="st-toggle-card"
              onClick={() => handleToggleNotification('smsNotifications')}
            >
              <div className="st-toggle-left">
                <div className="st-toggle-icon green">
                  <MessageSquare size={18} />
                </div>
                <div className="st-toggle-info">
                  <span className="st-toggle-title">SMS Notifications</span>
                  <span className="st-toggle-desc">Send SMS alerts to customers</span>
                </div>
              </div>
              <div
                className={`st-switch ${
                  formState.notifications.smsNotifications ? 'active' : ''
                }`}
              >
                <div className="st-switch-knob" />
              </div>
            </div>

            {/* WhatsApp Notifications */}
            <div
              className="st-toggle-card"
              onClick={() => handleToggleNotification('whatsappNotifications')}
            >
              <div className="st-toggle-left">
                <div className="st-toggle-icon green">
                  <Globe size={18} />
                </div>
                <div className="st-toggle-info">
                  <span className="st-toggle-title">WhatsApp Notifications</span>
                  <span className="st-toggle-desc">Send WhatsApp messages to customers</span>
                </div>
              </div>
              <div
                className={`st-switch ${
                  formState.notifications.whatsappNotifications ? 'active' : ''
                }`}
              >
                <div className="st-switch-knob" />
              </div>
            </div>

            {/* Overdue Reminders */}
            <div
              className="st-toggle-card"
              onClick={() => handleToggleNotification('overdueReminders')}
            >
              <div className="st-toggle-left">
                <div className="st-toggle-icon amber">
                  <Bell size={18} />
                </div>
                <div className="st-toggle-info">
                  <span className="st-toggle-title">Overdue Reminders</span>
                  <span className="st-toggle-desc">Automatic reminders for overdue payments</span>
                </div>
              </div>
              <div
                className={`st-switch ${
                  formState.notifications.overdueReminders ? 'active' : ''
                }`}
              >
                <div className="st-switch-knob" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          5. TAB 3: SECURITY SETTINGS
          -------------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="st-card">
          <div className="st-card-header">
            <h3 className="st-card-title">Security Settings</h3>
            <p className="st-card-subtitle">
              Configure security policies and access controls
            </p>
          </div>

          <div className="st-toggle-list">
            {/* Two-Factor Authentication */}
            <div
              className="st-toggle-card"
              onClick={() => handleToggleSecurity('twoFactorAuth')}
            >
              <div className="st-toggle-left">
                <div className="st-toggle-icon purple">
                  <Lock size={18} />
                </div>
                <div className="st-toggle-info">
                  <span className="st-toggle-title">Two-Factor Authentication</span>
                  <span className="st-toggle-desc">Require 2FA for all admin users</span>
                </div>
              </div>
              <div
                className={`st-switch ${
                  formState.security.twoFactorAuth ? 'active' : ''
                }`}
              >
                <div className="st-switch-knob" />
              </div>
            </div>

            {/* IP Whitelist */}
            <div
              className="st-toggle-card"
              onClick={() => handleToggleSecurity('ipWhitelist')}
            >
              <div className="st-toggle-left">
                <div className="st-toggle-icon blue">
                  <Shield size={18} />
                </div>
                <div className="st-toggle-info">
                  <span className="st-toggle-title">IP Whitelist</span>
                  <span className="st-toggle-desc">Restrict access to specific IPs</span>
                </div>
              </div>
              <div
                className={`st-switch ${
                  formState.security.ipWhitelist ? 'active' : ''
                }`}
              >
                <div className="st-switch-knob" />
              </div>
            </div>
          </div>

          {/* Session Timeout & Password Expiry */}
          <div className="st-form-grid" style={{ marginTop: '8px' }}>
            <div className="st-form-group">
              <label className="st-form-label">Session Timeout (minutes)</label>
              <input
                type="number"
                className="st-form-input"
                value={formState.security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="st-form-group">
              <label className="st-form-label">Password Expiry (days)</label>
              <input
                type="number"
                className="st-form-input"
                value={formState.security.passwordExpiry}
                onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                placeholder="90"
              />
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          6. TAB 4: LOAN SETTINGS
          -------------------------------------------------------------------- */}
      {activeTab === 'loans' && (
        <div className="st-card">
          <div className="st-card-header">
            <h3 className="st-card-title">Loan Configuration</h3>
            <p className="st-card-subtitle">
              Default loan policies and thresholds
            </p>
          </div>

          <div className="st-form-grid">
            {/* Auto Approval Limit (₹) */}
            <div className="st-form-group">
              <label className="st-form-label">Auto Approval Limit (₹)</label>
              <input
                type="number"
                className="st-form-input"
                value={formState.loanSettings.autoApprovalLimit}
                onChange={(e) => handleLoanSettingChange('autoApprovalLimit', e.target.value)}
                placeholder="50000"
              />
              <span className="st-form-hint">Loans below this amount can be auto-approved</span>
            </div>

            {/* Maximum Loan Amount (₹) */}
            <div className="st-form-group">
              <label className="st-form-label">Maximum Loan Amount (₹)</label>
              <input
                type="number"
                className="st-form-input"
                value={formState.loanSettings.maxLoanAmount}
                onChange={(e) => handleLoanSettingChange('maxLoanAmount', e.target.value)}
                placeholder="500000"
              />
              <span className="st-form-hint">Maximum disbursement limit</span>
            </div>

            {/* NPA Threshold (Days) */}
            <div className="st-form-group">
              <label className="st-form-label">NPA Threshold (Days)</label>
              <input
                type="number"
                className="st-form-input"
                value={formState.loanSettings.npaThresholdDays}
                onChange={(e) => handleLoanSettingChange('npaThresholdDays', e.target.value)}
                placeholder="90"
              />
              <span className="st-form-hint">Days overdue before marking as NPA</span>
            </div>

            {/* Penalty Grace Period (Days) */}
            <div className="st-form-group">
              <label className="st-form-label">Penalty Grace Period (Days)</label>
              <input
                type="number"
                className="st-form-input"
                value={formState.loanSettings.penaltyGracePeriodDays}
                onChange={(e) => handleLoanSettingChange('penaltyGracePeriodDays', e.target.value)}
                placeholder="7"
              />
              <span className="st-form-hint">Grace period before penalty applies</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
