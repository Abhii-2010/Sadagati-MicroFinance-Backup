/**
 * Centralized Loan Calculation Service & Repayment Engine
 * Single Source of Truth for Microfinance Loan Products, Tenure Normalization,
 * Calendar-based Arithmetic, Reducing/Flat Interest, Amortization Schedules & Validation.
 */

import { adjustDateForHoliday, HOLIDAY_POLICIES } from './holidayEngine.js'

// ============================================================================
// 1. NORMALIZED ENUMS & CONSTANTS
// ============================================================================

export const TENURE_UNITS = {
  DAYS: 'DAYS',
  WEEKS: 'WEEKS',
  MONTHS: 'MONTHS',
  YEARS: 'YEARS'
}

export const REPAYMENT_FREQUENCIES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BI_WEEKLY: 'BI_WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY'
}

export const INTEREST_METHODS = {
  FLAT_INTEREST: 'FLAT_INTEREST',
  REDUCING_BALANCE: 'REDUCING_BALANCE'
}

export const TENURE_UNIT_LABELS = {
  [TENURE_UNITS.DAYS]: 'Days',
  [TENURE_UNITS.WEEKS]: 'Weeks',
  [TENURE_UNITS.MONTHS]: 'Months',
  [TENURE_UNITS.YEARS]: 'Years'
}

export const REPAYMENT_FREQUENCY_LABELS = {
  [REPAYMENT_FREQUENCIES.DAILY]: 'Daily',
  [REPAYMENT_FREQUENCIES.WEEKLY]: 'Weekly',
  [REPAYMENT_FREQUENCIES.BI_WEEKLY]: 'Bi-Weekly',
  [REPAYMENT_FREQUENCIES.MONTHLY]: 'Monthly',
  [REPAYMENT_FREQUENCIES.QUARTERLY]: 'Quarterly'
}

export const INTEREST_METHOD_LABELS = {
  [INTEREST_METHODS.FLAT_INTEREST]: 'Flat Interest',
  [INTEREST_METHODS.REDUCING_BALANCE]: 'Reducing Balance (Amortization)'
}

// ============================================================================
// 2. ENTERPRISE LOAN PRODUCT REGISTRY
// ============================================================================

export const LOAN_PRODUCTS = {
  'Daily Micro Business Loan': {
    id: 'prod_daily_micro',
    name: 'Daily Micro Business Loan',
    description: 'Working capital financing for street vendors and small merchants with daily cashflow.',
    minAmount: 1000,
    maxAmount: 100000,
    minTenureDays: 7,
    maxTenureDays: 365,
    defaultTenureValue: 3,
    defaultTenureUnit: TENURE_UNITS.MONTHS,
    allowedUnits: [TENURE_UNITS.DAYS, TENURE_UNITS.WEEKS, TENURE_UNITS.MONTHS],
    allowedFrequencies: [
      REPAYMENT_FREQUENCIES.DAILY,
      REPAYMENT_FREQUENCIES.WEEKLY,
      REPAYMENT_FREQUENCIES.BI_WEEKLY
    ],
    defaultFrequency: REPAYMENT_FREQUENCIES.DAILY,
    annualRate: 12.0,
    minRate: 8.0,
    maxRate: 24.0,
    interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
    processingFeePct: 1.0
  },
  'Weekly Livestock Loan': {
    id: 'prod_weekly_livestock',
    name: 'Weekly Livestock Loan',
    description: 'Dairy, cattle, and poultry micro-loans with weekly field center collection meetings.',
    minAmount: 5000,
    maxAmount: 200000,
    minTenureDays: 28,
    maxTenureDays: 730,
    defaultTenureValue: 6,
    defaultTenureUnit: TENURE_UNITS.MONTHS,
    allowedUnits: [TENURE_UNITS.WEEKS, TENURE_UNITS.MONTHS, TENURE_UNITS.YEARS],
    allowedFrequencies: [
      REPAYMENT_FREQUENCIES.WEEKLY,
      REPAYMENT_FREQUENCIES.BI_WEEKLY,
      REPAYMENT_FREQUENCIES.MONTHLY
    ],
    defaultFrequency: REPAYMENT_FREQUENCIES.WEEKLY,
    annualRate: 14.0,
    minRate: 10.0,
    maxRate: 26.0,
    interestMethod: INTEREST_METHODS.FLAT_INTEREST,
    processingFeePct: 1.5
  },
  'Monthly Small Enterprise Loan': {
    id: 'prod_monthly_sme',
    name: 'Monthly Small Enterprise Loan',
    description: 'Structured growth capital for registered shops, artisans, and small scale enterprises.',
    minAmount: 10000,
    maxAmount: 1000000,
    minTenureDays: 90,
    maxTenureDays: 1095,
    defaultTenureValue: 12,
    defaultTenureUnit: TENURE_UNITS.MONTHS,
    allowedUnits: [TENURE_UNITS.MONTHS, TENURE_UNITS.YEARS],
    allowedFrequencies: [
      REPAYMENT_FREQUENCIES.MONTHLY,
      REPAYMENT_FREQUENCIES.QUARTERLY
    ],
    defaultFrequency: REPAYMENT_FREQUENCIES.MONTHLY,
    annualRate: 16.0,
    minRate: 11.0,
    maxRate: 28.0,
    interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
    processingFeePct: 2.0
  },
  'Emergency Festival Loan': {
    id: 'prod_emergency_fest',
    name: 'Emergency Festival Loan',
    description: 'Rapid disbursal short-term emergency or seasonal holiday financing.',
    minAmount: 1000,
    maxAmount: 50000,
    minTenureDays: 7,
    maxTenureDays: 90,
    defaultTenureValue: 30,
    defaultTenureUnit: TENURE_UNITS.DAYS,
    allowedUnits: [TENURE_UNITS.DAYS, TENURE_UNITS.WEEKS, TENURE_UNITS.MONTHS],
    allowedFrequencies: [
      REPAYMENT_FREQUENCIES.DAILY,
      REPAYMENT_FREQUENCIES.WEEKLY
    ],
    defaultFrequency: REPAYMENT_FREQUENCIES.DAILY,
    annualRate: 10.0,
    minRate: 6.0,
    maxRate: 20.0,
    interestMethod: INTEREST_METHODS.FLAT_INTEREST,
    processingFeePct: 1.0
  },
  'Agricultural Equipment Loan': {
    id: 'prod_agri_equip',
    name: 'Agricultural Equipment Loan',
    description: 'Machinery, irrigation pump, and seasonal farming asset financing.',
    minAmount: 20000,
    maxAmount: 1500000,
    minTenureDays: 180,
    maxTenureDays: 1825,
    defaultTenureValue: 12,
    defaultTenureUnit: TENURE_UNITS.MONTHS,
    allowedUnits: [TENURE_UNITS.MONTHS, TENURE_UNITS.YEARS],
    allowedFrequencies: [
      REPAYMENT_FREQUENCIES.MONTHLY,
      REPAYMENT_FREQUENCIES.QUARTERLY
    ],
    defaultFrequency: REPAYMENT_FREQUENCIES.MONTHLY,
    annualRate: 11.5,
    minRate: 8.5,
    maxRate: 22.0,
    interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
    processingFeePct: 1.5
  }
}

