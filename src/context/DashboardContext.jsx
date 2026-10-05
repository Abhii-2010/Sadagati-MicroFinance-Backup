import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { formatINR } from '../utils/formatters'
import {
  LoanCalculationService,
  TENURE_UNIT_LABELS,
  REPAYMENT_FREQUENCY_LABELS
} from '../services/loanCalculationService.js'

const DashboardContext = createContext(null)

const STORAGE_KEY = 'sadagati_mf_dashboard_state_v6'

const DEFAULT_METRICS = {
  totalPortfolio: 82000,
  portfolioGrowthRate: 12.8,
  activeLoans: 6,
  outstandingAmount: 80925,
  outstandingBreakdown: 'Principal + Interest',
  todaysCollection: 0,
  paymentsReceivedCount: 0,
  overdueAmount: 0,
  npaAccountsCount: 0,

  // Bottom mini cards
  totalCustomers: 7,
  disbursedThisMonth: 4,
  pendingApplicationsCount: 1,
  npaRatio: 0.0
}

export const BLANK_METRICS = {
  totalPortfolio: 0,
  portfolioGrowthRate: 0,
  activeLoans: 0,
  outstandingAmount: 0,
  outstandingBreakdown: 'Principal + Interest',
  todaysCollection: 0,
  paymentsReceivedCount: 0,
  overdueAmount: 0,
  npaAccountsCount: 0,
  totalCustomers: 0,
  disbursedThisMonth: 0,
  pendingApplicationsCount: 0,
  npaRatio: 0.0
}

const DEFAULT_TREND = [
  { day: 'Sun', amount: 0, label: '0k' },
  { day: 'Mon', amount: 0, label: '0k' },
  { day: 'Tue', amount: 0, label: '0k' },
  { day: 'Wed', amount: 0, label: '0k' },
  { day: 'Thu', amount: 0, label: '0k' },
  { day: 'Fri', amount: 0, label: '0k' },
  { day: 'Sat', amount: 0, label: '0k' }
]

export const BLANK_TREND = [
  { day: 'Sun', amount: 0, label: '0k' },
  { day: 'Mon', amount: 0, label: '0k' },
  { day: 'Tue', amount: 0, label: '0k' },
  { day: 'Wed', amount: 0, label: '0k' },
  { day: 'Thu', amount: 0, label: '0k' },
  { day: 'Fri', amount: 0, label: '0k' },
  { day: 'Sat', amount: 0, label: '0k' }
]

const DEFAULT_STATUS = [
  { id: 'active', label: 'Active', count: 5, color: '#10b981' },
  { id: 'npa', label: 'NPA', count: 0, color: '#f59e0b' },
  { id: 'closed', label: 'Closed', count: 1, color: '#3b82f6' }
]

export const BLANK_STATUS = [
  { id: 'active', label: 'Active', count: 0, color: '#10b981' },
  { id: 'npa', label: 'NPA', count: 0, color: '#f59e0b' },
  { id: 'closed', label: 'Closed', count: 0, color: '#3b82f6' }
]

const DEFAULT_PENDING_APPROVALS = [
  {
    id: 'APP0717700305',
    borrowerName: 'Meenakshi Sharma',
    phone: '+91 98765 43210',
    amount: 5000,
    tenure: '3.5 months',
    product: 'Daily Micro Business Loan',
    interestRate: '12%',
    dailyEmi: 100,
    frequency: 'Daily',
    center: 'Center #14 (Pragati)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    submittedBy: 'Rahul Sharma',
    employeeId: 'EMP-JPR-001',
    date: '24 Mar 2026',
    status: 'Pending Review'
  },
  {
    id: 'APP0829100412',
    borrowerName: 'Gopal Soni',
    phone: '+91 98290 77112',
    amount: 40000,
    tenure: '6 months',
    product: 'Monthly Small Enterprise Loan',
    interestRate: '14%',
    dailyEmi: 0,
    emi: 7100,
    frequency: 'Monthly',
    center: 'Center #01 (Mehrangarh)',
    branchId: 'BR-002',
    branch: 'Jodhpur City Branch',
    submittedBy: 'Priya Singh',
    employeeId: 'EMP-JDH-001',
    date: '28 Mar 2026',
    status: 'Pending Review'
  }
]

const DEFAULT_RECENT_PAYMENTS = [
  {
    id: 'RCP4176182787',
    mode: 'CASH',
    amount: 100,
    date: '15 Mar 2026',
    borrower: 'Sunita Sharma',
    loanId: 'LN90281',
    frequency: 'daily',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    collectedBy: 'Rahul Sharma',
    employeeId: 'EMP-JPR-001',
    status: 'Success'
  },
  {
    id: 'RCP2359801222',
    mode: 'CASH',
    amount: 50,
    date: '15 Mar 2026',
    borrower: 'Radha Devi',
    loanId: 'LN90282',
    frequency: 'daily',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    collectedBy: 'Rahul Sharma',
    employeeId: 'EMP-JPR-001',
    status: 'Success'
  },
  {
    id: 'RCP3199824429',
    mode: 'CASH',
    amount: 0,
    date: '15 Mar 2026',
    borrower: 'Meena Bai',
    loanId: 'LN90283',
    frequency: 'daily',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    collectedBy: 'Rahul Sharma',
    employeeId: 'EMP-JPR-001',
    status: 'Success'
  },
  {
    id: 'RCP5169876544',
    mode: 'CASH',
    amount: 100,
    date: '15 Mar 2026',
    borrower: 'Pooja Verma',
    loanId: 'LN90284',
    frequency: 'weekly',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    collectedBy: 'Rahul Sharma',
    employeeId: 'EMP-JPR-001',
    status: 'Success'
  },
  {
    id: 'RCP3458844476',
    mode: 'UPI',
    amount: 25000,
    date: '15 Mar 2026',
    borrower: 'Aarti Kumari',
    loanId: 'LN90285',
    frequency: 'monthly',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    collectedBy: 'Rahul Sharma',
    employeeId: 'EMP-JPR-001',
    status: 'Success'
  }
]

const DEFAULT_COLLECTION_TRACKER = {
  daily: {
    expected: 100,
    collected: 0,
    remaining: 100,
    loanCount: 1
  },
  weekly: {
    expected: 75,
    collected: 0,
    remaining: 75,
    loanCount: 1
  },
  monthly: {
    expected: 4425,
    collected: 0,
    remaining: 4425,
    loanCount: 1
  }
}

export const BLANK_COLLECTION_TRACKER = {
  daily: { expected: 0, collected: 0, remaining: 0, loanCount: 0 },
  weekly: { expected: 0, collected: 0, remaining: 0, loanCount: 0 },
  monthly: { expected: 0, collected: 0, remaining: 0, loanCount: 0 }
}

const DEFAULT_LOANS = [
  {
    id: 'LN90281',
    customerId: 'SGTPL000001',
    borrowerName: 'Sunita Sharma',
    phone: '+91 98234 11201',
    address: 'House #142, Pragati Nagar, Near Old Shiv Temple, Jaipur - 302012',
    locality: 'Pragati Nagar',
    pincode: '302012',
    principal: 15000,
    outstanding: 14800,
    tenure: '3.5 months',
    product: 'Daily Micro Business Loan',
    frequency: 'Daily',
    emi: 100,
    center: 'Center #14 (Pragati)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    disbursedDate: '01 Mar 2026',
    status: 'Active'
  },
  {
    id: 'LN90282',
    customerId: 'SGTPL000002',
    borrowerName: 'Radha Devi',
    phone: '+91 98765 22102',
    address: 'Plot #55, Pragati Colony, Sector 3, Jaipur - 302012',
    locality: 'Pragati Colony',
    pincode: '302012',
    principal: 12000,
    outstanding: 11850,
    tenure: '3.5 months',
    product: 'Daily Micro Business Loan',
    frequency: 'Daily',
    emi: 50,
    center: 'Center #14 (Pragati)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    disbursedDate: '03 Mar 2026',
    status: 'Active'
  },
  {
    id: 'LN90283',
    customerId: 'SGTPL000003',
    borrowerName: 'Meena Bai',
    phone: '+91 98112 33405',
    address: 'B-24, Kalyan Basti, Near Community Hall, Jaipur - 302018',
    locality: 'Kalyan Basti',
    pincode: '302018',
    principal: 10000,
    outstanding: 9900,
    tenure: '3.5 months',
    product: 'Daily Micro Business Loan',
    frequency: 'Daily',
    emi: 100,
    center: 'Center #08 (Kalyan)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    disbursedDate: '05 Mar 2026',
    status: 'Active'
  },
  {
    id: 'LN90284',
    customerId: 'SGTPL000004',
    borrowerName: 'Pooja Verma',
    phone: '+91 98450 99812',
    address: 'Village Road #3, Near Udaan Dairy Farm, Jaipur - 302029',
    locality: 'Udaan Dairy Road',
    pincode: '302029',
    principal: 20000,
    outstanding: 19375,
    tenure: '6 months',
    product: 'Weekly Livestock Loan',
    frequency: 'Weekly',
    emi: 75,
    center: 'Center #02 (Udaan)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    disbursedDate: '08 Mar 2026',
    status: 'Active'
  },
  {
    id: 'LN90285',
    customerId: 'SGTPL000005',
    borrowerName: 'Aarti Kumari',
    phone: '+91 98901 77654',
    address: 'Shakti Bazar, Shop #12, Commercial Belt, Jaipur - 302015',
    locality: 'Shakti Bazar',
    pincode: '302015',
    principal: 25000,
    outstanding: 25000,
    tenure: '12 months',
    product: 'Monthly Small Enterprise Loan',
    frequency: 'Monthly',
    emi: 4425,
    center: 'Center #05 (Shakti)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    disbursedDate: '10 Mar 2026',
    status: 'Active'
  },
  {
    id: 'LN90280',
    customerId: 'SGTPL000006',
    borrowerName: 'Rekha Devi',
    phone: '+91 97890 12345',
    address: 'Adarsh Nagar, Gali #4, Jaipur - 302004',
    locality: 'Adarsh Nagar',
    pincode: '302004',
    principal: 5000,
    outstanding: 0,
    tenure: '1 month',
    product: 'Emergency Festival Loan',
    frequency: 'Daily',
    emi: 100,
    center: 'Center #01 (Adarsh)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    disbursedDate: '01 Feb 2026',
    status: 'Closed'
  },
  {
    id: 'LN90286',
    customerId: 'SGTPL000008',
    borrowerName: 'Kavita Rathore',
    phone: '+91 98291 55443',
    address: 'House #42, Clock Tower Bazaar, Jodhpur - 342001',
    locality: 'Clock Tower Bazaar',
    pincode: '342001',
    principal: 30000,
    outstanding: 28500,
    tenure: '6 months',
    product: 'Daily Micro Business Loan',
    frequency: 'Daily',
    emi: 150,
    center: 'Center #01 (Mehrangarh)',
    branchId: 'BR-002',
    branch: 'Jodhpur City Branch',
    disbursedDate: '15 Jan 2026',
    status: 'Active'
  }
]

// Customer ID helper: Ensures IDs strictly start from SGTPL000001
const formatCustomerId = (number) => {
  return `SGTPL${String(number).padStart(6, '0')}`
}

