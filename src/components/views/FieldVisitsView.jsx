import { useState, useMemo } from 'react'
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  Search,
  Plus,
  Phone,
  MessageCircle,
  ExternalLink,
  Navigation,
  Sparkles,
  RotateCcw,
  X,
  FileCheck2,
  CalendarCheck,
  Building,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Share2
} from 'lucide-react'
import { useDashboard } from '../../context/DashboardContext'
import './FieldVisits.css'

// Known MFI coverage localities for intelligent autocomplete & Google Maps simulation
const PRESET_LOCALITIES = [
  {
    name: 'Pragati Nagar, Sector 3',
    pincode: '302012',
    center: 'Center #14 (Pragati)',
    officer: 'Rajesh Kumar (FO #04)',
    distanceKm: 2.4,
    travelTimeMins: 8,
    lat: 26.9124,
    lng: 75.7873,
    borrowers: ['Sunita Sharma', 'Radha Devi', 'Meenakshi Sharma']
  },
  {
    name: 'Kalyan Basti, Community Hall Area',
    pincode: '302018',
    center: 'Center #08 (Kalyan)',
    officer: 'Vikram Singh (FO #02)',
    distanceKm: 4.8,
    travelTimeMins: 14,
    lat: 26.885,
    lng: 75.812,
    borrowers: ['Meena Bai', 'Abhi Yadav']
  },
  {
    name: 'Kuchaman City, Main Market',
    pincode: '341508',
    center: 'Center #08 (Kalyan - Outstation)',
    officer: 'Vikram Singh (FO #02)',
    distanceKm: 115,
    travelTimeMins: 140,
    lat: 27.1519,
    lng: 74.8587,
    borrowers: ['Abhi Yadav']
  },
  {
    name: 'Udaan Dairy Road, Village Sector',
    pincode: '302029',
    center: 'Center #02 (Udaan)',
    officer: 'Sunita Rao (FO #01)',
    distanceKm: 6.3,
    travelTimeMins: 18,
    lat: 26.852,
    lng: 75.795,
    borrowers: ['Pooja Verma']
  },
  {
    name: 'Shakti Bazar, Commercial Belt',
    pincode: '302015',
    center: 'Center #05 (Shakti)',
    officer: 'Amit Sharma (FO #05)',
    distanceKm: 3.5,
    travelTimeMins: 11,
    lat: 26.932,
    lng: 75.82,
    borrowers: ['Aarti Kumari']
  }
]