// Fallback config if an unlisted product name is passed
const DEFAULT_PRODUCT_CONFIG = {
  id: 'prod_default',
  name: 'Standard Micro Loan',
  minAmount: 1000,
  maxAmount: 500000,
  minTenureDays: 7,
  maxTenureDays: 1095,
  defaultTenureValue: 12,
  defaultTenureUnit: TENURE_UNITS.MONTHS,
  allowedUnits: [TENURE_UNITS.DAYS, TENURE_UNITS.WEEKS, TENURE_UNITS.MONTHS, TENURE_UNITS.YEARS],
  allowedFrequencies: [
    REPAYMENT_FREQUENCIES.DAILY,
    REPAYMENT_FREQUENCIES.WEEKLY,
    REPAYMENT_FREQUENCIES.BI_WEEKLY,
    REPAYMENT_FREQUENCIES.MONTHLY,
    REPAYMENT_FREQUENCIES.QUARTERLY
  ],
  defaultFrequency: REPAYMENT_FREQUENCIES.MONTHLY,
  annualRate: 14.0,
  minRate: 6.0,
  maxRate: 36.0,
  interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
  processingFeePct: 1.5,
  insurancePercentage: 1.5
}

// ============================================================================
// 3. ENUM NORMALIZATION HELPERS
// ============================================================================

export function normalizeTenureUnit(unit) {
  if (!unit) return TENURE_UNITS.MONTHS
  const upper = String(unit).trim().toUpperCase()
  if (upper.startsWith('DAY')) return TENURE_UNITS.DAYS
  if (upper.startsWith('WEEK')) return TENURE_UNITS.WEEKS
  if (upper.startsWith('MONTH')) return TENURE_UNITS.MONTHS
  if (upper.startsWith('YEAR')) return TENURE_UNITS.YEARS
  return TENURE_UNITS.MONTHS
}

