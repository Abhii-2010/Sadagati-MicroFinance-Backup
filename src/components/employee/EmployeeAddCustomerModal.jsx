import { useState } from 'react'
import { X, UserPlus, Shield, Building2 } from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'

export default function EmployeeAddCustomerModal({ isOpen, onClose }) {
  const { addNewCustomer, currentUser } = useDashboard()

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    husbandName: '',
    gender: 'Female',
    maritalStatus: 'Married',
    dob: '1995-05-15',
    primaryMobile: '',
    secondaryMobile: '',
    email: '',
    addressLine: '',
    city: currentUser?.branch?.includes('Jodhpur') ? 'Jodhpur' : 'Jaipur',
    district: currentUser?.branch?.includes('Jodhpur') ? 'Jodhpur' : 'Jaipur',
    state: 'Rajasthan',
    pincode: currentUser?.branch?.includes('Jodhpur') ? '342001' : '302012',
    aadhaarNumber: '',
    panNumber: '',
    occupation: 'Small Business',
    monthlyIncome: '25000',
    nominee: '',
    nomineeRelationship: 'Husband'
  })

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.primaryMobile.trim()) {
      alert('Please enter at least Full Name and Mobile Number.')
      return
    }

    // Branch is strictly locked to employee's branch
    addNewCustomer({
      ...formData,
      branchId: currentUser?.branchId || 'BR-001',
      branch: currentUser?.branch || 'Jaipur Central Branch',
      createdBy: currentUser?.name || 'Field Officer',
      employeeId: currentUser?.employeeId || 'EMP-JPR-001'
    })

    onClose()
  }

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="emp-modal-box" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="emp-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="emp-modal-title">Register New Customer</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                Assigned Branch: <strong style={{ color: '#10b981' }}>{currentUser?.branch || 'Jaipur Central Branch'}</strong> (Locked)
              </p>
            </div>
          </div>
          <button type="button" className="emp-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="emp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Branch Isolation Banner */}
            <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#93c5fd' }}>
              <Building2 size={16} />
              <span>
                Customer will be automatically assigned to <strong>{currentUser?.branch}</strong> under your employee ID <strong>{currentUser?.employeeId}</strong>.
              </span>
            </div>

            {/* Section 1: Personal Info */}
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
              1. Personal Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Maya Devi"
                  required
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Father's / Mother's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="e.g. Ram Prasad"
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                >
                  <option value="Married">Married</option>
                  <option value="Unmarried">Unmarried</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            {/* Section 2: Contact & Address */}
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginTop: '8px' }}>
              2. Contact & Address
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Primary Mobile *</label>
                <input
                  type="text"
                  name="primaryMobile"
                  value={formData.primaryMobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  required
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>City / Village</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Full Residential Address</label>
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  placeholder="Plot/House No., Street/Colony"
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Section 3: KYC & Financial Details */}
            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginTop: '8px' }}>
              3. KYC & Occupation
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="XXXX-XXXX-XXXX"
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Tailoring, Kirana"
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>Monthly Income (₹)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="e.g. 25000"
                  style={{ width: '100%', height: '38px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0 10px', color: '#fff', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          <div className="emp-modal-footer">
            <button type="button" className="emp-btn-logout" style={{ color: '#94a3b8', borderColor: 'rgba(255, 255, 255, 0.1)' }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="emp-quick-action-emerald">
              Save Customer & Sync Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
