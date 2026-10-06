/**
 * Dashboard Constants & Blank Fallback States
 * Sadagati MicroFinance Core ERP
 *
 * Extracted to satisfy React Fast Refresh component boundary purity.
 */

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

export const BLANK_TREND = [
  { day: 'Sun', amount: 0, label: '0k' },
  { day: 'Mon', amount: 0, label: '0k' },
  { day: 'Tue', amount: 0, label: '0k' },
  { day: 'Wed', amount: 0, label: '0k' },
  { day: 'Thu', amount: 0, label: '0k' },
  { day: 'Fri', amount: 0, label: '0k' },
  { day: 'Sat', amount: 0, label: '0k' }
]

export const BLANK_STATUS = [
  { id: 'active', label: 'Active', count: 0, color: '#10b981' },
  { id: 'npa', label: 'NPA', count: 0, color: '#f59e0b' },
  { id: 'closed', label: 'Closed', count: 0, color: '#3b82f6' }
]

export const BLANK_COLLECTION_TRACKER = {
  daily: { expected: 0, collected: 0, remaining: 0, loanCount: 0 },
  weekly: { expected: 0, collected: 0, remaining: 0, loanCount: 0 },
  monthly: { expected: 0, collected: 0, remaining: 0, loanCount: 0 }
}