export function normalizeRepaymentFrequency(freq) {
  if (!freq) return REPAYMENT_FREQUENCIES.MONTHLY
  const upper = String(freq).trim().toUpperCase().replace(/[-\s]/g, '_')
  if (upper === 'DAILY' || upper.startsWith('DAY')) return REPAYMENT_FREQUENCIES.DAILY
  if (upper === 'WEEKLY' || upper === 'WEEK') return REPAYMENT_FREQUENCIES.WEEKLY
  if (upper === 'BI_WEEKLY' || upper === 'FORTNIGHTLY' || upper === 'BIWEEKLY') return REPAYMENT_FREQUENCIES.BI_WEEKLY
  if (upper === 'MONTHLY' || upper === 'MONTH') return REPAYMENT_FREQUENCIES.MONTHLY
  if (upper === 'QUARTERLY' || upper === 'QUARTER') return REPAYMENT_FREQUENCIES.QUARTERLY
  return REPAYMENT_FREQUENCIES.MONTHLY
}

export function normalizeInterestMethod(method) {
  if (!method) return INTEREST_METHODS.REDUCING_BALANCE
  const upper = String(method).trim().toUpperCase().replace(/[-\s]/g, '_')
  if (upper.includes('FLAT')) return INTEREST_METHODS.FLAT_INTEREST
  return INTEREST_METHODS.REDUCING_BALANCE
}

/**
 * Parses and normalizes any product object (from DB, localStorage, or form)
 * into a full enterprise calculation configuration.
 */
export function parseProductConfig(product, fallback = DEFAULT_PRODUCT_CONFIG) {
  if (!product) return fallback

  // If it's already a full configuration with allowedUnits & allowedFrequencies & numeric annualRate
  if (
    product.allowedUnits &&
    product.allowedFrequencies &&
    typeof product.annualRate === 'number' &&
    product.minAmount !== undefined
  ) {
    return product
  }

  // Extract rate
  let annualRate = fallback.annualRate
  if (product.annualRate !== undefined && !isNaN(Number(product.annualRate))) {
    annualRate = Number(product.annualRate)
  } else if (typeof product.interestRate === 'number') {
    annualRate = product.interestRate
  } else if (typeof product.interestRate === 'string') {
    const matched = product.interestRate.match(/([0-9]+(?:\.[0-9]+)?)/)
    if (matched) {
      annualRate = parseFloat(matched[1])
    }
  }

  // Extract interest method
  let interestMethod = fallback.interestMethod
  const rateDescriptor = `${product.interestType || ''} ${product.interestRate || ''} ${product.interestMethod || ''}`.toLowerCase()
  if (rateDescriptor.includes('flat')) {
    interestMethod = INTEREST_METHODS.FLAT_INTEREST
  } else if (rateDescriptor.includes('reduc')) {
    interestMethod = INTEREST_METHODS.REDUCING_BALANCE
  }

  // Repayment Frequency
  const defaultFrequency = normalizeRepaymentFrequency(
    product.repaymentFrequency ||
    product.defaultFrequency ||
    (product.name?.toLowerCase().includes('daily') ? 'DAILY' :
     product.name?.toLowerCase().includes('week') ? 'WEEKLY' : 'MONTHLY')
  )

  const allowedFrequencies = product.allowedFrequencies && Array.isArray(product.allowedFrequencies)
    ? product.allowedFrequencies.map(normalizeRepaymentFrequency)
    : [
        REPAYMENT_FREQUENCIES.DAILY,
        REPAYMENT_FREQUENCIES.WEEKLY,
        REPAYMENT_FREQUENCIES.BI_WEEKLY,
        REPAYMENT_FREQUENCIES.MONTHLY,
        REPAYMENT_FREQUENCIES.QUARTERLY
      ]

  // Tenure Units & Limits
  const defaultTenureUnit = normalizeTenureUnit(product.tenureUnit || product.defaultTenureUnit || 'MONTHS')
  const allowedUnits = product.allowedUnits && Array.isArray(product.allowedUnits)
    ? product.allowedUnits.map(normalizeTenureUnit)
    : [TENURE_UNITS.DAYS, TENURE_UNITS.WEEKS, TENURE_UNITS.MONTHS, TENURE_UNITS.YEARS]

  const minTenure = Number(product.minTenure) >= 0 ? Number(product.minTenure) : 1
  const maxTenure = Number(product.maxTenure) > 0 ? Number(product.maxTenure) : 60

  let minTenureDays = product.minTenureDays
  let maxTenureDays = product.maxTenureDays
  if (!minTenureDays) {
    if (defaultTenureUnit === TENURE_UNITS.DAYS) minTenureDays = Math.max(1, minTenure)
    else if (defaultTenureUnit === TENURE_UNITS.WEEKS) minTenureDays = Math.max(7, minTenure * 7)
    else if (defaultTenureUnit === TENURE_UNITS.YEARS) minTenureDays = Math.max(365, minTenure * 365)
    else minTenureDays = Math.max(1, minTenure * 28)
  }
  if (!maxTenureDays) {
    if (defaultTenureUnit === TENURE_UNITS.DAYS) maxTenureDays = Math.max(minTenureDays, maxTenure)
    else if (defaultTenureUnit === TENURE_UNITS.WEEKS) maxTenureDays = Math.max(minTenureDays, maxTenure * 7)
    else if (defaultTenureUnit === TENURE_UNITS.YEARS) maxTenureDays = Math.max(minTenureDays, maxTenure * 365)
    else maxTenureDays = Math.max(minTenureDays, maxTenure * 31)
  }

  // Amount limits
  const minAmount = Number(product.minAmount) > 0 ? Number(product.minAmount) : 500
  const maxAmount = Number(product.maxAmount) >= minAmount ? Number(product.maxAmount) : 5000000

  // Rate limits
  const minRate = product.minRate !== undefined ? Number(product.minRate) : 0.1
  const maxRate = product.maxRate !== undefined ? Number(product.maxRate) : 100.0

  // Processing fee
  let processingFeePct = 1.0
  if (product.processingFeeValue !== undefined) {
    processingFeePct = Number(product.processingFeeValue) || 1.0
  } else if (product.processingFeePct !== undefined) {
    processingFeePct = Number(product.processingFeePct) || 1.0
  }

  // Insurance percentage
  let insurancePercentage = 1.5
  if (product.insurancePercentage !== undefined && !isNaN(Number(product.insurancePercentage))) {
    insurancePercentage = Number(product.insurancePercentage)
  }

  return {
    id: product.id || 'prod_custom',
    name: product.name || 'Microfinance Loan Product',
    description: product.description || '',
    minAmount,
    maxAmount,
    minTenureDays,
    maxTenureDays,
    defaultTenureValue: product.defaultTenureValue || Math.max(1, minTenure || 6),
    defaultTenureUnit,
    allowedUnits,
    allowedFrequencies,
    defaultFrequency,
    annualRate,
    minRate,
    maxRate,
    interestMethod,
    processingFeePct,
    insurancePercentage
  }
}