export default function FieldVisitsView() {
  const {
    visits,
    customers,
    loans,
    pendingApprovals,
    formatINR,
    autoScheduleNextDayVisits,
    addVisit,
    updateVisit,
    completeVisit,
    rescheduleVisit,
    deleteVisit,
    addToast
  } = useDashboard()

  // Primary active tab
  const [activeTab, setActiveTab] = useState('today') // 'today' | 'tomorrow' | 'this-week' | 'all-pending' | 'all-visits'
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Location search state
  const [locationQuery, setLocationQuery] = useState('')
  const [matchedLoc, setMatchedLoc] = useState(null)

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState(null)

  // Schedule Modal Form
  const [scheduleForm, setScheduleForm] = useState({
    customerId: '',
    customerName: '',
    phone: '',
    loanId: '',
    center: 'Center #14 (Pragati)',
    locality: '',
    address: '',
    pincode: '302012',
    visitDate: '2026-10-04',
    timeSlot: '10:00 AM - 10:45 AM',
    type: 'Daily Collection',
    targetAmount: 100,
    officer: 'Rajesh Kumar (FO #04)',
    priority: 'Normal',
    notes: ''
  })

  // Complete Modal Form
  const [completeForm, setCompleteForm] = useState({
    amount: 0,
    paymentMode: 'CASH',
    outcome: 'Payment Collected Full',
    notes: '',
    syncToLedger: true
  })

  // Reschedule Form
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '2026-10-05',
    newTimeSlot: '10:00 AM - 10:45 AM',
    reason: 'Customer requested evening slot'
  })

  // Target reference dates
  const TODAY_STR = '2026-10-03'
  const TOMORROW_STR = '2026-10-04'

  // Filtered visits based on Tab
  const tabVisits = useMemo(() => {
    return visits.filter((v) => {
      if (activeTab === 'today') return v.visitDate === TODAY_STR
      if (activeTab === 'tomorrow') return v.visitDate === TOMORROW_STR
      if (activeTab === 'all-pending') return v.status === 'Scheduled' || v.status === 'In Progress'
      if (activeTab === 'this-week') return true
      return true // 'all-visits'
    })
  }, [visits, activeTab])

  // Top metric counters (dynamically computed based on active tab view)
  const metricStats = useMemo(() => {
    // Current scope of visits for metric display
    const scope = activeTab === 'all-visits' ? visits : tabVisits
    const totalScheduled = scope.length
    const completedCount = scope.filter((v) => v.status === 'Completed').length
    const totalCollected = scope.reduce((acc, v) => acc + (Number(v.collectedAmount) || 0), 0)
    const pendingCount = scope.filter(
      (v) => v.status === 'Scheduled' || v.status === 'In Progress' || v.status === 'Rescheduled'
    ).length

    return {
      totalScheduled,
      completedCount,
      totalCollected,
      pendingCount
    }
  }, [activeTab, tabVisits, visits])

  // Count badges for tabs
  const tabCounts = useMemo(() => {
    const todayCount = visits.filter((v) => v.visitDate === TODAY_STR).length
    const tomorrowCount = visits.filter((v) => v.visitDate === TOMORROW_STR).length
    const pendingCount = visits.filter((v) => v.status === 'Scheduled' || v.status === 'In Progress').length
    return {
      today: todayCount,
      tomorrow: tomorrowCount,
      thisWeek: visits.length,
      allPending: pendingCount,
      allVisits: visits.length
    }
  }, [visits])

  // Filtered table rows with search & dropdowns
  const displayedVisits = useMemo(() => {
    return tabVisits.filter((v) => {
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesName = (v.customerName || '').toLowerCase().includes(q)
        const matchesPhone = (v.phone || '').includes(q)
        const matchesAddress = (v.address || '').toLowerCase().includes(q)
        const matchesLoanId = (v.loanId || '').toLowerCase().includes(q)
        const matchesOfficer = (v.officer || '').toLowerCase().includes(q)
        if (!matchesName && !matchesPhone && !matchesAddress && !matchesLoanId && !matchesOfficer) {
          return false
        }
      }

      // Type filter
      if (typeFilter !== 'ALL') {
        if (!v.type || !v.type.toLowerCase().includes(typeFilter.toLowerCase())) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (!v.status || v.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false
        }
      }

      return true
    })
  }, [tabVisits, searchTerm, typeFilter, statusFilter])

  // Handle Find Location search
  const handleFindLocation = (overrideQuery = null) => {
    const query = (overrideQuery !== null ? overrideQuery : locationQuery).trim().toLowerCase()
    if (!query) {
      setMatchedLoc(null)
      return
    }

    const found = PRESET_LOCALITIES.find(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.pincode.includes(query) ||
        item.center.toLowerCase().includes(query) ||
        item.borrowers.some((b) => b.toLowerCase().includes(query))
    )

    if (found) {
      setMatchedLoc(found)
      addToast(`Found coverage area: ${found.name} (${found.distanceKm} km from Central Branch)`, 'info')
    } else {
      // Dynamic custom geocode simulation
      setMatchedLoc({
        name: query.charAt(0).toUpperCase() + query.slice(1) + ', Jaipur Region',
        pincode: '302001',
        center: 'Center #14 (Pragati)',
        officer: 'Rajesh Kumar (FO #04)',
        distanceKm: 5.2,
        travelTimeMins: 16,
        lat: 26.9124,
        lng: 75.7873,
        borrowers: ['Assigned to Branch Route']
      })
      addToast(`Located address: ${query}. Approximate distance: 5.2 km`, 'info')
    }
  }

  // Handle Trigger Next Day Auto-Schedule
  const handleRunAutoSchedule = () => {
    const res = autoScheduleNextDayVisits(TOMORROW_STR)
    setActiveTab('tomorrow')
  }

  // Open Schedule Modal with Customer Prepopulation
  const handleOpenScheduleModal = (prefillCustomer = null) => {
    if (prefillCustomer) {
      const matchLoan = loans.find(
        (l) => l.customerId === prefillCustomer.id || l.borrowerName === prefillCustomer.name
      )
      setScheduleForm({
        customerId: prefillCustomer.id,
        customerName: prefillCustomer.name,
        phone: prefillCustomer.phone || '',
        loanId: matchLoan ? matchLoan.id : '-',
        center: prefillCustomer.center || 'Center #14 (Pragati)',
        locality: prefillCustomer.location || 'Pragati Nagar',
        address: prefillCustomer.fullAddress || prefillCustomer.location || 'Jaipur - 302012',
        pincode: prefillCustomer.pincode || '302012',
        visitDate: activeTab === 'today' ? TODAY_STR : TOMORROW_STR,
        timeSlot: '10:00 AM - 10:45 AM',
        type: matchLoan?.frequency ? `${matchLoan.frequency} Collection` : 'KYC Verification',
        targetAmount: matchLoan?.emi || 0,
        officer: 'Rajesh Kumar (FO #04)',
        priority: 'Normal',
        notes: `Scheduled visit for ${prefillCustomer.name}`
      })
    } else {
      // Default to first customer
      const firstCust = customers[0]
      const matchLoan = loans.find(
        (l) => l.customerId === firstCust?.id || l.borrowerName === firstCust?.name
      )
      setScheduleForm({
        customerId: firstCust?.id || '',
        customerName: firstCust?.name || '',
        phone: firstCust?.phone || '',
        loanId: matchLoan ? matchLoan.id : '-',
        center: firstCust?.center || '',
        locality: firstCust?.location || '',
        address: firstCust?.fullAddress || firstCust?.location || '',
        pincode: firstCust?.pincode || '',
        visitDate: activeTab === 'today' ? TODAY_STR : TOMORROW_STR,
        timeSlot: '10:00 AM - 10:45 AM',
        type: matchLoan?.frequency ? `${matchLoan.frequency} Collection` : 'KYC Verification',
        targetAmount: matchLoan?.emi || 0,
        officer: 'Rajesh Kumar (FO #04)',
        priority: 'Normal',
        notes: ''
      })
    }
    setIsScheduleModalOpen(true)
  }

  // Handle Customer Selection in Schedule Modal
  const handleSelectCustomerInForm = (custId) => {
    const cust = customers.find((c) => c.id === custId)
    if (!cust) return
    const matchLoan = loans.find((l) => l.customerId === cust.id || l.borrowerName === cust.name)

    setScheduleForm((prev) => ({
      ...prev,
      customerId: cust.id,
      customerName: cust.name,
      phone: cust.phone || '',
      loanId: matchLoan ? matchLoan.id : '-',
      center: cust.center || 'Center #14 (Pragati)',
      locality: cust.location || 'Pragati Nagar',
      address: cust.fullAddress || cust.location || 'Jaipur - 302012',
      pincode: cust.pincode || '302012',
      type: matchLoan?.frequency ? `${matchLoan.frequency} Collection` : prev.type,
      targetAmount: matchLoan?.emi || prev.targetAmount
    }))
  }

  // Submit Schedule Visit Form
  const handleScheduleSubmit = (e) => {
    e.preventDefault()
    addVisit({
      ...scheduleForm,
      targetAmount: Number(scheduleForm.targetAmount) || 0,
      visitDateFormatted:
        scheduleForm.visitDate === TODAY_STR
          ? '03 Oct 2026'
          : scheduleForm.visitDate === TOMORROW_STR
          ? '04 Oct 2026'
          : scheduleForm.visitDate
    })
    setIsScheduleModalOpen(false)
  }

  // Open Complete Visit Modal
  const handleOpenCompleteModal = (visit) => {
    setSelectedVisit(visit)
    setCompleteForm({
      amount: visit.targetAmount || 0,
      paymentMode: 'CASH',
      outcome: 'Payment Collected Full',
      notes: `Collection done at ${visit.address}`,
      syncToLedger: true
    })
    setIsCompleteModalOpen(true)
  }

  // Submit Complete Visit
  const handleCompleteSubmit = (e) => {
    e.preventDefault()
    if (!selectedVisit) return
    completeVisit(selectedVisit.id, completeForm)
    setIsCompleteModalOpen(false)
    setSelectedVisit(null)
  }

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (visit) => {
    setSelectedVisit(visit)
    setRescheduleForm({
      newDate: TOMORROW_STR,
      newTimeSlot: '11:00 AM - 11:45 AM',
      reason: 'Customer requested reschedule'
    })
    setIsRescheduleModalOpen(true)
  }

  // Submit Reschedule Visit
  const handleRescheduleSubmit = (e) => {
    e.preventDefault()
    if (!selectedVisit) return
    rescheduleVisit(
      selectedVisit.id,
      rescheduleForm.newDate,
      rescheduleForm.newTimeSlot,
      rescheduleForm.reason
    )
    setIsRescheduleModalOpen(false)
    setSelectedVisit(null)
  }

  // Open Route Modal
  const handleOpenRouteModal = (visit) => {
    setSelectedVisit(visit)
    setIsRouteModalOpen(true)
  }

  return (
    <div className="fv-container">
      {/* --------------------------------------------------------------------
          1. HEADER ROW: Matches Base44 LMS exactly
          -------------------------------------------------------------------- */}
      <div className="fv-header-row">
        <div className="fv-header-titles">
          <h2 className="fv-main-heading">Field Visits</h2>
          <div className="fv-sub-heading">
            <span className="fv-live-dot"></span>
            <span>
              {activeTab === 'today'
                ? 'Saturday, 03 October 2026'
                : activeTab === 'tomorrow'
                ? 'Sunday, 04 October 2026 (Auto-Scheduled Route)'
                : 'All Operations Schedule'}
            </span>
          </div>
        </div>

        <div className="fv-header-actions">
          {/* Smart Auto-Scheduler Trigger */}
          <button
            type="button"
            className="btn-auto-schedule"
            onClick={handleRunAutoSchedule}
            title="Automatically schedule visits for next day using loan EMIs and customer document addresses"
          >
            <Sparkles size={15} />
            <span>⚡ Auto-Schedule Next Day</span>
          </button>

          {/* Primary Schedule Button (Matches Base44 screenshot) */}
          <button
            type="button"
            className="btn-schedule-visit-primary"
            onClick={() => handleOpenScheduleModal()}
          >
            <Plus size={16} />
            <span>+ Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          2. TOP METRIC CARDS (Exact match to Base44 screenshot)
          -------------------------------------------------------------------- */}
      <div className="fv-kpi-grid">
        {/* TODAY'S / TAB VISITS */}
        <div className="fv-kpi-card">
          <div className="fv-kpi-info">
            <span className="fv-kpi-title">
              {activeTab === 'tomorrow' ? "TOMORROW'S VISITS" : "TODAY'S VISITS"}
            </span>
            <strong className="fv-kpi-value">{metricStats.totalScheduled}</strong>
            <span className="fv-kpi-sub">Scheduled visits</span>
          </div>
          <div className="fv-kpi-icon-box blue">
            <Calendar size={20} />
          </div>
        </div>

        {/* COMPLETED */}
        <div className="fv-kpi-card">
          <div className="fv-kpi-info">
            <span className="fv-kpi-title">COMPLETED</span>
            <strong className="fv-kpi-value">{metricStats.completedCount}</strong>
            <span className="fv-kpi-sub">Visits done</span>
          </div>
          <div className="fv-kpi-icon-box green">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* COLLECTED */}
        <div className="fv-kpi-card">
          <div className="fv-kpi-info">
            <span className="fv-kpi-title">COLLECTED</span>
            <strong className="fv-kpi-value">{formatINR(metricStats.totalCollected)}</strong>
            <span className="fv-kpi-sub">Amount collected</span>
          </div>
          <div className="fv-kpi-icon-box purple">
            <MapPin size={20} />
          </div>
        </div>

        {/* PENDING */}
        <div className="fv-kpi-card">
          <div className="fv-kpi-info">
            <span className="fv-kpi-title">PENDING</span>
            <strong className="fv-kpi-value">{metricStats.pendingCount}</strong>
            <span className="fv-kpi-sub">Awaiting completion</span>
          </div>
          <div className="fv-kpi-icon-box amber">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          3. FIND LOCATION SECTION (Matches Base44 screenshot)
          -------------------------------------------------------------------- */}
      <div className="fv-location-card">
        <div className="fv-loc-head">
          <div className="fv-loc-title-row">
            <Search size={16} />
            <span>Find Location</span>
          </div>
          <span className="fv-loc-sub">Search for any address or place — like Google Maps</span>
        </div>

        <div className="fv-loc-search-row">
          <div className="fv-loc-input-box">
            <input
              type="text"
              placeholder="Enter address, locality, city, or pincode..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFindLocation()}
              className="fv-loc-input"
            />
            {locationQuery && (
              <button
                type="button"
                className="fv-loc-clear-btn"
                onClick={() => {
                  setLocationQuery('')
                  setMatchedLoc(null)
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn-find-loc"
            onClick={() => handleFindLocation()}
          >
            <MapPin size={15} />
            <span>Find Location</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="fv-loc-chips">
          <span className="fv-loc-chip-label">Quick Areas:</span>
          {PRESET_LOCALITIES.slice(0, 4).map((loc) => (
            <button
              key={loc.name}
              type="button"
              className="fv-chip"
              onClick={() => {
                setLocationQuery(loc.name)
                handleFindLocation(loc.name)
              }}
            >
              📍 {loc.name.split(',')[0]} ({loc.pincode})
            </button>
          ))}
        </div>

        {/* Interactive Location Result Display */}
        {matchedLoc && (
          <div className="fv-loc-result">
            <div className="fv-loc-result-head">
              <div className="fv-loc-result-title">
                <Navigation size={16} className="text-blue-400" />
                <span>{matchedLoc.name}</span>
                <span className="fv-pincode-pill">PIN: {matchedLoc.pincode}</span>
              </div>
              <div className="fv-loc-actions">
                <button
                  type="button"
                  className="btn-loc-action-primary"
                  onClick={() => {
                    handleOpenScheduleModal()
                    setScheduleForm((prev) => ({
                      ...prev,
                      locality: matchedLoc.name,
                      address: `${matchedLoc.name} - ${matchedLoc.pincode}`,
                      pincode: matchedLoc.pincode,
                      center: matchedLoc.center
                    }))
                  }}
                >
                  <Plus size={13} />
                  <span>+ Schedule Visit Here</span>
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    matchedLoc.name
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-loc-action-secondary"
                >
                  <ExternalLink size={13} />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>

            <div className="fv-loc-meta-grid">
              <div className="fv-loc-meta-item">
                <span className="fv-loc-meta-label">Branch Proximity</span>
                <span className="fv-loc-meta-val">
                  {matchedLoc.distanceKm} km (~{matchedLoc.travelTimeMins} mins by bike)
                </span>
              </div>
              <div className="fv-loc-meta-item">
                <span className="fv-loc-meta-label">Assigned Center</span>
                <span className="fv-loc-meta-val">{matchedLoc.center}</span>
              </div>
              <div className="fv-loc-meta-item">
                <span className="fv-loc-meta-label">Field Officer</span>
                <span className="fv-loc-meta-val">{matchedLoc.officer}</span>
              </div>
            </div>

            {/* Interactive Stylized Mini Map Graphics */}
            <div className="fv-mini-map-preview">
              <svg className="fv-map-svg" viewBox="0 0 600 140" preserveAspectRatio="none">
                {/* Street Grid background */}
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#gridPattern)" />

                {/* Simulated Road Lines */}
                <path d="M 0 70 Q 200 40 400 90 T 600 70" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <path d="M 100 0 L 100 140 M 300 0 L 300 140 M 500 0 L 500 140" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />

                {/* Route Connecting Line */}
                <path
                  d="M 90 70 C 180 30, 260 110, 480 65"
                  className="fv-map-route-line"
                  fill="none"
                />

                {/* Sadagati Branch Pin */}
                <circle cx="90" cy="70" r="10" className="fv-map-branch-pin" opacity="0.3" />
                <circle cx="90" cy="70" r="6" className="fv-map-branch-pin" />
                <text x="75" y="100" fill="#94a3b8" fontSize="10" fontWeight="600">
                  Sadagati Branch
                </text>

                {/* Target Customer Pin */}
                <circle cx="480" cy="65" r="14" className="fv-map-cust-pin" opacity="0.2" />
                <circle cx="480" cy="65" r="7" className="fv-map-cust-pin" />
                <text x="440" y="98" fill="#34d399" fontSize="10" fontWeight="700">
                  📍 {matchedLoc.name.split(',')[0]}
                </text>
              </svg>
            </div>

            {/* Matching Borrowers in this locality */}
            <div className="fv-loc-borrowers-list">
              <span className="fv-loc-borrowers-label">Registered Borrowers at this Locality:</span>
              <div className="fv-loc-borrowers-tags">
                {matchedLoc.borrowers.map((b) => (
                  <span key={b} className="fv-borrower-tag">
                    <User size={12} />
                    <span>{b}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------------------------------------------------
          4. FILTER TABS (Today, Tomorrow, This Week, All Pending, All Visits)
          -------------------------------------------------------------------- */}
      <div className="fv-tabs-bar">
        <button
          type="button"
          className={`fv-tab-btn ${activeTab === 'today' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span>Today</span>
          <span className="fv-tab-count">{tabCounts.today}</span>
        </button>

        <button
          type="button"
          className={`fv-tab-btn ${activeTab === 'tomorrow' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('tomorrow')}
        >
          <span>Tomorrow</span>
          <span className="fv-tab-count">{tabCounts.tomorrow}</span>
        </button>

        <button
          type="button"
          className={`fv-tab-btn ${activeTab === 'this-week' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('this-week')}
        >
          <span>This Week</span>
          <span className="fv-tab-count">{tabCounts.thisWeek}</span>
        </button>

        <button
          type="button"
          className={`fv-tab-btn ${activeTab === 'all-pending' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all-pending')}
        >
          <span>All Pending</span>
          <span className="fv-tab-count">{tabCounts.allPending}</span>
        </button>

        <button
          type="button"
          className={`fv-tab-btn ${activeTab === 'all-visits' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all-visits')}
        >
          <span>All Visits</span>
          <span className="fv-tab-count">{tabCounts.allVisits}</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------
          5. SEARCH & FILTERS TOOLBAR
          -------------------------------------------------------------------- */}
      <div className="fv-toolbar-row">
        <div className="fv-search-box">
          <Search size={15} className="fv-search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, address, or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="fv-search-input"
          />
        </div>

        <div className="fv-filters-cluster">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="fv-select"
          >
            <option value="ALL">All Visit Types</option>
            <option value="Daily">Daily Collection</option>
            <option value="Weekly">Weekly Collection</option>
            <option value="Monthly">Monthly Collection</option>
            <option value="KYC">KYC & Document Verification</option>
            <option value="Overdue">Overdue Recovery</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="fv-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* --------------------------------------------------------------------
          6. FIELD VISITS TABLE (Matching Base44 Columns)
          CUSTOMER | CONTACT | VISIT DATE | TYPE | OUTCOME | STATUS | ACTIONS
          -------------------------------------------------------------------- */}
      <div className="fv-table-card">
        {displayedVisits.length === 0 ? (
          <div className="fv-empty-state">
            <div className="fv-empty-icon-circle">
              <Calendar size={24} />
            </div>
            <h3 className="fv-empty-title">
              {activeTab === 'today'
                ? 'No visits scheduled for Today'
                : 'No visits match your search criteria'}
            </h3>
            <p className="fv-empty-sub">
              {activeTab === 'today'
                ? `Today's schedule is clear. You have ${tabCounts.tomorrow} visits auto-scheduled for Tomorrow (04 Oct 2026), or you can run the auto-scheduler anytime!`
                : 'Try adjusting your search terms or filters.'}
            </p>
            <div className="fv-empty-actions">
              {activeTab === 'today' && tabCounts.tomorrow > 0 && (
                <button
                  type="button"
                  className="btn-schedule-visit-primary"
                  onClick={() => setActiveTab('tomorrow')}
                >
                  <ArrowRight size={15} />
                  <span>View Tomorrow's Scheduled Route ({tabCounts.tomorrow} Visits)</span>
                </button>
              )}
              <button
                type="button"
                className="btn-auto-schedule"
                onClick={handleRunAutoSchedule}
              >
                <Sparkles size={15} />
                <span>⚡ Auto-Schedule Next Day</span>
              </button>
              <button
                type="button"
                className="btn-loc-action-secondary"
                onClick={() => handleOpenScheduleModal()}
              >
                <Plus size={15} />
                <span>+ Schedule Single Visit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="fv-table-responsive">
            <table className="fv-table">
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>CONTACT</th>
                  <th>VISIT DATE</th>
                  <th>TYPE</th>
                  <th>OUTCOME</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayedVisits.map((visit) => {
                  const initial = (visit.customerName || 'C').charAt(0).toUpperCase()
                  const isCompleted = visit.status === 'Completed'
                  const statusClass = (visit.status || 'scheduled').toLowerCase().replace(' ', '-')
                  const typeClass = (visit.type || 'daily').toLowerCase().includes('week')
                    ? 'weekly'
                    : (visit.type || '').toLowerCase().includes('month')
                    ? 'monthly'
                    : (visit.type || '').toLowerCase().includes('kyc')
                    ? 'kyc'
                    : (visit.type || '').toLowerCase().includes('overdue')
                    ? 'overdue'
                    : 'daily'

                  return (
                    <tr key={visit.id}>
                      {/* CUSTOMER */}
                      <td>
                        <div className="fv-cust-cell">
                          <div className="fv-cust-avatar">{initial}</div>
                          <div className="fv-cust-meta">
                            <span className="fv-cust-name">{visit.customerName}</span>
                            <div className="fv-cust-sub">
                              <span>{visit.customerId}</span>
                              {visit.loanId && visit.loanId !== '-' && (
                                <>
                                  <span>•</span>
                                  <span>{visit.loanId}</span>
                                </>
                              )}
                              {visit.targetAmount > 0 ? (
                                <span className="fv-target-pill">
                                  Due: {formatINR(visit.targetAmount)}
                                </span>
                              ) : (
                                <span className="fv-target-pill" style={{ color: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.12)' }}>
                                  KYC Check
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td>
                        <div className="fv-contact-cell">
                          <div className="fv-phone-row">
                            <span>{visit.phone}</span>
                            <a
                              href={`tel:${visit.phone}`}
                              className="fv-icon-link"
                              title="Call Customer"
                            >
                              <Phone size={12} />
                            </a>
                            <a
                              href={`https://wa.me/${visit.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="fv-icon-link wa"
                              title="WhatsApp Customer"
                            >
                              <MessageCircle size={12} />
                            </a>
                          </div>
                          <span
                            className="fv-address-snippet"
                            title={visit.address}
                            onClick={() => handleOpenRouteModal(visit)}
                            style={{ cursor: 'pointer' }}
                          >
                            <MapPin size={11} className="text-slate-500" />
                            <span>{visit.address}</span>
                          </span>
                        </div>
                      </td>

                      {/* VISIT DATE */}
                      <td>
                        <div className="fv-date-cell">
                          <span className="fv-date-str">
                            {visit.visitDateFormatted || visit.visitDate}
                          </span>
                          <span className="fv-time-slot">{visit.timeSlot}</span>
                          <span className="fv-officer-sub">{visit.officer}</span>
                        </div>
                      </td>

                      {/* TYPE */}
                      <td>
                        <span className={`fv-type-badge ${typeClass}`}>
                          {visit.type}
                        </span>
                      </td>

                      {/* OUTCOME */}
                      <td>
                        <div className="fv-outcome-cell">
                          <span
                            className={`fv-outcome-text ${
                              visit.collectedAmount > 0 ? 'collected' : ''
                            }`}
                          >
                            {visit.collectedAmount > 0
                              ? `Collected: ${formatINR(visit.collectedAmount)}`
                              : visit.outcome || 'Pending Visit'}
                          </span>
                          {visit.notes && (
                            <span className="fv-outcome-notes" title={visit.notes}>
                              {visit.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`fv-status-badge ${statusClass}`}>
                          {visit.status === 'Completed' && <CheckCircle2 size={12} />}
                          <span>{visit.status}</span>
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="fv-actions-cell">
                          {!isCompleted && (
                            <button
                              type="button"
                              className="btn-action-complete"
                              onClick={() => handleOpenCompleteModal(visit)}
                              title="Record collection and outcome"
                            >
                              <CheckCircle2 size={13} />
                              <span>Done</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => handleOpenRouteModal(visit)}
                            title="View address documents and navigation"
                          >
                            <Navigation size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => handleOpenRescheduleModal(visit)}
                            title="Reschedule visit"
                          >
                            <RotateCcw size={13} />
                          </button>

                          <button
                            type="button"
                            className="btn-action-icon danger"
                            onClick={() => {
                              if (confirm(`Remove visit for ${visit.customerName}?`)) {
                                deleteVisit(visit.id)
                              }
                            }}
                            title="Delete visit"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ====================================================================
          MODAL: SCHEDULE VISIT
          ==================================================================== */}
      {isScheduleModalOpen && (
        <div className="fv-modal-overlay">
          <div className="fv-modal-box">
            <div className="fv-modal-header">
              <h3 className="fv-modal-title">Schedule Field Visit</h3>
              <button
                type="button"
                className="fv-modal-close-btn"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="fv-modal-body">
                {/* Select Customer */}
                <div className="fv-form-group">
                  <label className="fv-form-label">
                    Select Customer <span className="req">*</span>
                  </label>
                  <select
                    className="fv-form-select"
                    value={scheduleForm.customerId}
                    onChange={(e) => handleSelectCustomerInForm(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choose customer...
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id}) - {c.center}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fv-form-row-2">
                  <div className="fv-form-group">
                    <label className="fv-form-label">Visit Type</label>
                    <select
                      className="fv-form-select"
                      value={scheduleForm.type}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, type: e.target.value })
                      }
                    >
                      <option value="Daily Collection">Daily Collection</option>
                      <option value="Weekly Collection">Weekly Collection</option>
                      <option value="Monthly Collection">Monthly Collection</option>
                      <option value="KYC Verification">KYC & Document Verification</option>
                      <option value="House Verification">House Verification</option>
                      <option value="Overdue Recovery">Overdue Recovery</option>
                    </select>
                  </div>

                  <div className="fv-form-group">
                    <label className="fv-form-label">Target Collection Amount (₹)</label>
                    <input
                      type="number"
                      className="fv-form-input"
                      value={scheduleForm.targetAmount}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, targetAmount: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="fv-form-row-2">
                  <div className="fv-form-group">
                    <label className="fv-form-label">Visit Date</label>
                    <input
                      type="date"
                      className="fv-form-input"
                      value={scheduleForm.visitDate}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, visitDate: e.target.value })
                      }
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div className="fv-form-group">
                    <label className="fv-form-label">Time Slot</label>
                    <select
                      className="fv-form-select"
                      value={scheduleForm.timeSlot}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })
                      }
                    >
                      <option value="09:30 AM - 10:15 AM">09:30 AM - 10:15 AM (Morning)</option>
                      <option value="10:15 AM - 10:45 AM">10:15 AM - 10:45 AM</option>
                      <option value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</option>
                      <option value="11:45 AM - 12:30 PM">11:45 AM - 12:30 PM (Midday)</option>
                      <option value="02:00 PM - 02:45 PM">02:00 PM - 02:45 PM (Afternoon)</option>
                      <option value="03:30 PM - 04:15 PM">03:30 PM - 04:15 PM</option>
                      <option value="04:30 PM - 05:00 PM">04:30 PM - 05:00 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <div className="fv-form-group">
                  <label className="fv-form-label">Document Address & Landmark</label>
                  <input
                    type="text"
                    className="fv-form-input"
                    value={scheduleForm.address}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, address: e.target.value })
                    }
                    placeholder="Physical document address from Aadhaar..."
                  />
                </div>

                <div className="fv-form-row-2">
                  <div className="fv-form-group">
                    <label className="fv-form-label">Assigned Field Officer</label>
                    <select
                      className="fv-form-select"
                      value={scheduleForm.officer}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, officer: e.target.value })
                      }
                    >
                      <option value="Rajesh Kumar (FO #04)">Rajesh Kumar (FO #04 - Pragati)</option>
                      <option value="Vikram Singh (FO #02)">Vikram Singh (FO #02 - Kalyan)</option>
                      <option value="Sunita Rao (FO #01)">Sunita Rao (FO #01 - Udaan)</option>
                      <option value="Amit Sharma (FO #05)">Amit Sharma (FO #05 - Shakti)</option>
                    </select>
                  </div>

                  <div className="fv-form-group">
                    <label className="fv-form-label">Priority</label>
                    <select
                      className="fv-form-select"
                      value={scheduleForm.priority}
                      onChange={(e) =>
                        setScheduleForm({ ...scheduleForm, priority: e.target.value })
                      }
                    >
                      <option value="Normal">Normal Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Recovery</option>
                    </select>
                  </div>
                </div>

                <div className="fv-form-group">
                  <label className="fv-form-label">Notes & Field Instructions</label>
                  <textarea
                    className="fv-form-textarea"
                    placeholder="Any specific document checks or instructions..."
                    value={scheduleForm.notes}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, notes: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>

              <div className="fv-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsScheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: COMPLETE VISIT & RECORD COLLECTION
          ==================================================================== */}
      {isCompleteModalOpen && selectedVisit && (
        <div className="fv-modal-overlay">
          <div className="fv-modal-box">
            <div className="fv-modal-header">
              <h3 className="fv-modal-title">Record Visit Outcome & Collection</h3>
              <button
                type="button"
                className="fv-modal-close-btn"
                onClick={() => setIsCompleteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit}>
              <div className="fv-modal-body">
                {/* Borrower Summary */}
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                    {selectedVisit.customerName} ({selectedVisit.customerId})
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '3px' }}>
                    📍 {selectedVisit.address}
                  </div>
                  <div style={{ color: '#10b981', fontSize: '12px', marginTop: '3px', fontWeight: 600 }}>
                    Target EMI: {formatINR(selectedVisit.targetAmount)} • {selectedVisit.type}
                  </div>
                </div>

                <div className="fv-form-row-2">
                  <div className="fv-form-group">
                    <label className="fv-form-label">
                      Amount Collected (₹) <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      className="fv-form-input"
                      value={completeForm.amount}
                      onChange={(e) =>
                        setCompleteForm({ ...completeForm, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="fv-form-group">
                    <label className="fv-form-label">Payment Mode</label>
                    <select
                      className="fv-form-select"
                      value={completeForm.paymentMode}
                      onChange={(e) =>
                        setCompleteForm({ ...completeForm, paymentMode: e.target.value })
                      }
                    >
                      <option value="CASH">Cash Collection</option>
                      <option value="UPI">UPI QR Code</option>
                      <option value="TRANSFER">Bank Transfer / IMPS</option>
                      <option value="NONE">No Payment Collected (KYC only)</option>
                    </select>
                  </div>
                </div>

                <div className="fv-form-group">
                  <label className="fv-form-label">Visit Outcome</label>
                  <select
                    className="fv-form-select"
                    value={completeForm.outcome}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, outcome: e.target.value })
                    }
                  >
                    <option value="Payment Collected Full">Payment Collected Full</option>
                    <option value="Partial Payment Received">Partial Payment Received</option>
                    <option value="KYC Documents Verified & Collected">
                      KYC Documents Verified & Collected
                    </option>
                    <option value="Customer Not Available (House Locked)">
                      Customer Not Available (House Locked)
                    </option>
                    <option value="Promise to Pay (PTP)">Promise to Pay (PTP)</option>
                    <option value="Address Shifted">Address Shifted / Not Found</option>
                  </select>
                </div>

                <div className="fv-form-group">
                  <label className="fv-form-label">Officer Remarks</label>
                  <textarea
                    className="fv-form-textarea"
                    placeholder="Enter visit remarks or collection notes..."
                    value={completeForm.notes}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, notes: e.target.value })
                    }
                  ></textarea>
                </div>

                {/* Ledger Sync Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="syncLedger"
                    checked={completeForm.syncToLedger}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, syncToLedger: e.target.checked })
                    }
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <label
                    htmlFor="syncLedger"
                    style={{ fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' }}
                  >
                    Instantly sync payment to Loan Repayment Ledger & Today's Collections
                  </label>
                </div>
              </div>

              <div className="fv-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsCompleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit emerald">
                  Save & Complete Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: RESCHEDULE VISIT
          ==================================================================== */}
      {isRescheduleModalOpen && selectedVisit && (
        <div className="fv-modal-overlay">
          <div className="fv-modal-box">
            <div className="fv-modal-header">
              <h3 className="fv-modal-title">Reschedule Visit</h3>
              <button
                type="button"
                className="fv-modal-close-btn"
                onClick={() => setIsRescheduleModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="fv-modal-body">
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Rescheduling visit for <strong style={{ color: '#fff' }}>{selectedVisit.customerName}</strong>.
                </p>

                <div className="fv-form-row-2">
                  <div className="fv-form-group">
                    <label className="fv-form-label">New Visit Date</label>
                    <input
                      type="date"
                      className="fv-form-input"
                      value={rescheduleForm.newDate}
                      onChange={(e) =>
                        setRescheduleForm({ ...rescheduleForm, newDate: e.target.value })
                      }
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>

                  <div className="fv-form-group">
                    <label className="fv-form-label">New Time Slot</label>
                    <select
                      className="fv-form-select"
                      value={rescheduleForm.newTimeSlot}
                      onChange={(e) =>
                        setRescheduleForm({ ...rescheduleForm, newTimeSlot: e.target.value })
                      }
                    >
                      <option value="09:30 AM - 10:15 AM">09:30 AM - 10:15 AM</option>
                      <option value="11:00 AM - 11:45 AM">11:00 AM - 11:45 AM</option>
                      <option value="02:30 PM - 03:15 PM">02:30 PM - 03:15 PM</option>
                      <option value="04:30 PM - 05:15 PM">04:30 PM - 05:15 PM</option>
                    </select>
                  </div>
                </div>

                <div className="fv-form-group">
                  <label className="fv-form-label">Reason for Rescheduling</label>
                  <input
                    type="text"
                    className="fv-form-input"
                    value={rescheduleForm.reason}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, reason: e.target.value })
                    }
                    placeholder="Customer request, house locked, etc."
                  />
                </div>
              </div>

              <div className="fv-modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsRescheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ROUTE & DOCUMENT DETAILS
          ==================================================================== */}
      {isRouteModalOpen && selectedVisit && (
        <div className="fv-modal-overlay">
          <div className="fv-modal-box">
            <div className="fv-modal-header">
              <h3 className="fv-modal-title">Document Address & Route Details</h3>
              <button
                type="button"
                className="fv-modal-close-btn"
                onClick={() => setIsRouteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="fv-modal-body">
              {/* Customer Profile Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  backgroundColor: '#0b0f19',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div className="fv-cust-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                  {selectedVisit.customerName.charAt(0)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    {selectedVisit.customerName}
                  </span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    ID: {selectedVisit.customerId} • Center: {selectedVisit.center}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <a
                      href={`tel:${selectedVisit.phone}`}
                      className="btn-loc-action-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      <Phone size={11} /> Call {selectedVisit.phone}
                    </a>
                    <a
                      href={`https://wa.me/${selectedVisit.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-loc-action-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px', color: '#34d399' }}
                    >
                      <MessageCircle size={11} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Document Address Section */}
              <div className="fv-form-group">
                <span className="fv-form-label">Registered KYC Document Address:</span>
                <div
                  style={{
                    backgroundColor: '#0b0f19',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '13px',
                    color: '#e2e8f0',
                    lineHeight: '1.5'
                  }}
                >
                  📍 {selectedVisit.address}
                </div>
              </div>

              {/* Documents & KYC Checklist */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Document Proof
                  </span>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                    {selectedVisit.documentType || 'Aadhaar Card'}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    Amount Structure
                  </span>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', marginTop: '2px' }}>
                    Due: {formatINR(selectedVisit.targetAmount)} ({selectedVisit.type})
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    selectedVisit.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-loc-action-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                >
                  <Navigation size={15} />
                  <span>Start Navigation (Google Maps)</span>
                </a>
              </div>
            </div>

            <div className="fv-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsRouteModalOpen(false)}
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