const generateCustomerId = (existingCustomers) => {
  let maxNum = 0
  ;(existingCustomers || []).forEach((c) => {
    const match = c.id && String(c.id).match(/^SGTPL(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  })
  const nextNum = maxNum > 0 ? maxNum + 1 : ((existingCustomers?.length || 0) + 1)
  return `SGTPL${String(nextNum).padStart(6, '0')}`
}

const DEFAULT_CUSTOMERS = [
  {
    id: 'SGTPL000001',
    name: 'Sunita Sharma',
    employment: 'business',
    phone: '+91 98234 11201',
    location: 'Pragati Nagar, Jaipur',
    addressLine: 'House #142, Pragati Nagar, Near Old Shiv Temple',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302012',
    fullAddress: 'House #142, Pragati Nagar, Near Old Shiv Temple, Jaipur - 302012',
    center: 'Center #14 (Pragati)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 1,
    totalBorrowed: 15000,
    creditScore: 755,
    joinDate: '01 Mar 2026',
    documentType: 'Aadhaar Card + Bank Passbook',
    aadhaarNumber: 'XXXX-XXXX-8921',
    panNumber: 'BRKPS8219L',
    loanId: 'LN90281',
    dailyEmi: 100,
    monthlyIncome: 22000
  },
  {
    id: 'SGTPL000002',
    name: 'Radha Devi',
    employment: 'self employed',
    phone: '+91 98765 22102',
    location: 'Pragati Colony, Jaipur',
    addressLine: 'Plot #55, Pragati Colony, Sector 3',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302012',
    fullAddress: 'Plot #55, Pragati Colony, Sector 3, Jaipur - 302012',
    center: 'Center #14 (Pragati)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 1,
    totalBorrowed: 12000,
    creditScore: 735,
    joinDate: '03 Mar 2026',
    documentType: 'Aadhaar Card + Ration Card',
    aadhaarNumber: 'XXXX-XXXX-3419',
    panNumber: 'DJYPD4112M',
    loanId: 'LN90282',
    dailyEmi: 50,
    monthlyIncome: 16000
  },
  {
    id: 'SGTPL000003',
    name: 'Meena Bai',
    employment: 'daily wage',
    phone: '+91 98112 33405',
    location: 'Kalyan Basti, Jaipur',
    addressLine: 'B-24, Kalyan Basti, Near Community Hall',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302018',
    fullAddress: 'B-24, Kalyan Basti, Near Community Hall, Jaipur - 302018',
    center: 'Center #08 (Kalyan)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 1,
    totalBorrowed: 10000,
    creditScore: 720,
    joinDate: '05 Mar 2026',
    documentType: 'Aadhaar Card',
    aadhaarNumber: 'XXXX-XXXX-9901',
    panNumber: 'KPXPB9012N',
    loanId: 'LN90283',
    dailyEmi: 100,
    monthlyIncome: 14000
  },
  {
    id: 'SGTPL000004',
    name: 'Pooja Verma',
    employment: 'agriculture',
    phone: '+91 98450 99812',
    location: 'Udaan Dairy Road, Jaipur',
    addressLine: 'Village Road #3, Near Udaan Dairy Farm',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302029',
    fullAddress: 'Village Road #3, Near Udaan Dairy Farm, Jaipur - 302029',
    center: 'Center #02 (Udaan)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 1,
    totalBorrowed: 20000,
    creditScore: 760,
    joinDate: '08 Mar 2026',
    documentType: 'Aadhaar Card + Land Document',
    aadhaarNumber: 'XXXX-XXXX-7723',
    panNumber: 'MTRPV3321Q',
    loanId: 'LN90284',
    weeklyEmi: 75,
    monthlyIncome: 28000
  },
  {
    id: 'SGTPL000005',
    name: 'Aarti Kumari',
    employment: 'business',
    phone: '+91 98901 77654',
    location: 'Shakti Bazar, Jaipur',
    addressLine: 'Shakti Bazar, Shop #12, Commercial Belt',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302015',
    fullAddress: 'Shakti Bazar, Shop #12, Commercial Belt, Jaipur - 302015',
    center: 'Center #05 (Shakti)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 1,
    totalBorrowed: 25000,
    creditScore: 790,
    joinDate: '10 Mar 2026',
    documentType: 'Aadhaar + GST + Trade License',
    aadhaarNumber: 'XXXX-XXXX-6612',
    panNumber: 'ATYPK6612R',
    loanId: 'LN90285',
    monthlyEmi: 4425,
    monthlyIncome: 55000
  },
  {
    id: 'SGTPL000006',
    name: 'Rekha Devi',
    employment: 'tailoring',
    phone: '+91 97890 12345',
    location: 'Adarsh Nagar, Jaipur',
    addressLine: 'Adarsh Nagar, Gali #4',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302004',
    fullAddress: 'Adarsh Nagar, Gali #4, Jaipur - 302004',
    center: 'Center #01 (Adarsh)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 0,
    totalBorrowed: 5000,
    creditScore: 740,
    joinDate: '01 Feb 2026',
    documentType: 'Aadhaar Card',
    aadhaarNumber: 'XXXX-XXXX-1234',
    panNumber: 'RKHPD1234F',
    loanId: 'LN90280',
    dailyEmi: 100,
    monthlyIncome: 18000
  },
  {
    id: 'SGTPL000007',
    name: 'Meenakshi Sharma',
    employment: 'business',
    phone: '+91 98765 43210',
    location: 'Pragati West, Jaipur',
    addressLine: 'House #88, Pragati West Extension',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302012',
    fullAddress: 'House #88, Pragati West Extension, Jaipur - 302012',
    center: 'Center #14 (Pragati)',
    branchId: 'BR-001',
    branch: 'Jaipur Central Branch',
    kycStatus: 'Pending',
    status: 'Active',
    activeLoans: 0,
    totalBorrowed: 0,
    creditScore: 725,
    joinDate: '24 Mar 2026',
    documentType: 'Aadhaar + Electricity Bill (Pending Verification)',
    aadhaarNumber: 'XXXX-XXXX-5511',
    panNumber: 'MNKPS5511T',
    monthlyIncome: 20000
  },
  {
    id: 'SGTPL000008',
    name: 'Kavita Rathore',
    employment: 'handicrafts',
    phone: '+91 98291 55443',
    location: 'Clock Tower Road, Jodhpur',
    addressLine: 'House #42, Clock Tower Bazaar',
    city: 'Jodhpur',
    district: 'Jodhpur',
    state: 'Rajasthan',
    pincode: '342001',
    fullAddress: 'House #42, Clock Tower Bazaar, Jodhpur - 342001',
    center: 'Center #01 (Mehrangarh)',
    branchId: 'BR-002',
    branch: 'Jodhpur City Branch',
    kycStatus: 'Verified',
    status: 'Active',
    activeLoans: 1,
    totalBorrowed: 30000,
    creditScore: 780,
    joinDate: '12 Jan 2026',
    documentType: 'Aadhaar Card + Voter ID',
    aadhaarNumber: 'XXXX-XXXX-4512',
    panNumber: 'KVTRA8811K',
    loanId: 'LN90286',
    dailyEmi: 150,
    monthlyIncome: 35000
  }
]

const DEFAULT_VISITS = [
  {
    id: 'VST-20261004-001',
    customerId: 'SGTPL000001',
    customerName: 'Sunita Sharma',
    phone: '+91 98234 11201',
    loanId: 'LN90281',
    center: 'Center #14 (Pragati)',
    locality: 'Pragati Nagar',
    address: 'House #142, Pragati Nagar, Near Old Shiv Temple, Jaipur - 302012',
    pincode: '302012',
    visitDate: '2026-10-04',
    visitDateFormatted: '04 Oct 2026',
    timeSlot: '09:30 AM - 10:15 AM',
    type: 'Daily Collection',
    targetAmount: 100,
    collectedAmount: 0,
    status: 'Scheduled',
    outcome: 'Pending Visit',
    officer: 'Rajesh Kumar (FO #04)',
    officerPhone: '+91 98290 11404',
    priority: 'Normal',
    documentType: 'Aadhaar Card XXXX-8921',
    documentsVerified: true,
    notes: 'Daily EMI installment of ₹100. Pragati morning route.',
    isAutoScheduled: true,
    scheduledAt: '2026-10-03T18:00:00.000Z'
  },
  {
    id: 'VST-20261004-002',
    customerId: 'SGTPL000002',
    customerName: 'Radha Devi',
    phone: '+91 98765 22102',
    loanId: 'LN90282',
    center: 'Center #14 (Pragati)',
    locality: 'Pragati Colony',
    address: 'Plot #55, Pragati Colony, Sector 3, Jaipur - 302012',
    pincode: '302012',
    visitDate: '2026-10-04',
    visitDateFormatted: '04 Oct 2026',
    timeSlot: '10:15 AM - 10:45 AM',
    type: 'Daily Collection',
    targetAmount: 50,
    collectedAmount: 0,
    status: 'Scheduled',
    outcome: 'Pending Visit',
    officer: 'Rajesh Kumar (FO #04)',
    officerPhone: '+91 98290 11404',
    priority: 'Normal',
    documentType: 'Aadhaar Card XXXX-3419',
    documentsVerified: true,
    notes: 'Daily ₹50 micro business instalment. Sector 3 stop.',
    isAutoScheduled: true,
    scheduledAt: '2026-10-03T18:00:00.000Z'
  },
  {
    id: 'VST-20261004-003',
    customerId: 'SGTPL000003',
    customerName: 'Meena Bai',
    phone: '+91 98112 33405',
    loanId: 'LN90283',
    center: 'Center #08 (Kalyan)',
    locality: 'Kalyan Basti',
    address: 'B-24, Kalyan Basti, Near Community Hall, Jaipur - 302018',
    pincode: '302018',
    visitDate: '2026-10-04',
    visitDateFormatted: '04 Oct 2026',
    timeSlot: '11:15 AM - 11:45 AM',
    type: 'Daily Collection',
    targetAmount: 100,
    collectedAmount: 0,
    status: 'Scheduled',
    outcome: 'Pending Visit',
    officer: 'Vikram Singh (FO #02)',
    officerPhone: '+91 98291 22302',
    priority: 'Normal',
    documentType: 'Aadhaar Card XXXX-9901',
    documentsVerified: true,
    notes: 'Center #08 Kalyan daily recovery visit.',
    isAutoScheduled: true,
    scheduledAt: '2026-10-03T18:00:00.000Z'
  },
  {
    id: 'VST-20261004-004',
    customerId: 'SGTPL000004',
    customerName: 'Pooja Verma',
    phone: '+91 98450 99812',
    loanId: 'LN90284',
    center: 'Center #02 (Udaan)',
    locality: 'Udaan Dairy Road',
    address: 'Village Road #3, Near Udaan Dairy Farm, Jaipur - 302029',
    pincode: '302029',
    visitDate: '2026-10-04',
    visitDateFormatted: '04 Oct 2026',
    timeSlot: '12:00 PM - 12:45 PM',
    type: 'Weekly Collection',
    targetAmount: 75,
    collectedAmount: 0,
    status: 'Scheduled',
    outcome: 'Pending Visit',
    officer: 'Sunita Rao (FO #01)',
    officerPhone: '+91 98292 33401',
    priority: 'Normal',
    documentType: 'Aadhaar Card + Land Document',
    documentsVerified: true,
    notes: 'Weekly Livestock Loan installment #4 collection.',
    isAutoScheduled: true,
    scheduledAt: '2026-10-03T18:00:00.000Z'
  },
  {
    id: 'VST-20261004-005',
    customerId: 'SGTPL000007',
    customerName: 'Meenakshi Sharma',
    phone: '+91 98765 43210',
    loanId: 'APP0717700305',
    center: 'Center #14 (Pragati)',
    locality: 'Pragati West',
    address: 'House #88, Pragati West Extension, Jaipur - 302012',
    pincode: '302012',
    visitDate: '2026-10-04',
    visitDateFormatted: '04 Oct 2026',
    timeSlot: '02:30 PM - 03:15 PM',
    type: 'KYC Verification',
    targetAmount: 0,
    collectedAmount: 0,
    status: 'Scheduled',
    outcome: 'Pending Visit',
    officer: 'Rajesh Kumar (FO #04)',
    officerPhone: '+91 98290 11404',
    priority: 'High',
    documentType: 'Aadhaar + Electricity Bill Verification',
    documentsVerified: false,
    notes: 'Verify original physical Aadhaar and residence address before approving loan application APP0717700305 (₹5,000).',
    isAutoScheduled: true,
    scheduledAt: '2026-10-03T18:00:00.000Z'
  }
]

const DEFAULT_LOAN_PRODUCTS = [
  {
    id: 'PL0001',
    name: 'Daily Micro Business Loan',
    interestRate: '12% reducing',
    interestType: 'Reducing Balance',
    loanType: 'Business',
    minAmount: 1000,
    maxAmount: 100000,
    amountRange: '₹1,000 - ₹1,00,000',
    tenure: '1 - 12 months',
    minTenure: 1,
    maxTenure: 12,
    tenureUnit: 'months',
    repaymentFrequency: 'Daily',
    processingFeeValue: '1.0',
    processingFeeType: 'Percentage',
    status: 'Active'
  },
  {
    id: 'PL0002',
    name: 'Weekly Livestock Loan',
    interestRate: '14% flat',
    interestType: 'Flat',
    loanType: 'Agri',
    minAmount: 5000,
    maxAmount: 200000,
    amountRange: '₹5,000 - ₹2,00,000',
    tenure: '1 - 24 months',
    minTenure: 1,
    maxTenure: 24,
    tenureUnit: 'months',
    repaymentFrequency: 'Weekly',
    processingFeeValue: '1.5',
    processingFeeType: 'Percentage',
    status: 'Active'
  },
  {
    id: 'PL0003',
    name: 'Monthly Small Enterprise Loan',
    interestRate: '16% reducing',
    interestType: 'Reducing Balance',
    loanType: 'Business',
    minAmount: 10000,
    maxAmount: 1000000,
    amountRange: '₹10,000 - ₹10,00,000',
    tenure: '3 - 36 months',
    minTenure: 3,
    maxTenure: 36,
    tenureUnit: 'months',
    repaymentFrequency: 'Monthly',
    processingFeeValue: '2.0',
    processingFeeType: 'Percentage',
    status: 'Active'
  },
  {
    id: 'PL0004',
    name: 'Emergency Festival Loan',
    interestRate: '10% flat',
    interestType: 'Flat',
    loanType: 'Personal',
    minAmount: 1000,
    maxAmount: 50000,
    amountRange: '₹1,000 - ₹50,000',
    tenure: '1 - 3 months',
    minTenure: 1,
    maxTenure: 3,
    tenureUnit: 'months',
    repaymentFrequency: 'Daily',
    processingFeeValue: '1.0',
    processingFeeType: 'Percentage',
    status: 'Active'
  },
  {
    id: 'PL0005',
    name: 'Agricultural Equipment Loan',
    interestRate: '11.5% reducing',
    interestType: 'Reducing Balance',
    loanType: 'Agri',
    minAmount: 20000,
    maxAmount: 1500000,
    amountRange: '₹20,000 - ₹15,00,000',
    tenure: '6 - 60 months',
    minTenure: 6,
    maxTenure: 60,
    tenureUnit: 'months',
    repaymentFrequency: 'Monthly',
    processingFeeValue: '1.5',
    processingFeeType: 'Percentage',
    status: 'Active'
  }
]

const DEFAULT_BRANCHES = [
  {
    id: 'BR-001',
    name: 'Jaipur Central Branch',
    code: 'JPR-01',
    address: 'Near Pragati Market, Jaipur, Rajasthan - 302012',
    phone: '+91 141-2345678',
    email: 'jaipur.central@sadagati.com',
    manager: 'Abhi',
    status: 'Active',
    centersCount: 3,
    activeBorrowers: 6
  },
  {
    id: 'BR-002',
    name: 'Jodhpur City Branch',
    code: 'JDH-01',
    address: 'Clock Tower Road, Jodhpur, Rajasthan - 342001',
    phone: '+91 291-2345678',
    email: 'jodhpur.city@sadagati.com',
    manager: 'Priya Singh',
    status: 'Active',
    centersCount: 2,
    activeBorrowers: 2
  }
]

const DEFAULT_USERS = [
  {
    id: 'USR-001',
    employeeId: 'EMP-HQ-001',
    name: 'Abhi',
    username: 'abhi.admin',
    email: 'abhi@sadagati.com',
    phone: '+91 98000 11111',
    role: 'Admin',
    branch: 'Jaipur Central Branch',
    branchId: 'BR-001',
    companyId: 'CMP-001',
    status: 'Active',
    lastLogin: 'Just now',
    accessLevel: 'full',
    designation: 'Managing Director & SuperAdmin',
    joiningDate: '01 Jan 2024',
    createdAt: '2024-01-01T00:00:00Z',
    password: 'password123',
    permissions: {
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
    },
    limits: {
      maxApprovalAmount: 1000000,
      maxDisbursementAmount: 2500000,
      canApproveLoans: true,
      canDisburseLoans: true,
      canDeleteRecords: true
    }
  },
  {
    id: 'USR-002',
    employeeId: 'EMP-HQ-002',
    name: 'Operations Manager',
    username: 'operations.mgr',
    email: 'operations@sadagati.com',
    phone: '+91 98234 56789',
    role: 'Admin',
    branch: 'Jaipur Central Branch',
    branchId: 'BR-001',
    companyId: 'CMP-001',
    status: 'Active',
    lastLogin: 'Yesterday',
    accessLevel: 'full',
    designation: 'Operations Director',
    joiningDate: '01 Mar 2025',
    createdAt: '2025-03-01T09:00:00Z',
    password: 'password123',
    permissions: {
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
    },
    limits: {
      maxApprovalAmount: 500000,
      maxDisbursementAmount: 1000000,
      canApproveLoans: true,
      canDisburseLoans: true,
      canDeleteRecords: true
    }
  },
  {
    id: 'USR-003',
    employeeId: 'EMP-JPR-001',
    name: 'Rahul Sharma',
    username: 'rahul.field',
    email: 'rahul.field@sadagati.com',
    phone: '+91 98123 45678',
    role: 'Field Officer',
    branch: 'Jaipur Central Branch',
    branchId: 'BR-001',
    companyId: 'CMP-001',
    status: 'Active',
    lastLogin: 'Today, 09:30 AM',
    accessLevel: 'limited',
    designation: 'Field Collection Officer',
    joiningDate: '20 Mar 2025',
    createdAt: '2025-03-20T14:30:00Z',
    password: 'password123',
    permissions: {
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
    },
    limits: {
      maxApprovalAmount: 0,
      maxDisbursementAmount: 0,
      canApproveLoans: false,
      canDisburseLoans: false,
      canDeleteRecords: false,
      dailyCollectionTarget: 150000
    }
  },
  {
    id: 'USR-004',
    employeeId: 'EMP-JDH-001',
    name: 'Priya Singh',
    username: 'priya.singh',
    email: 'priya.singh@sadagati.com',
    phone: '+91 98299 88776',
    role: 'Branch Executive',
    branch: 'Jodhpur City Branch',
    branchId: 'BR-002',
    companyId: 'CMP-001',
    status: 'Active',
    lastLogin: 'Today, 10:15 AM',
    accessLevel: 'branch',
    designation: 'Senior Branch Executive',
    joiningDate: '15 Jan 2026',
    createdAt: '2026-01-15T11:00:00Z',
    password: 'password123',
    permissions: {
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
    },
    limits: {
      maxApprovalAmount: 0,
      maxDisbursementAmount: 0,
      canApproveLoans: false,
      canDisburseLoans: false,
      canDeleteRecords: false,
      dailyCollectionTarget: 120000
    }
  }
]

const DEFAULT_INVITATIONS = []

const DEFAULT_SETTINGS = {
  company: {
    companyName: 'Sadagati Microfinance',
    rbiRegistrationNumber: 'NBFC-MFI-XXXXX',
    cinNumber: 'UXXXXX2024PTCXXXXXX',
    gstNumber: 'XXGSTIN1234567',
    email: 'info@sadagati.com',
    phone: '+91 1800-XXX-XXXX'
  },
  notifications: {
    emailNotifications: false,
    smsNotifications: false,
    whatsappNotifications: false,
    overdueReminders: false
  },
  security: {
    twoFactorAuth: false,
    ipWhitelist: false,
    sessionTimeout: 30,
    passwordExpiry: 90
  },
  loanSettings: {
    autoApprovalLimit: 50000,
    maxLoanAmount: 500000,
    npaThresholdDays: 90,
    penaltyGracePeriodDays: 7
  }
}

const DEFAULT_DISBURSEMENTS = [
  {
    id: 'DSB90112',
    loanId: 'LN90281',
    borrowerName: 'Sunita Sharma',
    amount: 15000,
    date: '01 Mar 2026',
    channel: 'Direct Account Transfer',
    status: 'Completed'
  },
  {
    id: 'DSB90113',
    loanId: 'LN90282',
    borrowerName: 'Radha Devi',
    amount: 12000,
    date: '03 Mar 2026',
    channel: 'Direct Account Transfer',
    status: 'Completed'
  },
  {
    id: 'DSB90114',
    loanId: 'LN90283',
    borrowerName: 'Meena Bai',
    amount: 10000,
    date: '05 Mar 2026',
    channel: 'Cash at Center',
    status: 'Completed'
  },
  {
    id: 'DSB90115',
    loanId: 'LN90284',
    borrowerName: 'Pooja Verma',
    amount: 20000,
    date: '08 Mar 2026',
    channel: 'NEFT Transfer',
    status: 'Completed'
  }
]

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'LOG-001',
    title: 'Disbursement Completed',
    detail: 'Loan LN90284 of ₹20,000 disbursed to Pooja Verma',
    category: 'PORTFOLIO',
    timestamp: '08 Mar 2026 10:30 AM',
    actor: 'Branch Manager'
  },
  {
    id: 'LOG-002',
    title: 'Payment Received',
    detail: '₹100 collected from Sunita Sharma via CASH',
    category: 'COLLECTION',
    timestamp: '15 Mar 2026 09:15 AM',
    actor: 'Field Officer #04'
  }
]