/**
 * Resolves configuration for a product name or object, searching live dynamic products first.
 */
export function getProductConfig(productOrName, liveProducts = []) {
  if (!productOrName) return DEFAULT_PRODUCT_CONFIG

  if (typeof productOrName === 'object' && productOrName !== null) {
    return parseProductConfig(productOrName)
  }

  // 1. Check live products list if provided
  if (Array.isArray(liveProducts) && liveProducts.length > 0) {
    const found = liveProducts.find(
      (p) =>
        (p.name && p.name.trim().toLowerCase() === String(productOrName).trim().toLowerCase()) ||
        (p.id && p.id.trim().toLowerCase() === String(productOrName).trim().toLowerCase())
    )
    if (found) {
      return parseProductConfig(found)
    }
  }

  // 2. Check static LOAN_PRODUCTS registry
  if (LOAN_PRODUCTS[productOrName]) {
    return LOAN_PRODUCTS[productOrName]
  }

  const staticKey = Object.keys(LOAN_PRODUCTS).find(
    (k) => k.toLowerCase() === String(productOrName).trim().toLowerCase()
  )
  if (staticKey) {
    return LOAN_PRODUCTS[staticKey]
  }

  return DEFAULT_PRODUCT_CONFIG
}

// ============================================================================
// 4. CALENDAR ARITHMETIC & DATE CALCULATIONS
// ============================================================================

/**
 * Returns the number of days in a given year and month (0-indexed month)
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Safely adds calendar months to a date with end-of-month clamping.
 * Example: 31 Jan 2026 + 1 month = 28 Feb 2026 (or 29 Feb in leap year).
 */
export function addCalendarMonths(baseDate, monthsToAdd) {
  const date = new Date(baseDate.getTime())
  const originalDay = date.getDate()

  const currentYear = date.getFullYear()
  const currentMonth = date.getMonth()

  const targetTotalMonths = currentMonth + monthsToAdd
  const targetYear = currentYear + Math.floor(targetTotalMonths / 12)
  const targetMonth = ((targetTotalMonths % 12) + 12) % 12

  const maxDaysInTargetMonth = getDaysInMonth(targetYear, targetMonth)
  const safeDay = Math.min(originalDay, maxDaysInTargetMonth)

  return new Date(targetYear, targetMonth, safeDay, date.getHours(), date.getMinutes(), date.getSeconds())
}

/**
 * Safely adds calendar years to a date with Feb 29 leap-day clamping.
 */
export function addCalendarYears(baseDate, yearsToAdd) {
  const date = new Date(baseDate.getTime())
  const originalDay = date.getDate()
  const originalMonth = date.getMonth()
  const targetYear = date.getFullYear() + yearsToAdd

  const maxDaysInMonth = getDaysInMonth(targetYear, originalMonth)
  const safeDay = Math.min(originalDay, maxDaysInMonth)

  return new Date(targetYear, originalMonth, safeDay, date.getHours(), date.getMinutes(), date.getSeconds())
}

/**
 * Calculates authoritative loan maturity date based on start date, tenure value, and tenure unit.
 * Uses real calendar arithmetic.
 */
export function calculateMaturityDate(startDate, tenureValue, tenureUnit) {
  const sDate = startDate instanceof Date ? startDate : new Date(startDate)
  const val = Math.max(1, Math.floor(Number(tenureValue) || 1))
  const unit = normalizeTenureUnit(tenureUnit)

  if (unit === TENURE_UNITS.DAYS) {
    const maturity = new Date(sDate.getTime())
    maturity.setDate(maturity.getDate() + val)
    return maturity
  }

  if (unit === TENURE_UNITS.WEEKS) {
    const maturity = new Date(sDate.getTime())
    maturity.setDate(maturity.getDate() + val * 7)
    return maturity
  }

  if (unit === TENURE_UNITS.MONTHS) {
    return addCalendarMonths(sDate, val)
  }

  if (unit === TENURE_UNITS.YEARS) {
    return addCalendarYears(sDate, val)
  }

  return addCalendarMonths(sDate, val)
}

/**
 * Normalizes duration to approximate days and months for validation and reporting.
 */
export function normalizeDuration(startDate, tenureValue, tenureUnit) {
  const sDate = startDate instanceof Date ? startDate : new Date(startDate)
  const val = Math.max(1, Math.floor(Number(tenureValue) || 1))
  const unit = normalizeTenureUnit(tenureUnit)
  const maturityDate = calculateMaturityDate(sDate, val, unit)

  const diffMs = maturityDate.getTime() - sDate.getTime()
  const durationInDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  let durationInMonths = durationInDays / 30.4375
  if (unit === TENURE_UNITS.MONTHS) durationInMonths = val
  else if (unit === TENURE_UNITS.YEARS) durationInMonths = val * 12

  const durationInYears = durationInDays / 365.25

  return {
    tenureValue: val,
    tenureUnit: unit,
    startDate: sDate,
    maturityDate,
    durationInDays,
    durationInMonths,
    durationInYears,
    humanReadable: `${val} ${TENURE_UNIT_LABELS[unit] || unit}`
  }
}

// ============================================================================
// 5. INSTALLMENT COUNT CALCULATION
// ============================================================================

/**
 * Centralized service to calculate exact number of installments.
 * Based on Start Date + Maturity Date + Repayment Frequency and optional structured tenure.
 */
export function calculateInstallmentCount(startDate, maturityDate, frequency, tenureValue, tenureUnit) {
  const normFreq = normalizeRepaymentFrequency(frequency)
  const sDate = startDate instanceof Date ? startDate : new Date(startDate)
  const mDate = maturityDate instanceof Date ? maturityDate : new Date(maturityDate)

  if (tenureValue && tenureUnit) {
    const val = Math.max(1, Math.floor(Number(tenureValue) || 1))
    const unit = normalizeTenureUnit(tenureUnit)

    if (unit === TENURE_UNITS.MONTHS) {
      if (normFreq === REPAYMENT_FREQUENCIES.MONTHLY) return val
      if (normFreq === REPAYMENT_FREQUENCIES.QUARTERLY) return Math.max(1, Math.round(val / 3))
      if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) return Math.max(1, Math.round((val * 52) / 12))
      if (normFreq === REPAYMENT_FREQUENCIES.BI_WEEKLY) return Math.max(1, Math.round((val * 26) / 12))
    } else if (unit === TENURE_UNITS.YEARS) {
      if (normFreq === REPAYMENT_FREQUENCIES.MONTHLY) return val * 12
      if (normFreq === REPAYMENT_FREQUENCIES.QUARTERLY) return val * 4
      if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) return val * 52
      if (normFreq === REPAYMENT_FREQUENCIES.BI_WEEKLY) return val * 26
    } else if (unit === TENURE_UNITS.WEEKS) {
      if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) return val
      if (normFreq === REPAYMENT_FREQUENCIES.BI_WEEKLY) return Math.max(1, Math.round(val / 2))
      if (normFreq === REPAYMENT_FREQUENCIES.DAILY) return val * 7
    } else if (unit === TENURE_UNITS.DAYS) {
      if (normFreq === REPAYMENT_FREQUENCIES.DAILY) return val
      if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) return Math.max(1, Math.round(val / 7))
    }
  }

  const totalDays = Math.max(1, Math.round((mDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24)))

  if (normFreq === REPAYMENT_FREQUENCIES.DAILY) {
    return Math.max(1, totalDays)
  }

  if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) {
    return Math.max(1, Math.round(totalDays / 7))
  }

  if (normFreq === REPAYMENT_FREQUENCIES.BI_WEEKLY) {
    return Math.max(1, Math.round(totalDays / 14))
  }

  if (normFreq === REPAYMENT_FREQUENCIES.MONTHLY) {
    // Exact month count
    const yearDiff = mDate.getFullYear() - sDate.getFullYear()
    const monthDiff = mDate.getMonth() - sDate.getMonth()
    let months = yearDiff * 12 + monthDiff
    if (months <= 0) months = Math.max(1, Math.round(totalDays / 30.4375))
    return Math.max(1, months)
  }

  if (normFreq === REPAYMENT_FREQUENCIES.QUARTERLY) {
    const yearDiff = mDate.getFullYear() - sDate.getFullYear()
    const monthDiff = mDate.getMonth() - sDate.getMonth()
    const months = yearDiff * 12 + monthDiff
    const quarters = Math.max(1, Math.round(months / 3))
    return quarters
  }

  return Math.max(1, Math.round(totalDays / 30))
}