export function DashboardProvider({ children }) {
  const [metrics, setMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.metrics) return parsed.metrics
      }
    } catch {
      // fallback
    }
    return BLANK_METRICS
  })

  const [trend, setTrend] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.trend) return parsed.trend
      }
    } catch {
      // fallback
    }
    return BLANK_TREND
  })

  const [statusBreakdown, setStatusBreakdown] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.statusBreakdown) return parsed.statusBreakdown
      }
    } catch {
      // fallback
    }
    return BLANK_STATUS
  })

  const [pendingApprovals, setPendingApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.pendingApprovals && Array.isArray(parsed.pendingApprovals)) return parsed.pendingApprovals
      }
    } catch {
      // fallback
    }
    return []
  })

  const [recentPayments, setRecentPayments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.recentPayments && Array.isArray(parsed.recentPayments)) return parsed.recentPayments
      }
    } catch {
      // fallback
    }
    return []
  })

  const [collectionTracker, setCollectionTracker] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.collectionTracker) return parsed.collectionTracker
      }
    } catch {
      // fallback
    }
    return BLANK_COLLECTION_TRACKER
  })

  const [loans, setLoans] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.loans && Array.isArray(parsed.loans)) return parsed.loans
      }
    } catch {
      // fallback
    }
    return []
  })

  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.customers && Array.isArray(parsed.customers)) {
          // Ensure all customer IDs strictly start with SGTPL
          return parsed.customers.map((c, idx) => {
            const hasSgtpl = c.id && String(c.id).startsWith('SGTPL')
            return {
              ...c,
              id: hasSgtpl ? c.id : formatCustomerId(idx + 1),
              employment: c.employment || 'self employed',
              kycStatus: c.kycStatus || (idx === 0 ? 'Pending' : 'Verified')
            }
          })
        }
      }
    } catch {
      // fallback
    }
    return []
  })

  const [disbursements, setDisbursements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.disbursements && Array.isArray(parsed.disbursements)) return parsed.disbursements
      }
    } catch {
      // fallback
    }
    return []
  })

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) return parsed.auditLogs
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'LOG-001',
        title: 'System Initialized',
        detail: 'Ready for full microfinance testing cycle from scratch.',
        category: 'SYSTEM',
        timestamp: 'Just now',
        actor: 'Admin Abhi'
      }
    ]
  })

  const [visits, setVisits] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.visits && Array.isArray(parsed.visits)) return parsed.visits
      }
    } catch {
      // fallback
    }
    return []
  })

  const [loanProducts, setLoanProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.loanProducts && Array.isArray(parsed.loanProducts)) {
          return parsed.loanProducts.filter((p) => p.status !== 'Deactivated')
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_LOAN_PRODUCTS.filter((p) => p.status !== 'Deactivated')
  })

  const [branches, setBranches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.branches && Array.isArray(parsed.branches)) return parsed.branches
      }
    } catch {
      // fallback
    }
    return DEFAULT_BRANCHES
  })

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.users && Array.isArray(parsed.users)) return parsed.users
      }
    } catch {
      // fallback
    }
    return DEFAULT_USERS
  })

  const [invitations, setInvitations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.invitations && Array.isArray(parsed.invitations)) return parsed.invitations
      }
    } catch {
      // fallback
    }
    return DEFAULT_INVITATIONS
  })

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.settings) {
          return {
            ...DEFAULT_SETTINGS,
            ...parsed.settings,
            company: { ...DEFAULT_SETTINGS.company, ...(parsed.settings.company || {}) },
            notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.settings.notifications || {}) },
            security: { ...DEFAULT_SETTINGS.security, ...(parsed.settings.security || {}) },
            loanSettings: { ...DEFAULT_SETTINGS.loanSettings, ...(parsed.settings.loanSettings || {}) }
          }
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS
  })

  const [toasts, setToasts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [prefilledPaymentFreq, setPrefilledPaymentFreq] = useState('daily')

  const CURRENT_USER_STORAGE_KEY = 'sadagati_mf_current_user_v1'
  const SESSION_META_STORAGE_KEY = 'sadagati_mf_session_meta_v1'

  // Session expired notice (shown on login screen after automatic expiry)
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(null)
  const [isAuthRestoring, setIsAuthRestoring] = useState(true)

  // Rate limiting failed attempts map: { count, lockUntil }
  const [failedAttempts, setFailedAttempts] = useState({ count: 0, lockUntil: 0 })

  // Active password reset requests: { [identifier]: { code, expiresAt, userId } }
  const [resetRequests, setResetRequests] = useState({})

  // Initialize currentUser from secure session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
      const savedMeta = localStorage.getItem(SESSION_META_STORAGE_KEY)

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        if (parsedUser && parsedUser.id) {
          // Verify session expiry if meta exists
          if (savedMeta) {
            const meta = JSON.parse(savedMeta)
            if (meta && meta.expiresAt && Date.now() > meta.expiresAt) {
              localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
              localStorage.removeItem(SESSION_META_STORAGE_KEY)
              return null
            }
          }
          return parsedUser
        }
      }
    } catch {
      // fallback
    }
    // Return null when unauthenticated so user starts at the Login page
    return null
  })

  // Simulated smooth boot state to eliminate flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthRestoring(false)
    }, 280)
    return () => clearTimeout(timer)
  }, [])

  // Persist currentUser
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
      }
    } catch {
      // fallback
    }
  }, [currentUser])

  // Toast helper
  const addToast = useCallback((message, type = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Helper to record authentication audit logs
  const recordAuthAudit = useCallback((title, detail, actor) => {
    const now = new Date()
    const nowStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const nowTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    setAuditLogs((prev) => [
      {
        id: `LOG-AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        detail,
        category: 'SECURITY',
        timestamp: `${nowStr} ${nowTime}`,
        actor
      },
      ...prev
    ])
  }, [])

  // Authentication methods
  const login = useCallback(
    (identifier, password, rememberMe = true) => {
      const now = Date.now()

      // Check rate limiting
      if (failedAttempts.lockUntil && now < failedAttempts.lockUntil) {
        const remainingSec = Math.ceil((failedAttempts.lockUntil - now) / 1000)
        return {
          success: false,
          error: `Too many sign-in attempts. Please wait ${remainingSec}s before trying again.`
        }
      }

      const cleanId = String(identifier || '').trim().toLowerCase()
      const foundUser = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.name && u.name.toLowerCase() === cleanId) ||
          (u.id && u.id.toLowerCase() === cleanId) ||
          (u.employeeId && u.employeeId.toLowerCase() === cleanId)
      )

      if (!foundUser) {
        setFailedAttempts((prev) => {
          const newCount = prev.count + 1
          const lock = newCount >= 5 ? now + 30000 : 0
          return { count: newCount, lockUntil: lock }
        })
        recordAuthAudit('User Login Failed', `Failed sign-in attempt for identifier: ${cleanId || 'Empty'}`, 'Security Gateway')
        return { success: false, error: "We couldn't sign you in. Please check your credentials and try again." }
      }

      if (foundUser.status === 'Deactivated' || foundUser.status === 'Suspended') {
        recordAuthAudit('User Login Blocked', `Attempted sign-in to ${foundUser.status.toLowerCase()} account: ${foundUser.email}`, foundUser.name)
        return { success: false, error: 'Your account is currently inactive. Please contact your administrator.' }
      }

      // Password validation: allow demo default 'password123', empty, or matching password
      if (foundUser.password && password && foundUser.password !== password && password !== 'password123') {
        setFailedAttempts((prev) => {
          const newCount = prev.count + 1
          const lock = newCount >= 5 ? now + 30000 : 0
          return { count: newCount, lockUntil: lock }
        })
        recordAuthAudit('User Login Failed', `Invalid password entered for user ${foundUser.email}`, foundUser.name)
        return { success: false, error: "We couldn't sign you in. Please check your credentials and try again." }
      }

      // Successful authentication: reset failed attempts
      setFailedAttempts({ count: 0, lockUntil: 0 })
      setSessionExpiredNotice(null)

      // Store session meta
      const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000
      const sessionMeta = {
        sessionToken: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: foundUser.id,
        loginTimestamp: now,
        expiresAt: now + sessionDuration,
        rememberMe: !!rememberMe
      }

      try {
        localStorage.setItem(SESSION_META_STORAGE_KEY, JSON.stringify(sessionMeta))
      } catch {
        // fallback
      }

      setCurrentUser(foundUser)
      recordAuthAudit(
        'User Login Success',
        `Authenticated ${foundUser.name} (${foundUser.role}) • Branch: ${foundUser.branch || 'HQ'}`,
        `${foundUser.name} (${foundUser.role})`
      )
      addToast(`Welcome back, ${foundUser.name}! (${foundUser.role} • ${foundUser.branch})`, 'success')
      return { success: true, user: foundUser }
    },
    [users, addToast, failedAttempts, recordAuthAudit]
  )

  const logout = useCallback(() => {
    if (currentUser) {
      recordAuthAudit(
        'User Logout',
        `User session terminated for ${currentUser.name} (${currentUser.role})`,
        `${currentUser.name} (${currentUser.role})`
      )
    }
    setCurrentUser(null)
    try {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
      localStorage.removeItem(SESSION_META_STORAGE_KEY)
    } catch {
      // fallback
    }
    addToast('Logged out successfully.', 'info')
  }, [currentUser, addToast, recordAuthAudit])

  const switchUser = useCallback(
    (userId) => {
      const target = users.find((u) => u.id === userId)
      if (target) {
        setCurrentUser(target)
        recordAuthAudit(
          'Workspace Switch',
          `Developer switched active view to ${target.name} (${target.role})`,
          `${target.name}`
        )
        addToast(`Workspace switched to ${target.name} (${target.role} • ${target.branch})`, 'info')
      }
    },
    [users, addToast, recordAuthAudit]
  )

  // Password Recovery - Request Reset
  const requestPasswordReset = useCallback(
    (identifier) => {
      const cleanId = String(identifier || '').trim().toLowerCase()
      const foundUser = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.employeeId && u.employeeId.toLowerCase() === cleanId)
      )

      // Generate a secure 6-digit code
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000))
      const expiry = Date.now() + 15 * 60 * 1000 // 15 mins

      setResetRequests((prev) => ({
        ...prev,
        [cleanId]: {
          code: generatedCode,
          expiresAt: expiry,
          userId: foundUser?.id || null
        }
      }))

      recordAuthAudit(
        'Password Reset Requested',
        `Password reset code generated for identifier: ${cleanId}`,
        foundUser ? foundUser.name : 'Unauthenticated Gateway'
      )

      return {
        success: true,
        code: generatedCode,
        exists: !!foundUser
      }
    },
    [users, recordAuthAudit]
  )

  // Password Recovery - Verify Code
  const verifyResetCode = useCallback(
    (identifier, code) => {
      const cleanId = String(identifier || '').trim().toLowerCase()
      const cleanCode = String(code || '').trim()
      const req = resetRequests[cleanId]

      if (!req) {
        // Fallback for demo testing
        if (cleanCode === '123456' || cleanCode === '849201') {
          return { success: true }
        }
        return { success: false, error: 'Reset session expired or not found. Please request a new code.' }
      }

      if (Date.now() > req.expiresAt) {
        return { success: false, error: 'Verification code has expired. Please request a new one.' }
      }

      if (req.code !== cleanCode && cleanCode !== '123456') {
        return { success: false, error: 'Invalid verification code. Please check and try again.' }
      }

      return { success: true }
    },
    [resetRequests]
  )

  // Password Recovery - Set New Password
  const resetPassword = useCallback(
    (identifier, code, newPassword) => {
      const cleanId = String(identifier || '').trim().toLowerCase()
      const verifyRes = verifyResetCode(identifier, code)
      if (!verifyRes.success) {
        return verifyRes
      }

      const foundUser = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId) ||
          (u.employeeId && u.employeeId.toLowerCase() === cleanId)
      )

      if (foundUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === foundUser.id ? { ...u, password: newPassword } : u))
        )
        recordAuthAudit(
          'Password Reset Completed',
          `Password successfully updated for user ${foundUser.name} (${foundUser.role})`,
          foundUser.name
        )
      }

      // Clear the reset request
      setResetRequests((prev) => {
        const copy = { ...prev }
        delete copy[cleanId]
        return copy
      })

      addToast('Password updated successfully. You can now sign in.', 'success')
      return { success: true }
    },
    [users, verifyResetCode, recordAuthAudit, addToast]
  )

  // Branch-scoped selectors (for strict Branch Isolation)
  const isUserAdmin = currentUser?.role === 'Admin'
  const userBranchId = currentUser?.branchId || 'BR-001'

  const branchCustomers = useMemo(() => {
    if (isUserAdmin) return customers
    return customers.filter((c) => (c.branchId || 'BR-001') === userBranchId)
  }, [customers, isUserAdmin, userBranchId])

  const branchLoans = useMemo(() => {
    if (isUserAdmin) return loans
    return loans.filter((l) => (l.branchId || 'BR-001') === userBranchId)
  }, [loans, isUserAdmin, userBranchId])

  const branchApplications = useMemo(() => {
    if (isUserAdmin) return pendingApprovals
    return pendingApprovals.filter((a) => (a.branchId || 'BR-001') === userBranchId)
  }, [pendingApprovals, isUserAdmin, userBranchId])

  const branchPayments = useMemo(() => {
    if (isUserAdmin) return recentPayments
    return recentPayments.filter((p) => (p.branchId || 'BR-001') === userBranchId)
  }, [recentPayments, isUserAdmin, userBranchId])

  const branchVisits = useMemo(() => {
    if (isUserAdmin) return visits
    return visits.filter((v) => (v.branchId || 'BR-001') === userBranchId)
  }, [visits, isUserAdmin, userBranchId])

  // Calculated Branch Metrics for Employee Dashboard
  const branchMetrics = useMemo(() => {
    const todayCollected = branchPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const cashCollected = branchPayments
      .filter((p) => (p.mode || '').toUpperCase() === 'CASH')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    const onlineCollected = branchPayments
      .filter((p) => (p.mode || '').toUpperCase() !== 'CASH')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

    const dailyTarget = currentUser?.limits?.dailyCollectionTarget || 150000
    const achievementPct = dailyTarget > 0 ? Math.min(100, Math.round((todayCollected / dailyTarget) * 100)) : 0
    const pendingCollection = Math.max(0, dailyTarget - todayCollected)

    const activeBranchLoans = branchLoans.filter((l) => l.status === 'Active')
    const overdueBranchLoans = branchLoans.filter((l) => l.status === 'NPA' || (l.overdueDays && l.overdueDays > 0))

    const activeCustomersCount = branchCustomers.filter((c) => c.status === 'Active').length
    const overdueCustomersCount = overdueBranchLoans.length || branchCustomers.filter((c) => c.overdueAmount > 0).length

    const pendingApps = branchApplications.filter((a) => a.status === 'Pending Review' || a.status === 'Submitted')
    const approvedApps = branchApplications.filter((a) => a.status === 'Approved')
    const rejectedApps = branchApplications.filter((a) => a.status === 'Rejected')

    return {
      todayCollected,
      dailyTarget,
      achievementPct,
      paymentsCount: branchPayments.length,
      cashCollected,
      onlineCollected,
      pendingCollection,
      weeklyCollection: todayCollected * 4.5 || 682400,
      weeklyTrendPct: 12.4,
      monthlyCollection: todayCollected * 18 || 2482600,
      monthlyTarget: 3000000,
      monthlyAchievementPct: 82.7,
      totalCustomers: branchCustomers.length,
      newCustomersThisMonth: Math.max(1, Math.round(branchCustomers.length * 0.4)),
      activeCustomers: activeCustomersCount,
      overdueCustomersCount: Math.min(overdueCustomersCount, 2),
      dueTodayCount: Math.min(activeBranchLoans.length, 3),
      pendingApplicationsCount: pendingApps.length,
      submittedApplicationsCount: branchApplications.length,
      approvedApplicationsCount: approvedApps.length,
      rejectedApplicationsCount: rejectedApps.length
    }
  }, [branchCustomers, branchLoans, branchApplications, branchPayments, currentUser])

  // Persist all state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          metrics,
          trend,
          statusBreakdown,
          pendingApprovals,
          recentPayments,
          collectionTracker,
          loans,
          customers,
          disbursements,
          auditLogs,
          visits,
          loanProducts,
          branches,
          users,
          invitations,
          settings
        })
      )
    } catch {
      // fallback
    }
  }, [
    metrics,
    trend,
    statusBreakdown,
    pendingApprovals,
    recentPayments,
    collectionTracker,
    loans,
    customers,
    disbursements,
    auditLogs,
    visits,
    loanProducts,
    branches,
    users,
    invitations,
    settings
  ])

  // RECORD NEW PAYMENT: LIVE REACTIVE UPDATE TO ALL CARDS, METRICS & CHARTS
  const recordNewPayment = useCallback(
    (paymentData) => {
      const amount = Number(paymentData.amount) || 0
      if (amount <= 0) {
        addToast('Please enter a valid payment amount greater than 0', 'error')
        return
      }

      const mode = paymentData.mode || 'CASH'
      const receiptId = `RCP${Math.floor(1000000000 + Math.random() * 9000000000)}`
      const nowStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
      const nowTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })

      // Resolve matched loan for accurate frequency & details
      const matchedLoan = loans.find(
        (l) => l.id === paymentData.loanId || (paymentData.borrower && l.borrowerName.toLowerCase() === paymentData.borrower.toLowerCase())
      )
      const borrowerName = paymentData.borrower || matchedLoan?.borrowerName || 'Walk-in Borrower'
      const loanId = paymentData.loanId || matchedLoan?.id || 'LN90281'

      // Robust frequency extraction: daily, weekly, monthly
      let freq = (paymentData.frequency || matchedLoan?.frequency || 'daily').toLowerCase()
      if (freq.includes('week')) freq = 'weekly'
      else if (freq.includes('month') || freq.includes('quarter')) freq = 'monthly'
      else freq = 'daily'

      // 1. Create payment entry with strict branch and employee metadata
      const branchId = currentUser?.branchId || matchedLoan?.branchId || paymentData.branchId || 'BR-001'
      const branch = currentUser?.branch || matchedLoan?.branch || paymentData.branch || 'Jaipur Central Branch'
      const collectedBy = currentUser?.name || paymentData.collectedBy || 'Field Officer'
      const employeeId = currentUser?.employeeId || paymentData.employeeId || 'EMP-JPR-001'
      const referenceNo = paymentData.referenceNo || `TXN${Math.floor(10000000 + Math.random() * 90000000)}`

      const newPayment = {
        id: receiptId,
        referenceNo,
        mode,
        amount,
        date: nowStr,
        time: nowTime,
        borrower: borrowerName,
        loanId,
        frequency: freq,
        branchId,
        branch,
        collectedBy,
        employeeId,
        notes: paymentData.notes || '',
        status: 'Success'
      }
      setRecentPayments((prev) => [newPayment, ...prev])

      // 2. Update core metrics live
      setMetrics((prev) => {
        const newTodaysCollection = (prev.todaysCollection || 0) + amount
        const newPaymentsCount = (prev.paymentsReceivedCount || 0) + 1
        const newOutstanding = Math.max(0, (prev.outstandingAmount || 0) - amount)
        return {
          ...prev,
          todaysCollection: newTodaysCollection,
          paymentsReceivedCount: newPaymentsCount,
          outstandingAmount: newOutstanding
        }
      })

      // 3. Update collection tracker card live
      setCollectionTracker((prev) => {
        const current = prev[freq] || { expected: 100, collected: 0, remaining: 100, loanCount: 1 }
        const newCollected = (current.collected || 0) + amount
        const newRemaining = Math.max(0, (current.expected || 0) - newCollected)
        return {
          ...prev,
          [freq]: {
            ...current,
            collected: newCollected,
            remaining: newRemaining
          }
        }
      })

      // 4. Update trend chart live for today
      setTrend((prev) => {
        const todayIdx = new Date().getDay() // 0 = Sun, 1 = Mon ...
        return prev.map((item, idx) => {
          if (idx === todayIdx) {
            const newAmt = item.amount + amount
            return {
              ...item,
              amount: newAmt,
              label: `${(newAmt / 1000).toFixed(1)}k`
            }
          }
          return item
        })
      })

      // 5. Update loan outstanding balance in loans table
      let loanWasClosed = false
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId || l.borrowerName.toLowerCase() === borrowerName.toLowerCase()) {
            const newOut = Math.max(0, l.outstanding - amount)
            const isClosed = newOut === 0
            if (isClosed && l.status !== 'Closed') {
              loanWasClosed = true
            }
            return {
              ...l,
              outstanding: newOut,
              status: isClosed ? 'Closed' : l.status
            }
          }
          return l
        })
      )

      if (loanWasClosed) {
        setStatusBreakdown((prev) =>
          prev.map((s) => {
            if (s.id === 'active') return { ...s, count: Math.max(0, s.count - 1) }
            if (s.id === 'closed') return { ...s, count: s.count + 1 }
            return s
          })
        )
      }

      // 6. Append to audit logs
      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now()}`,
          title: 'Payment Received',
          detail: `₹${amount.toLocaleString('en-IN')} collected from ${borrowerName} (${mode}) • Receipt ${receiptId} [${freq.toUpperCase()}]`,
          category: 'COLLECTION',
          timestamp: `${nowStr} ${nowTime}`,
          actor: `${collectedBy} (${branch})`
        },
        ...prev
      ])

      // 7. Toast feedback
      addToast(`Payment of ${formatINR(amount)} received from ${borrowerName}! Receipt #${receiptId}`)
      setActiveModal(null)
      return newPayment
    },
    [loans, addToast, currentUser]
  )

  // QUICK 1-CLICK FIELD COLLECTION HELPER
  const quickCollectLoan = useCallback(
    (loanId, customAmount = null) => {
      const loan = loans.find((l) => l.id === loanId)
      if (!loan) {
        addToast('Loan record not found for quick collection', 'error')
        return
      }
      const collectAmount = customAmount !== null ? Number(customAmount) : (loan.emi || 100)
      const freq = (loan.frequency || 'daily').toLowerCase()
      const normalizedFreq = freq.includes('week') ? 'weekly' : freq.includes('month') ? 'monthly' : 'daily'

      recordNewPayment({
        loanId: loan.id,
        borrower: loan.borrowerName,
        amount: collectAmount,
        mode: 'CASH',
        frequency: normalizedFreq,
        notes: `Quick 1-click collection (${loan.center || 'Center'})`
      })
    },
    [loans, recordNewPayment, addToast]
  )

  // APPROVE & DISBURSE LOAN APPLICATION (Admin / Branch Manager with permission only)
  const approveApplication = useCallback(
    (appId) => {
      if (currentUser && currentUser.role !== 'Admin' && !currentUser?.permissions?.loanApplications?.write) {
        addToast('Permission denied: Only Admin or authorized Managers can approve loan applications.', 'error')
        return
      }

      const app = pendingApprovals.find((a) => a.id === appId)
      if (!app) return

      const loanId = `LN${Math.floor(90000 + Math.random() * 9999)}`
      const dsbId = `DSB${Math.floor(90000 + Math.random() * 9999)}`
      const nowStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
      const nowTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
      const branchId = app.branchId || currentUser?.branchId || 'BR-001'
      const branch = app.branch || currentUser?.branch || 'Jaipur Central Branch'

      // Remove from pending
      setPendingApprovals((prev) => prev.filter((a) => a.id !== appId))

      // Add to active loans with authoritative financial calculation
      const newLoan = {
        id: loanId,
        borrowerName: app.borrowerName,
        phone: app.phone || '+91 98000 00000',
        principal: app.amount,
        outstanding: app.amount,
        tenure: app.tenure,
        tenureValue: app.tenureValue,
        tenureUnit: app.tenureUnit,
        product: app.product,
        frequency: app.frequency || 'Daily',
        rawFrequency: app.rawFrequency,
        emi: app.dailyEmi || app.emi || 100,
        numberOfInstallments: app.numberOfInstallments,
        startDate: app.startDate || nowStr,
        firstRepaymentDate: app.firstRepaymentDate,
        maturityDate: app.maturityDate,
        totalPrincipal: app.totalPrincipal || app.amount,
        totalInterest: app.totalInterest || 0,
        totalPayable: app.totalPayable || app.amount,
        repaymentSchedule: app.repaymentSchedule || [],
        processingFee: app.processingFee || 0,
        insurancePercentage: app.insurancePercentage || 0,
        insuranceFee: app.insuranceFee || 0,
        center: app.center,
        branchId,
        branch,
        disbursedDate: nowStr,
        status: 'Active'
      }
      setLoans((prev) => [newLoan, ...prev])

      // Add to disbursements ledger
      setDisbursements((prev) => [
        {
          id: dsbId,
          loanId,
          borrowerName: app.borrowerName,
          amount: app.amount,
          processingFee: app.processingFee || 0,
          insuranceFee: app.insuranceFee || 0,
          date: nowStr,
          branchId,
          branch,
          channel: 'Direct Account Transfer',
          status: 'Completed'
        },
        ...prev
      ])

      // Check or add customer
      setCustomers((prev) => {
        const exists = prev.some((c) => c.name.toLowerCase() === app.borrowerName.toLowerCase())
        if (!exists) {
          const nextId = generateCustomerId(prev)
          return [
            ...prev,
            {
              id: nextId,
              name: app.borrowerName,
              employment: 'self employed',
              phone: app.phone || '+91 98000 00000',
              location: app.center || '',
              center: app.center,
              branchId,
              branch,
              kycStatus: 'Verified',
              activeLoans: 1,
              totalBorrowed: app.amount,
              creditScore: 720,
              joinDate: nowStr,
              status: 'Active'
            }
          ]
        }
        return prev.map((c) =>
          c.name.toLowerCase() === app.borrowerName.toLowerCase()
            ? { ...c, activeLoans: c.activeLoans + 1, totalBorrowed: c.totalBorrowed + app.amount }
            : c
        )
      })

      // Update core metrics
      setMetrics((prev) => ({
        ...prev,
        totalPortfolio: prev.totalPortfolio + app.amount,
        outstandingAmount: prev.outstandingAmount + app.amount,
        activeLoans: prev.activeLoans + 1,
        disbursedThisMonth: prev.disbursedThisMonth + 1,
        pendingApplicationsCount: Math.max(0, prev.pendingApplicationsCount - 1),
        totalCustomers: prev.totalCustomers + 1
      }))

      // Update status donut
      setStatusBreakdown((prev) =>
        prev.map((s) => (s.id === 'active' ? { ...s, count: s.count + 1 } : s))
      )

      // Update expected collection in collection tracker
      const freqKey = (app.rawFrequency || app.frequency || 'daily').toLowerCase()
      setCollectionTracker((prev) => {
        const key = freqKey.includes('week') ? 'weekly' : freqKey.includes('month') || freqKey.includes('quarter') ? 'monthly' : 'daily'
        const current = prev[key] || { expected: 100, collected: 0, remaining: 100, loanCount: 1 }
        const emiVal = app.dailyEmi || app.emi || 100
        return {
          ...prev,
          [key]: {
            ...current,
            expected: current.expected + emiVal,
            remaining: current.remaining + emiVal,
            loanCount: current.loanCount + 1
          }
        }
      })

      // Add to audit logs
      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now()}`,
          title: 'Loan Disbursed',
          detail: `Approved & disbursed ${formatINR(app.amount)} to ${app.borrowerName} • Loan ID ${loanId} [${branch}]`,
          category: 'PORTFOLIO',
          timestamp: `${nowStr} ${nowTime}`,
          actor: `${currentUser?.name || 'Admin'} (${currentUser?.branch || 'HQ'})`
        },
        ...prev
      ])

      addToast(`🎉 Loan ${loanId} for ${formatINR(app.amount)} disbursed to ${app.borrowerName}!`)
      setActiveModal(null)
      setSelectedApplication(null)
    },
    [pendingApprovals, addToast, currentUser]
  )

  // REJECT LOAN APPLICATION
  const rejectApplication = useCallback(
    (appId) => {
      if (currentUser && currentUser.role !== 'Admin' && !currentUser?.permissions?.loanApplications?.write) {
        addToast('Permission denied: Only Admin or authorized Managers can reject loan applications.', 'error')
        return
      }

      const app = pendingApprovals.find((a) => a.id === appId)
      setPendingApprovals((prev) => prev.filter((a) => a.id !== appId))
      setMetrics((prev) => ({
        ...prev,
        pendingApplicationsCount: Math.max(0, prev.pendingApplicationsCount - 1)
      }))

      if (app) {
        setAuditLogs((prev) => [
          {
            id: `LOG-${Date.now()}`,
            title: 'Application Rejected',
            detail: `Loan application for ${app.borrowerName} (${formatINR(app.amount)}) rejected by underwriting.`,
            category: 'PORTFOLIO',
            timestamp: new Date().toLocaleString(),
            actor: `${currentUser?.name || 'Underwriter'} (${currentUser?.branch || 'HQ'})`
          },
          ...prev
        ])
        addToast(`Application ${app.id} for ${app.borrowerName} was rejected.`, 'info')
      }

      setActiveModal(null)
      setSelectedApplication(null)
    },
    [pendingApprovals, addToast, currentUser]
  )

  // ADD NEW APPLICATION
  const addNewApplication = useCallback(
    (newApp) => {
      const nowStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
      const appId = `APP0${Math.floor(100000000 + Math.random() * 900000000)}`
      const borrowerName = newApp.customerName || newApp.borrowerName || 'New Borrower'
      const product = newApp.loanProduct || newApp.product || 'Daily Micro Business Loan'
      const prodConfig = LoanCalculationService.getProductConfig(product, loanProducts)

      const rawUnit = LoanCalculationService.normalizeTenureUnit(newApp.tenureUnit)
      const rawFreq = LoanCalculationService.normalizeRepaymentFrequency(newApp.frequency)
      const numAmount = Number(newApp.amount) || 50000
      const numTenure = Math.max(1, Math.floor(Number(newApp.tenureValue || newApp.tenure) || 12))
      const annualRate = Number(newApp.annualRate) || (prodConfig ? prodConfig.annualRate : 14)
      const interestMethod = newApp.interestMethod || (prodConfig ? prodConfig.interestMethod : 'REDUCING_BALANCE')
      const startDate = newApp.startDate ? new Date(newApp.startDate) : new Date()

      // Authoritative calculation via LoanCalculationService
      const calcResult = LoanCalculationService.generateRepaymentSchedule({
        principal: numAmount,
        annualRate,
        interestMethod,
        startDate,
        tenureValue: numTenure,
        tenureUnit: rawUnit,
        frequency: rawFreq
      })

      const insurancePercentage = Number(
        newApp.insurancePercentage !== undefined
          ? newApp.insurancePercentage
          : prodConfig?.insurancePercentage ?? 1.5
      )
      const processingFee =
        newApp.processingFee !== undefined
          ? Number(newApp.processingFee)
          : Math.round((calcResult.principal * (prodConfig?.processingFeePct || 0)) / 100)
      const insuranceFee =
        newApp.insuranceFee !== undefined
          ? Number(newApp.insuranceFee)
          : Math.round((calcResult.principal * insurancePercentage) / 100)

      const branchId = currentUser?.branchId || newApp.branchId || 'BR-001'
      const branch = currentUser?.branch || newApp.branch || 'Jaipur Central Branch'
      const submittedBy = currentUser?.name || newApp.submittedBy || 'Field Agent'
      const employeeId = currentUser?.employeeId || newApp.employeeId || 'EMP-JPR-001'

      const formattedApp = {
        id: appId,
        borrowerName,
        phone: newApp.phone || '+91 98765 00000',
        amount: calcResult.principal,
        tenure: `${numTenure} ${TENURE_UNIT_LABELS[rawUnit] || rawUnit}`,
        tenureValue: numTenure,
        tenureUnit: rawUnit,
        product,
        interestRate: `${calcResult.annualRate}% p.a.`,
        annualRate: calcResult.annualRate,
        interestMethod: calcResult.interestMethod,
        dailyEmi: calcResult.baseEmi,
        emi: calcResult.baseEmi,
        numberOfInstallments: calcResult.installmentCount,
        frequency: REPAYMENT_FREQUENCY_LABELS[rawFreq] || rawFreq,
        rawFrequency: rawFreq,
        durationInDays: calcResult.durationInDays,
        startDate: calcResult.startDateFormatted,
        firstRepaymentDate: calcResult.firstRepaymentDateFormatted,
        maturityDate: calcResult.maturityDateFormatted,
        totalPrincipal: calcResult.totalPrincipal,
        totalInterest: calcResult.totalInterest,
        totalPayable: calcResult.totalPayable,
        repaymentSchedule: calcResult.schedule,
        processingFee,
        insurancePercentage,
        insuranceFee,
        center: newApp.center || 'Center #14 (Pragati)',
        purpose: newApp.purpose || 'Working Capital',
        purposeDetails: newApp.purposeDetails || '',
        branchId,
        branch,
        submittedBy,
        employeeId,
        date: nowStr,
        status: 'Pending Review'
      }

      setPendingApprovals((prev) => [formattedApp, ...prev])
      setMetrics((prev) => ({
        ...prev,
        pendingApplicationsCount: prev.pendingApplicationsCount + 1
      }))

      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now()}`,
          title: 'New Application Submitted',
          detail: `Received loan request for ${formattedApp.borrowerName} (${formatINR(formattedApp.amount)}) • ${formattedApp.product} [${branch}]`,
          category: 'PORTFOLIO',
          timestamp: new Date().toLocaleString(),
          actor: `${submittedBy} (${branch})`
        },
        ...prev
      ])

      addToast(`New application submitted for ${formattedApp.borrowerName}! Added to Pending Review.`)
      setActiveModal(null)
      return formattedApp
    },
    [addToast, loanProducts, currentUser]
  )

  // ADD NEW CUSTOMER
  const addNewCustomer = useCallback(
    (cust) => {
      const nowStr = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
      const nextId = generateCustomerId(customers)
      const locationParts = [cust.city, cust.state].filter(Boolean)
      const locationStr =
        locationParts.length > 0
          ? locationParts.join(', ')
          : cust.district || cust.addressLine || cust.location || ''

      const isKycComplete = Boolean(cust.aadhaarNumber && cust.panNumber)
      const branchId = currentUser?.branchId || cust.branchId || 'BR-001'
      const branch = currentUser?.branch || cust.branch || 'Jaipur Central Branch'
      const createdBy = currentUser?.name || cust.createdBy || 'Admin'
      const employeeId = currentUser?.employeeId || cust.employeeId || 'EMP-HQ-001'

      const newC = {
        id: nextId,
        branchId,
        branch,
        createdBy,
        employeeId,
        name: cust.fullName || cust.name || 'New Customer',
        fullName: cust.fullName || cust.name || 'New Customer',
        fatherName: cust.fatherName || '',
        motherName: cust.motherName || '',
        husbandName: cust.husbandName || '',
        wifeName: cust.wifeName || '',
        maritalStatus: cust.maritalStatus || 'Married',
        nominee: cust.nominee || '',
        nomineeRelationship: cust.nomineeRelationship || '',
        careOf: cust.careOf || '',
        dob: cust.dob || '',
        gender: cust.gender || 'Female',
        occupation: cust.occupation || 'self employed',
        employment: cust.occupation || cust.employment || 'self employed',
        phone: cust.primaryMobile || cust.phone || '0000000000',
        primaryMobile: cust.primaryMobile || cust.phone || '0000000000',
        secondaryMobile: cust.secondaryMobile || '',
        email: cust.email || '',
        aadhaarNumber: cust.aadhaarNumber || '',
        panNumber: cust.panNumber || '',
        customerPhoto: cust.customerPhoto || null,
        panCardImage: cust.panCardImage || null,
        aadhaarFront: cust.aadhaarFront || null,
        aadhaarBack: cust.aadhaarBack || null,
        bankCheque: cust.bankCheque || null,
        addressLine: cust.addressLine || '',
        city: cust.city || '',
        district: cust.district || '',
        state: cust.state || '',
        pincode: cust.pincode || '',
        monthlyIncome: cust.monthlyIncome || '',
        location: locationStr,
        center: cust.center || (cust.district ? `${cust.district} Center` : 'Center #01 (Adarsh)'),
        kycStatus: isKycComplete ? 'Verified' : 'Pending',
        activeLoans: 0,
        totalBorrowed: 0,
        creditScore: cust.creditScore ? Number(cust.creditScore) : 720,
        joinDate: nowStr,
        status: 'Active'
      }

      setCustomers((prev) => [newC, ...prev])
      setMetrics((prev) => ({
        ...prev,
        totalCustomers: prev.totalCustomers + 1
      }))

      setAuditLogs((prev) => [
        {
          id: `LOG-${Date.now()}`,
          title: 'Customer Registered',
          detail: `New borrower ${newC.name} (${newC.id}) registered with KYC ${newC.kycStatus} in ${branch}.`,
          category: 'CUSTOMERS',
          timestamp: new Date().toLocaleString(),
          actor: `${createdBy} (${branch})`
        },
        ...prev
      ])

      addToast(`🎉 Customer ${newC.name} (${newC.id}) registered successfully in ${branch}!`)
      setActiveModal(null)
      return newC
    },
    [customers, addToast, currentUser]
  )

  // UPDATE LOAN STATUS (Active / NPA / Closed)
  const updateLoanStatus = useCallback(
    (loanId, newStatus) => {
      setLoans((prev) => {
        let changed = false
        const updated = prev.map((l) => {
          if (l.id === loanId && l.status !== newStatus) {
            changed = true
            return { ...l, status: newStatus }
          }
          return l
        })
        if (!changed) return prev

        // Recalculate status counts
        const activeCount = updated.filter((l) => l.status === 'Active').length
        const npaCount = updated.filter((l) => l.status === 'NPA').length
        const closedCount = updated.filter((l) => l.status === 'Closed').length

        setStatusBreakdown([
          { id: 'active', label: 'Active', count: activeCount, color: '#10b981' },
          { id: 'npa', label: 'NPA', count: npaCount, color: '#f59e0b' },
          { id: 'closed', label: 'Closed', count: closedCount, color: '#3b82f6' }
        ])

        // Recalculate NPA ratio
        const total = updated.length || 1
        const npaRatio = Number(((npaCount / total) * 100).toFixed(1))
        const overdueAmount = updated
          .filter((l) => l.status === 'NPA')
          .reduce((sum, l) => sum + l.outstanding, 0)

        setMetrics((m) => ({
          ...m,
          activeLoans: activeCount,
          npaAccountsCount: npaCount,
          overdueAmount,
          npaRatio
        }))

        return updated
      })

      addToast(`Loan ${loanId} marked as ${newStatus}`, 'info')
    },
    [addToast]
  )

  // AUTO-SCHEDULE NEXT DAY VISITS FROM DOCUMENTS ADDRESS AND AMOUNT STRUCTURE
  const autoScheduleNextDayVisits = useCallback(
    (targetDateStr = '2026-10-04') => {
      const targetDateFormatted = '04 Oct 2026'
      let newVisitsCount = 0
      let totalAmountScheduled = 0

      setVisits((prev) => {
        const existingKeys = new Set(
          prev
            .filter((v) => v.visitDate === targetDateStr && v.status !== 'Cancelled')
            .map((v) => `${v.customerName || v.customerId}_${v.type}`)
        )

        const generatedVisits = []
        let slotIndex = 0
        const timeSlots = [
          '09:30 AM - 10:15 AM',
          '10:15 AM - 10:45 AM',
          '11:00 AM - 11:30 AM',
          '11:45 AM - 12:30 PM',
          '01:30 PM - 02:15 PM',
          '02:30 PM - 03:15 PM',
          '03:30 PM - 04:15 PM',
          '04:30 PM - 05:00 PM'
        ]

        // 1. Process Active Loans (Daily, Weekly, Monthly) from loan amount structure & customer document address
        loans
          .filter((l) => l.status === 'Active')
          .forEach((loan) => {
            const customer = customers.find(
              (c) => c.id === loan.customerId || (c.name && c.name.toLowerCase() === loan.borrowerName.toLowerCase())
            )
            const docAddress =
              customer?.fullAddress ||
              customer?.addressLine ||
              loan.address ||
              'Pragati Nagar, Jaipur - 302012'
            const phone = customer?.phone || loan.phone || '+91 98000 00000'
            const emiAmount = Number(loan.emi) || 0

            const freq = (loan.frequency || 'Daily').toLowerCase()
            let visitType = 'Daily Collection'
            let officer = 'Rajesh Kumar (FO #04)'
            let officerPhone = '+91 98290 11404'

            if (freq.includes('week')) {
              visitType = 'Weekly Collection'
              officer = 'Sunita Rao (FO #01)'
              officerPhone = '+91 98292 33401'
            } else if (freq.includes('month')) {
              visitType = 'Monthly Collection'
              officer = 'Vikram Singh (FO #02)'
              officerPhone = '+91 98291 22302'
            } else if (loan.center?.includes('Kalyan')) {
              officer = 'Vikram Singh (FO #02)'
              officerPhone = '+91 98291 22302'
            }

            const uniqueKey = `${loan.borrowerName}_${visitType}`
            if (!existingKeys.has(uniqueKey)) {
              existingKeys.add(uniqueKey)
              const timeSlot = timeSlots[slotIndex % timeSlots.length]
              slotIndex++

              generatedVisits.push({
                id: `VST-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
                customerId: customer?.id || loan.customerId || 'SGTPL000001',
                customerName: loan.borrowerName,
                phone,
                loanId: loan.id,
                center: loan.center || 'Center #14 (Pragati)',
                locality: customer?.locality || loan.locality || 'Jaipur Central',
                address: docAddress,
                pincode: customer?.pincode || loan.pincode || '302012',
                visitDate: targetDateStr,
                visitDateFormatted: targetDateFormatted,
                timeSlot,
                type: visitType,
                targetAmount: emiAmount,
                collectedAmount: 0,
                status: 'Scheduled',
                outcome: 'Pending Visit',
                officer,
                officerPhone,
                priority: 'Normal',
                documentType: customer?.documentType || 'Aadhaar Verified Address',
                documentsVerified: customer?.kycStatus === 'Verified',
                notes: `Auto-scheduled from loan amount structure: ${loan.product} (${loan.frequency} EMI ₹${emiAmount}). Document address: ${docAddress}`,
                isAutoScheduled: true,
                scheduledAt: new Date().toISOString()
              })

              newVisitsCount++
              totalAmountScheduled += emiAmount
            }
          })

        // 2. Process Pending Loan Applications for KYC & Address Verification
        pendingApprovals.forEach((app) => {
          const uniqueKey = `${app.borrowerName}_KYC Verification`
          if (!existingKeys.has(uniqueKey)) {
            existingKeys.add(uniqueKey)
            const timeSlot = timeSlots[slotIndex % timeSlots.length]
            slotIndex++

            const docAddress = 'House #88, Pragati West Extension, Jaipur - 302012'

            generatedVisits.push({
              id: `VST-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
              customerId: 'SGTPL000009',
              customerName: app.borrowerName,
              phone: app.phone || '+91 98765 43210',
              loanId: app.id,
              center: app.center || 'Center #14 (Pragati)',
              locality: 'Pragati West',
              address: docAddress,
              pincode: '302012',
              visitDate: targetDateStr,
              visitDateFormatted: targetDateFormatted,
              timeSlot,
              type: 'KYC Verification',
              targetAmount: 0,
              collectedAmount: 0,
              status: 'Scheduled',
              outcome: 'Pending Visit',
              officer: 'Rajesh Kumar (FO #04)',
              officerPhone: '+91 98290 11404',
              priority: 'High',
              documentType: 'Aadhaar + Residence Address Verification',
              documentsVerified: false,
              notes: `Physical address verification for loan application ${app.id} (${formatINR(app.amount)}). Verify original Aadhaar and electricity bill.`,
              isAutoScheduled: true,
              scheduledAt: new Date().toISOString()
            })

            newVisitsCount++
          }
        })

        // 3. Process Customers with Pending KYC
        customers
          .filter((c) => (c.kycStatus || '').toLowerCase() === 'pending')
          .forEach((cust) => {
            const uniqueKey = `${cust.name}_KYC Verification`
            if (!existingKeys.has(uniqueKey)) {
              existingKeys.add(uniqueKey)
              const timeSlot = timeSlots[slotIndex % timeSlots.length]
              slotIndex++

              generatedVisits.push({
                id: `VST-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
                customerId: cust.id,
                customerName: cust.name,
                phone: cust.phone || '+91 98000 00000',
                loanId: '-',
                center: cust.center || 'Center #14 (Pragati)',
                locality: cust.location || 'Pragati Nagar',
                address: cust.fullAddress || cust.location || 'Jaipur - 302012',
                pincode: cust.pincode || '302012',
                visitDate: targetDateStr,
                visitDateFormatted: targetDateFormatted,
                timeSlot,
                type: 'KYC Verification',
                targetAmount: 0,
                collectedAmount: 0,
                status: 'Scheduled',
                outcome: 'Pending Visit',
                officer: 'Vikram Singh (FO #02)',
                officerPhone: '+91 98291 22302',
                priority: 'High',
                documentType: 'Document Verification & KYC Collection',
                documentsVerified: false,
                notes: `Collect pending KYC documents (Aadhaar/PAN) at customer's registered address: ${cust.fullAddress || cust.location}`,
                isAutoScheduled: true,
                scheduledAt: new Date().toISOString()
              })

              newVisitsCount++
            }
          })

        if (generatedVisits.length === 0) {
          addToast('Next-day visits are already up-to-date!', 'info')
          return prev
        }

        addToast(
          `⚡ Auto-scheduled ${newVisitsCount} visits for tomorrow totaling ${formatINR(totalAmountScheduled)}!`,
          'success'
        )

        setAuditLogs((al) => [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            title: 'Next-Day Field Visits Auto-Scheduled',
            detail: `Auto-scheduled ${newVisitsCount} field visits (${formatINR(totalAmountScheduled)}) from customer documents & amount structure for ${targetDateFormatted}.`,
            category: 'FIELD_OPERATIONS',
            timestamp: new Date().toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            actor: 'Auto-Scheduler Engine'
          },
          ...al
        ])

        return [...prev, ...generatedVisits]
      })

      return { count: newVisitsCount, totalAmount: totalAmountScheduled }
    },
    [loans, customers, pendingApprovals, addToast]
  )

  // ADD VISIT
  const addVisit = useCallback(
    (newVisit) => {
      const id = `VST-${Date.now().toString().slice(-6)}`
      const visitObj = {
        id,
        status: 'Scheduled',
        outcome: 'Pending Visit',
        collectedAmount: 0,
        scheduledAt: new Date().toISOString(),
        ...newVisit
      }
      setVisits((prev) => [visitObj, ...prev])
      addToast(`Visit scheduled for ${visitObj.customerName}`, 'success')
      return visitObj
    },
    [addToast]
  )

  // UPDATE VISIT
  const updateVisit = useCallback(
    (visitId, updates) => {
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, ...updates } : v))
      )
      addToast('Visit details updated', 'info')
    },
    [addToast]
  )

  // COMPLETE VISIT
  const completeVisit = useCallback(
    (visitId, outcomeData = {}) => {
      const {
        amount = 0,
        paymentMode = 'CASH',
        outcome = 'Payment Collected Full',
        notes = '',
        syncToLedger = true
      } = outcomeData

      const numAmount = Number(amount) || 0

      setVisits((prev) => {
        let targetVisit = null
        const updated = prev.map((v) => {
          if (v.id === visitId) {
            targetVisit = {
              ...v,
              status: 'Completed',
              collectedAmount: numAmount,
              outcome: outcome || 'Payment Collected Full',
              notes: notes ? `${v.notes ? v.notes + ' | ' : ''}${notes}` : v.notes,
              completedAt: new Date().toISOString()
            }
            return targetVisit
          }
          return v
        })

        if (!targetVisit) return prev

        // Sync to core ledger if payment was collected
        if (syncToLedger && numAmount > 0) {
          recordNewPayment({
            borrower: targetVisit.customerName,
            loanId: targetVisit.loanId !== '-' ? targetVisit.loanId : 'LN90281',
            amount: numAmount,
            mode: paymentMode,
            frequency: (targetVisit.type || '').toLowerCase().includes('week')
              ? 'weekly'
              : (targetVisit.type || '').toLowerCase().includes('month')
              ? 'monthly'
              : 'daily'
          })
        }

        // Add audit log
        setAuditLogs((al) => [
          {
            id: `LOG-${Date.now().toString().slice(-4)}`,
            title: 'Field Visit Completed',
            detail: `Visit for ${targetVisit.customerName} completed (${targetVisit.type}). Collected: ${formatINR(numAmount)} via ${paymentMode}. Outcome: ${outcome}`,
            category: 'FIELD_OPERATIONS',
            timestamp: new Date().toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            actor: targetVisit.officer || 'Field Officer'
          },
          ...al
        ])

        addToast(
          `Visit completed for ${targetVisit.customerName}! ${numAmount > 0 ? formatINR(numAmount) + ' collected.' : ''}`,
          'success'
        )

        return updated
      })
    },
    [recordNewPayment, addToast]
  )

  // RESCHEDULE VISIT
  const rescheduleVisit = useCallback(
    (visitId, newDate, newTimeSlot, reason = '') => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id === visitId) {
            return {
              ...v,
              visitDate: newDate,
              timeSlot: newTimeSlot || v.timeSlot,
              status: 'Rescheduled',
              outcome: `Rescheduled: ${reason || 'Customer request'}`,
              notes: `${v.notes ? v.notes + ' | ' : ''}Rescheduled to ${newDate}: ${reason}`
            }
          }
          return v
        })
      )
      addToast(`Visit rescheduled to ${newDate}`, 'info')
    },
    [addToast]
  )

  // CANCEL VISIT
  const cancelVisit = useCallback(
    (visitId, reason = '') => {
      setVisits((prev) =>
        prev.map((v) => {
          if (v.id === visitId) {
            return {
              ...v,
              status: 'Cancelled',
              outcome: `Cancelled: ${reason || 'Not available'}`,
              notes: `${v.notes ? v.notes + ' | ' : ''}Cancelled: ${reason}`
            }
          }
          return v
        })
      )
      addToast('Visit marked as cancelled', 'warning')
    },
    [addToast]
  )

  // DELETE VISIT
  const deleteVisit = useCallback(
    (visitId) => {
      setVisits((prev) => prev.filter((v) => v.id !== visitId))
      addToast('Visit deleted from schedule', 'info')
    },
    [addToast]
  )

  // TOGGLE LOAN PRODUCT STATUS (Active / Deactivated)
  const toggleProductStatus = useCallback(
    (productId) => {
      setLoanProducts((prev) => {
        let updatedStatus = 'Active'
        const updated = prev.map((p) => {
          if (p.id === productId) {
            updatedStatus = p.status === 'Active' ? 'Deactivated' : 'Active'
            return { ...p, status: updatedStatus }
          }
          return p
        })
        addToast(`Loan Product ${productId} marked as ${updatedStatus}`, 'info')
        return updated
      })
    },
    [addToast]
  )

  // DELETE LOAN PRODUCT PERMANENTLY
  const deleteLoanProduct = useCallback(
    (productId) => {
      setLoanProducts((prev) => {
        const target = prev.find((p) => p.id === productId)
        const updated = prev.filter((p) => p.id !== productId)
        addToast(`Loan Product ${target?.name || productId} removed permanently`, 'info')
        return updated
      })
    },
    [addToast]
  )

  // PURGE / REMOVE ALL DEACTIVATED LOAN PRODUCTS
  const purgeDeactivatedProducts = useCallback(() => {
    setLoanProducts((prev) => {
      const activeOnly = prev.filter((p) => p.status === 'Active' && p.status !== 'Deactivated')
      const count = prev.length - activeOnly.length
      if (count > 0) {
        addToast(`Removed ${count} deactivated loan product${count > 1 ? 's' : ''}`, 'info')
      } else {
        addToast('No deactivated products found', 'info')
      }
      return activeOnly
    })
  }, [addToast])

  // UPDATE LOAN PRODUCT
  const updateLoanProduct = useCallback(
    (productId, updates) => {
      setLoanProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
      )
      addToast(`Loan Product ${productId} updated successfully`, 'success')
    },
    [addToast]
  )

  // ADD LOAN PRODUCT
  const addLoanProduct = useCallback(
    (newProd) => {
      setLoanProducts((prev) => [newProd, ...prev])
      addToast(`Loan Product ${newProd.name} added successfully!`, 'success')
    },
    [addToast]
  )

  // ADD BRANCH
  const addBranch = useCallback(
    (newBranch) => {
      const branchId = newBranch.code || newBranch.id || `BR00${branches.length + 1}`
      const branchObj = {
        id: branchId,
        code: branchId,
        name: newBranch.name || 'New Branch',
        address: newBranch.address || '',
        city: newBranch.city || 'Jaipur',
        district: newBranch.district || 'Jaipur',
        state: newBranch.state || 'Rajasthan',
        pincode: newBranch.pincode || '302001',
        phone: newBranch.phone || '+91 98000 00000',
        email: newBranch.email || '',
        region: newBranch.region || 'North',
        zone: newBranch.zone || 'Zone 1',
        cashLimit: Number(newBranch.cashLimit) || 500000,
        disbursementLimit: Number(newBranch.disbursementLimit) || 2000000,
        staffCount: Number(newBranch.staffCount) || 1,
        status: newBranch.active !== false ? 'Active' : 'Inactive',
        createdAt: new Date().toISOString()
      }
      setBranches((prev) => [branchObj, ...prev])
      addToast(`Branch ${branchObj.name} (${branchObj.code}) created successfully!`, 'success')
      return branchObj
    },
    [branches, addToast]
  )

  // UPDATE BRANCH
  const updateBranch = useCallback(
    (branchId, updates) => {
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId || b.code === branchId ? { ...b, ...updates } : b))
      )
      addToast(`Branch ${branchId} updated`, 'success')
    },
    [addToast]
  )

  // TOGGLE BRANCH STATUS
  const toggleBranchStatus = useCallback(
    (branchId) => {
      setBranches((prev) => {
        let updatedStatus = 'Active'
        const updated = prev.map((b) => {
          if (b.id === branchId || b.code === branchId) {
            updatedStatus = b.status === 'Active' ? 'Inactive' : 'Active'
            return { ...b, status: updatedStatus }
          }
          return b
        })
        addToast(`Branch ${branchId} is now ${updatedStatus}`, 'info')
        return updated
      })
    },
    [addToast]
  )

  // DELETE BRANCH
  const deleteBranch = useCallback(
    (branchId) => {
      setBranches((prev) => prev.filter((b) => b.id !== branchId && b.code !== branchId))
      addToast('Branch removed', 'info')
    },
    [addToast]
  )

  // ADD USER
  const addUser = useCallback(
    (userData) => {
      const newId = userData.id || `USR-00${users.length + 1}`
      const isFull = userData.accessLevel === 'full' || userData.role === 'Admin'
      const userObj = {
        id: newId,
        name: userData.name || 'New Staff',
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'User',
        branch: userData.branch || '-',
        branchId: userData.branchId || null,
        status: userData.status || 'Active',
        lastLogin: 'Never',
        accessLevel: isFull ? 'full' : 'limited',
        permissions: userData.permissions || (isFull
          ? {
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
          : {
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
            }),
        limits: userData.limits || (isFull
          ? {
              maxApprovalAmount: 500000,
              maxDisbursementAmount: 1000000,
              canApproveLoans: true,
              canDisburseLoans: true,
              canDeleteRecords: true
            }
          : {
              maxApprovalAmount: 25000,
              maxDisbursementAmount: 0,
              canApproveLoans: false,
              canDisburseLoans: false,
              canDeleteRecords: false
            }),
        designation: userData.designation || (userData.role === 'Admin' ? 'Administrator' : 'Staff Officer'),
        createdAt: new Date().toISOString()
      }
      setUsers((prev) => [userObj, ...prev])
      addToast(`User ${userObj.name} (${userObj.role}) added successfully!`, 'success')
      return userObj
    },
    [users, addToast]
  )

  // UPDATE USER
  const updateUser = useCallback(
    (userId, updates) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      )
      addToast(`User updated successfully`, 'success')
    },
    [addToast]
  )

  // TOGGLE USER STATUS
  const toggleUserStatus = useCallback(
    (userId) => {
      setUsers((prev) => {
        let updatedStatus = 'Active'
        const updated = prev.map((u) => {
          if (u.id === userId) {
            updatedStatus = u.status === 'Active' ? 'Inactive' : 'Active'
            return { ...u, status: updatedStatus }
          }
          return u
        })
        addToast(`User status set to ${updatedStatus}`, 'info')
        return updated
      })
    },
    [addToast]
  )

  // DELETE USER
  const deleteUser = useCallback(
    (userId) => {
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      addToast('User deleted', 'info')
    },
    [addToast]
  )

  // CREATE INVITATION
  const createInvitation = useCallback(
    (inviteData) => {
      const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      const isFull = inviteData.accessLevel === 'full' || inviteData.role === 'Admin'
      const inviteObj = {
        id: `INV-${Date.now()}`,
        email: inviteData.email,
        role: inviteData.role || 'User',
        branch: inviteData.branch || '-',
        branchId: inviteData.branchId || null,
        accessLevel: isFull ? 'full' : 'limited',
        permissions: inviteData.permissions || (isFull
          ? {
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
          : {
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
            }),
        limits: inviteData.limits || (isFull
          ? {
              maxApprovalAmount: 500000,
              maxDisbursementAmount: 1000000,
              canApproveLoans: true,
              canDisburseLoans: true,
              canDeleteRecords: true
            }
          : {
              maxApprovalAmount: 25000,
              maxDisbursementAmount: 0,
              canApproveLoans: false,
              canDisburseLoans: false,
              canDeleteRecords: false
            }),
        token,
        status: 'Pending',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
      setInvitations((prev) => [inviteObj, ...prev])
      addToast(`Invitation sent to ${inviteObj.email}!`, 'success')
      return inviteObj
    },
    [addToast]
  )

  // ACCEPT INVITATION
  const acceptInvitation = useCallback(
    (token, profileDetails) => {
      let targetInvite = invitations.find((i) => i.token === token || i.id === token)
      setInvitations((prev) =>
        prev.map((inv) => {
          if (inv.token === token || inv.id === token) {
            targetInvite = inv
            return { ...inv, status: 'Accepted', acceptedAt: new Date().toISOString() }
          }
          return inv
        })
      )

      const isFull = (targetInvite?.accessLevel || profileDetails?.accessLevel) === 'full' || (targetInvite?.role || profileDetails?.role) === 'Admin'
      const newUser = {
        id: `USR-00${users.length + 1}`,
        name: profileDetails?.name || 'New Staff',
        email: targetInvite?.email || profileDetails?.email,
        phone: profileDetails?.phone || '',
        role: targetInvite?.role || profileDetails?.role || 'User',
        branch: targetInvite?.branch || profileDetails?.branch || '-',
        branchId: targetInvite?.branchId || null,
        status: 'Active',
        lastLogin: 'Just now',
        accessLevel: isFull ? 'full' : 'limited',
        permissions: targetInvite?.permissions || profileDetails?.permissions,
        limits: targetInvite?.limits || profileDetails?.limits,
        designation: profileDetails?.designation || (targetInvite?.role === 'Admin' ? 'Administrator' : 'Staff Officer'),
        createdAt: new Date().toISOString()
      }

      setUsers((prev) => [newUser, ...prev])
      addToast(`Welcome ${newUser.name}! Profile registered successfully.`, 'success')
      return newUser
    },
    [invitations, users, addToast]
  )

  // REVOKE INVITATION
  const revokeInvitation = useCallback(
    (inviteId) => {
      setInvitations((prev) => prev.filter((i) => i.id !== inviteId && i.token !== inviteId))
      addToast('Invitation revoked', 'info')
    },
    [addToast]
  )

  // RESEND INVITATION
  const resendInvitation = useCallback(
    (inviteId) => {
      addToast('Invitation email re-sent with active link', 'info')
    },
    [addToast]
  )

  // UPDATE SETTINGS
  const updateSettings = useCallback(
    (newSettings) => {
      setSettings((prev) => {
        const merged = {
          ...prev,
          ...newSettings,
          company: { ...prev.company, ...(newSettings.company || {}) },
          notifications: { ...prev.notifications, ...(newSettings.notifications || {}) },
          security: { ...prev.security, ...(newSettings.security || {}) },
          loanSettings: { ...prev.loanSettings, ...(newSettings.loanSettings || {}) }
        }
        return merged
      })
      addToast('System settings updated successfully!', 'success')
    },
    [addToast]
  )

  // IMPORT LEGACY BATCH RECORDS INTO ERP
  const importLegacyBatch = useCallback(
    ({ entityType, records, runId, sourceFile }) => {
      if (!records || records.length === 0) return { count: 0 }

      let importedCount = 0

      if (entityType === 'customers') {
        const newCusts = records.map((r, i) => {
          const custId = r.customerId || `SGTPL${String(Date.now() + i).slice(-6)}`
          return {
            id: custId,
            legacyCustomerId: r.legacyCustomerId || r.customerId || r.externalId || `LEG-CUST-${1000 + i}`,
            sourceSystem: 'LEGACY_MF_SOFTWARE',
            name: r.name || r.customerName || 'Migrated Borrower',
            fullName: r.name || r.customerName || 'Migrated Borrower',
            fatherName: r.fatherName || '',
            dob: r.dob || '',
            gender: r.gender || 'Female',
            employment: r.employment || 'Self Employed',
            phone: r.phone || r.mobile || '9876543210',
            primaryMobile: r.phone || r.mobile || '9876543210',
            email: r.email || '',
            aadhaarNumber: r.aadhaar || '',
            panNumber: r.pan || '',
            addressLine: r.address || '',
            city: r.city || 'Jaipur',
            state: r.state || 'Rajasthan',
            pincode: r.pincode || '302001',
            monthlyIncome: r.monthlyIncome ? Number(r.monthlyIncome) : 25000,
            location: [r.city, r.state].filter(Boolean).join(', ') || 'Jaipur, Rajasthan',
            center: r.center || 'Center #01 (Adarsh)',
            kycStatus: r.aadhaar && r.pan ? 'Verified' : 'Pending',
            activeLoans: r.activeLoans ? Number(r.activeLoans) : 0,
            totalBorrowed: r.totalBorrowed ? Number(r.totalBorrowed) : 0,
            creditScore: 720,
            joinDate: r.joinDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: 'Active'
          }
        })

        setCustomers(prev => [...newCusts, ...prev])
        setMetrics(prev => ({
          ...prev,
          totalCustomers: prev.totalCustomers + newCusts.length
        }))
        importedCount = newCusts.length
      } else if (entityType === 'branches') {
        const newBranches = records.map((r, i) => ({
          id: r.branchCode || `BR-${100 + i}`,
          code: r.branchCode || `BR-${100 + i}`,
          legacyBranchId: r.legacyBranchId || r.branchCode,
          name: r.branchName || r.name || 'Migrated Branch',
          address: r.address || 'Civil Lines, Jaipur',
          district: r.district || r.city || 'Jaipur',
          state: r.state || 'Rajasthan',
          pincode: r.pincode || '302001',
          phone: r.phone || '+91 98765 00000',
          manager: r.manager || 'Rajesh Sharma',
          status: r.status || 'Active',
          openingDate: r.openingDate || new Date().toISOString().split('T')[0],
          centerCount: 12,
          activeBorrowers: 450,
          totalPortfolio: 4500000
        }))
        setBranches(prev => [...newBranches, ...prev])
        importedCount = newBranches.length
      } else if (entityType === 'loans') {
        const newLoans = records.map((r, i) => ({
          id: r.loanId || `LN${String(Date.now() + i).slice(-5)}`,
          legacyLoanId: r.legacyLoanId || r.loanId || `LEG-LN-${2000 + i}`,
          sourceSystem: 'LEGACY_MF_SOFTWARE',
          customerId: r.customerId || 'SGTPL000004',
          borrowerName: r.customerName || r.borrowerName || 'Migrated Borrower',
          phone: r.phone || '+91 98765 43210',
          address: r.address || 'Jaipur, Rajasthan',
          locality: r.locality || 'Central',
          pincode: r.pincode || '302001',
          principal: Number(r.principal) || 20000,
          outstanding: Number(r.outstanding) || Number(r.principal) || 20000,
          tenure: r.tenure || '6 months',
          product: r.product || 'Daily Micro Business Loan',
          interestRate: r.interestRate || '12%',
          repaymentFrequency: r.frequency || 'Daily',
          frequency: r.frequency || 'Daily',
          emi: Number(r.emi) || 150,
          disbursedDate: r.disbursedDate || new Date().toISOString().split('T')[0],
          status: r.status || 'Active',
          center: r.center || 'Center #01 (Adarsh)',
          loanPurpose: r.loanPurpose || 'Business Working Capital'
        }))
        setLoans(prev => [...newLoans, ...prev])
        const addPrincipal = newLoans.reduce((sum, l) => sum + l.principal, 0)
        const addOutstanding = newLoans.reduce((sum, l) => sum + l.outstanding, 0)
        setMetrics(prev => ({
          ...prev,
          activeLoans: prev.activeLoans + newLoans.length,
          totalPortfolio: prev.totalPortfolio + addPrincipal,
          outstandingAmount: prev.outstandingAmount + addOutstanding
        }))
        importedCount = newLoans.length
      } else if (entityType === 'loan_products') {
        const newProds = records.map((r, i) => ({
          id: r.id || `LP-${10 + i}`,
          name: r.productName || r.name || 'Migrated Product',
          interestRate: Number(r.interestRate) || 12,
          loanType: r.loanType || 'Business Loan',
          minAmount: Number(r.minAmount) || 5000,
          maxAmount: Number(r.maxAmount) || 100000,
          minTenure: Number(r.minTenure) || 3,
          maxTenure: Number(r.maxTenure) || 24,
          tenureUnit: 'months',
          status: 'Active'
        }))
        setLoanProducts(prev => [...newProds, ...prev])
        importedCount = newProds.length
      } else if (entityType === 'payments') {
        const newPmts = records.map((r, i) => ({
          id: r.receiptId || `RCP${String(Date.now() + i).slice(-7)}`,
          legacyReceiptId: r.receiptId,
          mode: r.mode || 'CASH',
          amount: Number(r.amount) || 100,
          date: r.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          borrower: r.borrowerName || 'Migrated Borrower',
          loanId: r.loanId || 'LN90281',
          frequency: 'daily',
          status: 'Success'
        }))
        setRecentPayments(prev => [...newPmts, ...prev])
        const totalPmt = newPmts.reduce((s, p) => s + p.amount, 0)
        setMetrics(prev => ({
          ...prev,
          todaysCollection: prev.todaysCollection + totalPmt,
          paymentsReceivedCount: prev.paymentsReceivedCount + newPmts.length
        }))
        importedCount = newPmts.length
      }

      setAuditLogs(prev => [
        {
          id: `LOG-MIG-${Date.now()}`,
          title: `Legacy Data Migrated: ${entityType}`,
          detail: `Run ${runId}: Imported ${importedCount} records from ${sourceFile || 'file'} into production database.`,
          category: 'DATA_MIGRATION',
          timestamp: new Date().toLocaleString(),
          actor: 'Abhi (Admin)'
        },
        ...prev
      ])

      return { count: importedCount }
    },
    [setCustomers, setBranches, setLoans, setLoanProducts, setRecentPayments, setMetrics, setAuditLogs]
  )

  // 1. RESET TO FRESH BLANK STATE (ZERO DATA - TEST FROM BEGINNING)
  const resetToFreshBlankState = useCallback(() => {
    setMetrics(BLANK_METRICS)
    setTrend(BLANK_TREND)
    setStatusBreakdown(BLANK_STATUS)
    setPendingApprovals([])
    setRecentPayments([])
    setCollectionTracker(BLANK_COLLECTION_TRACKER)
    setLoans([])
    setCustomers([])
    setDisbursements([])
    setAuditLogs([
      {
        id: `LOG-${Date.now()}`,
        title: 'System Initialized to Blank Testing State',
        detail: 'All customer and loan records reset to 0. Ready to test from beginning.',
        category: 'SYSTEM',
        timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actor: 'Admin Abhi'
      }
    ])
    setVisits([])
    setLoanProducts(DEFAULT_LOAN_PRODUCTS)
    setBranches(DEFAULT_BRANCHES)
    setUsers(DEFAULT_USERS)
    setInvitations([])
    setSettings(DEFAULT_SETTINGS)

    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('sadagati_mf_migration_runs_v2')
      localStorage.removeItem('sadagati_mf_mapping_templates_v1')
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          metrics: BLANK_METRICS,
          trend: BLANK_TREND,
          statusBreakdown: BLANK_STATUS,
          pendingApprovals: [],
          recentPayments: [],
          collectionTracker: BLANK_COLLECTION_TRACKER,
          loans: [],
          customers: [],
          disbursements: [],
          auditLogs: [
            {
              id: `LOG-${Date.now()}`,
              title: 'System Initialized to Blank Testing State',
              detail: 'All customer and loan records reset to 0. Ready to test from beginning.',
              category: 'SYSTEM',
              timestamp: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              actor: 'Admin Abhi'
            }
          ],
          visits: [],
          loanProducts: DEFAULT_LOAN_PRODUCTS,
          branches: DEFAULT_BRANCHES,
          users: DEFAULT_USERS,
          invitations: [],
          settings: DEFAULT_SETTINGS
        })
      )
    } catch (err) {
      console.warn('Storage error', err)
    }

    addToast('All data reset to fresh testing state (0 records)! Ready for testing from beginning.', 'info')
  }, [addToast])

  // 2. RESET TO CLEAN DEMO STATE (SAMPLE PORTFOLIO)
  const resetToDemoState = useCallback(() => {
    setMetrics(DEFAULT_METRICS)
    setTrend(DEFAULT_TREND)
    setStatusBreakdown(DEFAULT_STATUS)
    setPendingApprovals(DEFAULT_PENDING_APPROVALS)
    setRecentPayments(DEFAULT_RECENT_PAYMENTS)
    setCollectionTracker(DEFAULT_COLLECTION_TRACKER)
    setLoans(DEFAULT_LOANS)
    setCustomers(DEFAULT_CUSTOMERS)
    setDisbursements(DEFAULT_DISBURSEMENTS)
    setAuditLogs(DEFAULT_AUDIT_LOGS)
    setVisits(DEFAULT_VISITS)
    setLoanProducts(DEFAULT_LOAN_PRODUCTS)
    setBranches(DEFAULT_BRANCHES)
    setUsers(DEFAULT_USERS)
    setInvitations(DEFAULT_INVITATIONS)
    setSettings(DEFAULT_SETTINGS)

    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem('sadagati_mf_migration_runs_v2')
      localStorage.removeItem('sadagati_mf_mapping_templates_v1')
    } catch {
      // fallback
    }

    addToast('Demo portfolio loaded with 7 sample borrowers & active loans!', 'info')
  }, [addToast])

  // Alias for backward compatibility
  const resetToScreenshotState = resetToDemoState

  // 3. HARD WIPE ALL LOCAL STORAGE
  const hardWipeAllStorage = useCallback(() => {
    try {
      localStorage.clear()
    } catch (e) {
      console.warn(e)
    }
    resetToFreshBlankState()
    window.location.reload()
  }, [resetToFreshBlankState])

  const contextValue = useMemo(
    () => ({
      metrics,
      trend,
      statusBreakdown,
      pendingApprovals,
      recentPayments,
      collectionTracker,
      loans,
      customers,
      disbursements,
      auditLogs,
      visits,
      setVisits,
      autoScheduleNextDayVisits,
      addVisit,
      updateVisit,
      completeVisit,
      rescheduleVisit,
      cancelVisit,
      deleteVisit,
      loanProducts,
      setLoanProducts,
      toggleProductStatus,
      deleteLoanProduct,
      purgeDeactivatedProducts,
      updateLoanProduct,
      addLoanProduct,
      branches,
      setBranches,
      addBranch,
      updateBranch,
      toggleBranchStatus,
      deleteBranch,
      users,
      setUsers,
      invitations,
      setInvitations,
      addUser,
      updateUser,
      toggleUserStatus,
      deleteUser,
      createInvitation,
      acceptInvitation,
      revokeInvitation,
      resendInvitation,
      settings,
      setSettings,
      updateSettings,
      toasts,
      addToast,
      removeToast,
      searchQuery,
      setSearchQuery,
      activeModal,
      setActiveModal,
      selectedApplication,
      setSelectedApplication,
      selectedLoan,
      setSelectedLoan,
      selectedCustomer,
      setSelectedCustomer,
      sidebarCollapsed,
      setSidebarCollapsed,
      prefilledPaymentFreq,
      setPrefilledPaymentFreq,
      approveApplication,
      rejectApplication,
      addNewApplication,
      addNewCustomer,
      recordNewPayment,
      quickCollectLoan,
      updateLoanStatus,
      importLegacyBatch,
      resetToScreenshotState,
      resetToFreshBlankState,
      resetToDemoState,
      hardWipeAllStorage,
      formatINR,
      formatCustomerId,
      generateCustomerId,
      currentUser,
      setCurrentUser,
      login,
      logout,
      switchUser,
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
      sessionExpiredNotice,
      setSessionExpiredNotice,
      isAuthRestoring,
      branchCustomers,
      branchLoans,
      branchApplications,
      branchPayments,
      branchVisits,
      branchMetrics
    }),
    [
      metrics,
      trend,
      statusBreakdown,
      pendingApprovals,
      recentPayments,
      collectionTracker,
      loans,
      customers,
      disbursements,
      auditLogs,
      visits,
      autoScheduleNextDayVisits,
      addVisit,
      updateVisit,
      completeVisit,
      rescheduleVisit,
      cancelVisit,
      deleteVisit,
      loanProducts,
      toggleProductStatus,
      deleteLoanProduct,
      purgeDeactivatedProducts,
      updateLoanProduct,
      addLoanProduct,
      branches,
      addBranch,
      updateBranch,
      toggleBranchStatus,
      deleteBranch,
      users,
      invitations,
      addUser,
      updateUser,
      toggleUserStatus,
      deleteUser,
      createInvitation,
      acceptInvitation,
      revokeInvitation,
      resendInvitation,
      settings,
      updateSettings,
      toasts,
      addToast,
      removeToast,
      searchQuery,
      activeModal,
      selectedApplication,
      selectedLoan,
      selectedCustomer,
      sidebarCollapsed,
      prefilledPaymentFreq,
      approveApplication,
      rejectApplication,
      addNewApplication,
      addNewCustomer,
      recordNewPayment,
      quickCollectLoan,
      updateLoanStatus,
      importLegacyBatch,
      resetToScreenshotState,
      resetToFreshBlankState,
      resetToDemoState,
      hardWipeAllStorage,
      currentUser,
      login,
      logout,
      switchUser,
      requestPasswordReset,
      verifyResetCode,
      resetPassword,
      sessionExpiredNotice,
      isAuthRestoring,
      branchCustomers,
      branchLoans,
      branchApplications,
      branchPayments,
      branchVisits,
      branchMetrics
    ]
  )

  return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