// ============================================================================
// 6. MONETARY PRECISION & ROUNDING
// ============================================================================

/**
 * Rounds monetary amounts to nearest rupee (or 2 decimal places if required).
 * In Indian microfinance field operations, cash collections are rounded to whole rupees.
 */
export function roundMoney(amount) {
  return Math.round(Number(amount) || 0)
}

// ============================================================================
// 7. REPAYMENT SCHEDULE & FINANCIAL ENGINE
// ============================================================================

/**
 * Generates the complete, authoritative repayment schedule preview and financial totals.
 *
 * Invariants Guaranteed:
 * 1. Total principal across installments = sanctioned principal.
 * 2. Total interest across installments = calculated total interest.
 * 3. Total installment amount = principal + interest.
 * 4. Final outstanding balance = 0 after the complete schedule.
 * 5. Due dates adhere to holiday policy.
 */
export function generateRepaymentSchedule({
  principal,
  annualRate,
  interestMethod = INTEREST_METHODS.REDUCING_BALANCE,
  startDate,
  tenureValue,
  tenureUnit,
  frequency,
  holidayPolicy = HOLIDAY_POLICIES.NEXT_WORKING_DAY
}) {
  const P = Math.max(0, Number(principal) || 0)
  const R = Math.max(0, Number(annualRate) || 0)
  const normMethod = normalizeInterestMethod(interestMethod)
  const normUnit = normalizeTenureUnit(tenureUnit)
  const normFreq = normalizeRepaymentFrequency(frequency)
  const sDate = startDate instanceof Date ? startDate : new Date(startDate || Date.now())

  // Calculate normalized maturity and duration
  const norm = normalizeDuration(sDate, tenureValue, normUnit)
  const maturityDate = norm.maturityDate
  const installmentCount = calculateInstallmentCount(sDate, maturityDate, normFreq, norm.tenureValue, normUnit)

  if (P <= 0 || installmentCount <= 0) {
    return {
      principal: 0,
      annualRate: R,
      interestMethod: normMethod,
      frequency: normFreq,
      tenureValue,
      tenureUnit: normUnit,
      durationInDays: norm.durationInDays,
      startDate: sDate,
      firstRepaymentDate: sDate,
      maturityDate,
      installmentCount: 0,
      baseEmi: 0,
      totalInterest: 0,
      totalPayable: 0,
      schedule: []
    }
  }

  // Calculate Base Interest and EMI
  let totalInterest = 0
  let baseEmi = 0
  let periodicRate = 0

  if (normMethod === INTEREST_METHODS.FLAT_INTEREST) {
    // Total Interest = Principal * (Rate/100) * Time In Years
    // Compute exact time in years based on tenure unit to guarantee mathematical accuracy without calendar day drift
    let timeInYears = 1
    if (normUnit === TENURE_UNITS.YEARS) {
      timeInYears = norm.tenureValue
    } else if (normUnit === TENURE_UNITS.MONTHS) {
      timeInYears = norm.tenureValue / 12
    } else if (normUnit === TENURE_UNITS.WEEKS) {
      timeInYears = norm.tenureValue / 52
    } else if (normUnit === TENURE_UNITS.DAYS) {
      timeInYears = norm.tenureValue / 365
    } else {
      timeInYears = norm.durationInDays / 365
    }

    totalInterest = roundMoney(P * (R / 100) * timeInYears)
    const totalPayable = P + totalInterest
    baseEmi = roundMoney(totalPayable / installmentCount)
  } else {
    // Reducing Balance Amortization Formula:
    // EMI = P * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]
    let periodsPerYear = 12
    if (normFreq === REPAYMENT_FREQUENCIES.DAILY) periodsPerYear = 365
    else if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) periodsPerYear = 52
    else if (normFreq === REPAYMENT_FREQUENCIES.BI_WEEKLY) periodsPerYear = 26
    else if (normFreq === REPAYMENT_FREQUENCIES.MONTHLY) periodsPerYear = 12
    else if (normFreq === REPAYMENT_FREQUENCIES.QUARTERLY) periodsPerYear = 4

    periodicRate = (R / 100) / periodsPerYear

    if (periodicRate > 0) {
      const compoundFactor = Math.pow(1 + periodicRate, installmentCount)
      const denom = compoundFactor - 1
      if (denom > 0) {
        baseEmi = roundMoney(P * ((periodicRate * compoundFactor) / denom))
      } else {
        baseEmi = roundMoney(P / installmentCount)
      }
      // Approximate total interest from amortization
      totalInterest = Math.max(0, (baseEmi * installmentCount) - P)
    } else {
      baseEmi = roundMoney(P / installmentCount)
      totalInterest = 0
    }
  }

  // Generate Installment Due Dates
  const dueDates = []
  let currentDate = new Date(sDate.getTime())

  for (let i = 1; i <= installmentCount; i++) {
    let nextDate
    if (normFreq === REPAYMENT_FREQUENCIES.DAILY) {
      nextDate = new Date(currentDate.getTime())
      nextDate.setDate(nextDate.getDate() + 1)
    } else if (normFreq === REPAYMENT_FREQUENCIES.WEEKLY) {
      nextDate = new Date(sDate.getTime())
      nextDate.setDate(nextDate.getDate() + i * 7)
    } else if (normFreq === REPAYMENT_FREQUENCIES.BI_WEEKLY) {
      nextDate = new Date(sDate.getTime())
      nextDate.setDate(nextDate.getDate() + i * 14)
    } else if (normFreq === REPAYMENT_FREQUENCIES.MONTHLY) {
      nextDate = addCalendarMonths(sDate, i)
    } else if (normFreq === REPAYMENT_FREQUENCIES.QUARTERLY) {
      nextDate = addCalendarMonths(sDate, i * 3)
    } else {
      nextDate = addCalendarMonths(sDate, i)
    }

    // Apply Holiday Policy
    const adjustedDate = adjustDateForHoliday(nextDate, holidayPolicy)
    dueDates.push(adjustedDate)
    currentDate = nextDate
  }

  const firstRepaymentDate = dueDates[0] || sDate

  // Build Schedule Rows with Exact Precision & Reconciled Balances
  const schedule = []
  let openingBalance = P
  let accumulatedPrincipal = 0
  let accumulatedInterest = 0

  const equalPrincipalFlat = roundMoney(P / installmentCount)
  const equalInterestFlat = roundMoney(totalInterest / installmentCount)

  for (let i = 1; i <= installmentCount; i++) {
    const isFinalInstallment = i === installmentCount
    let principalComponent = 0
    let interestComponent = 0

    if (normMethod === INTEREST_METHODS.FLAT_INTEREST) {
      if (isFinalInstallment) {
        // Guarantee total principal equals P exactly
        principalComponent = openingBalance
        interestComponent = Math.max(0, totalInterest - accumulatedInterest)
      } else {
        principalComponent = Math.min(openingBalance, equalPrincipalFlat)
        interestComponent = equalInterestFlat
      }
    } else {
      // Reducing Balance
      if (isFinalInstallment) {
        principalComponent = openingBalance
        interestComponent = Math.max(0, roundMoney(openingBalance * periodicRate))
      } else {
        interestComponent = roundMoney(openingBalance * periodicRate)
        principalComponent = Math.min(openingBalance, Math.max(0, baseEmi - interestComponent))
      }
    }

    const installmentAmount = principalComponent + interestComponent
    const closingBalance = Math.max(0, openingBalance - principalComponent)

    accumulatedPrincipal += principalComponent
    accumulatedInterest += interestComponent

    schedule.push({
      installmentNumber: i,
      dueDate: dueDates[i - 1],
      dueDateFormatted: dueDates[i - 1].toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      openingBalance: roundMoney(openingBalance),
      principal: roundMoney(principalComponent),
      interest: roundMoney(interestComponent),
      installmentAmount: roundMoney(installmentAmount),
      closingBalance: isFinalInstallment ? 0 : roundMoney(closingBalance),
      status: 'Scheduled'
    })

    openingBalance = closingBalance
  }

  const totalPayable = accumulatedPrincipal + accumulatedInterest

  return {
    principal: P,
    annualRate: R,
    interestMethod: normMethod,
    frequency: normFreq,
    tenureValue: norm.tenureValue,
    tenureUnit: normUnit,
    durationInDays: norm.durationInDays,
    durationInMonths: Math.round(norm.durationInMonths * 10) / 10,
    startDate: sDate,
    startDateFormatted: sDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    firstRepaymentDate,
    firstRepaymentDateFormatted: firstRepaymentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    maturityDate,
    maturityDateFormatted: maturityDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    installmentCount,
    baseEmi: schedule[0] ? schedule[0].installmentAmount : baseEmi,
    totalPrincipal: accumulatedPrincipal,
    totalInterest: accumulatedInterest,
    totalPayable,
    schedule
  }
}

// ============================================================================
// 8. LOAN CONFIGURATION VALIDATOR
// ============================================================================

export function validateLoanConfiguration({
  productName,
  productConfig,
  liveProducts = [],
  amount,
  tenureValue,
  tenureUnit,
  frequency,
  annualRate,
  startDate,
  insurancePercentage
}) {
  const errors = []
  const product = productConfig || getProductConfig(productName, liveProducts)

  const numAmount = Number(amount)
  if (!numAmount || numAmount <= 0 || isNaN(numAmount)) {
    errors.push('Loan amount is required and must be greater than ₹0')
  } else {
    if (numAmount < product.minAmount) {
      errors.push(`Amount ₹${numAmount.toLocaleString('en-IN')} is below minimum of ₹${product.minAmount.toLocaleString('en-IN')} for ${product.name}`)
    }
    if (numAmount > product.maxAmount) {
      errors.push(`Amount ₹${numAmount.toLocaleString('en-IN')} exceeds maximum limit of ₹${product.maxAmount.toLocaleString('en-IN')} for ${product.name}`)
    }
  }

  const numTenure = Number(tenureValue)
  if (!numTenure || numTenure <= 0 || isNaN(numTenure)) {
    errors.push('Tenure must be a positive integer greater than 0')
  } else if (!Number.isInteger(numTenure)) {
    errors.push('Tenure value must be a whole number')
  }

  const normUnit = normalizeTenureUnit(tenureUnit)
  if (product.allowedUnits && product.allowedUnits.length > 0 && !product.allowedUnits.includes(normUnit)) {
    const allowed = product.allowedUnits.map((u) => TENURE_UNIT_LABELS[u] || u).join(', ')
    errors.push(`Tenure unit '${TENURE_UNIT_LABELS[normUnit] || normUnit}' is not allowed for ${product.name}. Allowed: ${allowed}`)
  }

  // Check normalized duration limits
  if (numTenure > 0) {
    const sDate = startDate instanceof Date ? startDate : new Date(startDate || Date.now())
    const norm = normalizeDuration(sDate, numTenure, normUnit)
    if (product.minTenureDays && norm.durationInDays < product.minTenureDays) {
      errors.push(`Selected tenure (${norm.humanReadable} = ${norm.durationInDays} days) is less than product minimum duration of ${product.minTenureDays} days`)
    }
    if (product.maxTenureDays && norm.durationInDays > product.maxTenureDays) {
      errors.push(`Selected tenure (${norm.humanReadable} = ${norm.durationInDays} days) exceeds product maximum duration of ${product.maxTenureDays} days`)
    }
  }

  const normFreq = normalizeRepaymentFrequency(frequency)
  if (product.allowedFrequencies && product.allowedFrequencies.length > 0 && !product.allowedFrequencies.includes(normFreq)) {
    const allowed = product.allowedFrequencies.map((f) => REPAYMENT_FREQUENCY_LABELS[f] || f).join(', ')
    errors.push(`Repayment frequency '${REPAYMENT_FREQUENCY_LABELS[normFreq] || normFreq}' is not compatible with ${product.name}. Allowed: ${allowed}`)
  }

  const numRate = Number(annualRate)
  if (numRate !== undefined && !isNaN(numRate)) {
    const minR = product.minRate !== undefined ? product.minRate : 0.1
    const maxR = product.maxRate !== undefined ? product.maxRate : 100.0
    if (numRate < minR || numRate > maxR) {
      errors.push(`Interest rate ${numRate}% p.a. must be between ${minR}% and ${maxR}% for this product`)
    }
  }

  if (insurancePercentage !== undefined && insurancePercentage !== '') {
    const numInsurance = Number(insurancePercentage)
    if (isNaN(numInsurance) || numInsurance < 0 || numInsurance > 50) {
      errors.push('Insurance percentage must be a number between 0% and 50%')
    }
  }

  if (startDate) {
    const parsedDate = new Date(startDate)
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid loan start date provided')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================================================
// 9. CENTRALIZED FACADE SERVICE
// ============================================================================

export const LoanCalculationService = {
  getProducts: () => LOAN_PRODUCTS,
  getProductConfig,
  parseProductConfig,
  normalizeTenureUnit,
  normalizeRepaymentFrequency,
  normalizeInterestMethod,
  normalizeDuration,
  calculateMaturityDate,
  calculateInstallmentCount,
  generateRepaymentSchedule,
  validateLoanConfiguration
}

export default LoanCalculationService
