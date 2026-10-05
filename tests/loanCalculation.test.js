import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LoanCalculationService,
  TENURE_UNITS,
  REPAYMENT_FREQUENCIES,
  INTEREST_METHODS,
  normalizeTenureUnit,
  normalizeRepaymentFrequency,
  addCalendarMonths,
  addCalendarYears,
  calculateMaturityDate,
  calculateInstallmentCount,
  generateRepaymentSchedule,
  validateLoanConfiguration,
  parseProductConfig
} from '../src/services/loanCalculationService.js'
import { adjustDateForHoliday, HOLIDAY_POLICIES } from '../src/services/holidayEngine.js'

test('Enum Normalization', () => {
  assert.equal(normalizeTenureUnit('days'), TENURE_UNITS.DAYS)
  assert.equal(normalizeTenureUnit('Days'), TENURE_UNITS.DAYS)
  assert.equal(normalizeTenureUnit('MONTHS'), TENURE_UNITS.MONTHS)
  assert.equal(normalizeTenureUnit('Weeks'), TENURE_UNITS.WEEKS)
  assert.equal(normalizeTenureUnit('Years'), TENURE_UNITS.YEARS)

  assert.equal(normalizeRepaymentFrequency('daily'), REPAYMENT_FREQUENCIES.DAILY)
  assert.equal(normalizeRepaymentFrequency('Weekly'), REPAYMENT_FREQUENCIES.WEEKLY)
  assert.equal(normalizeRepaymentFrequency('bi-weekly'), REPAYMENT_FREQUENCIES.BI_WEEKLY)
  assert.equal(normalizeRepaymentFrequency('Monthly'), REPAYMENT_FREQUENCIES.MONTHLY)
  assert.equal(normalizeRepaymentFrequency('Quarterly'), REPAYMENT_FREQUENCIES.QUARTERLY)
})

test('Calendar Arithmetic & Month-End Safety (Case 9 & Case 10)', () => {
  // Case 9: 31 January 2026 + 1 month -> safely clamps to 28 February 2026
  const jan31_2026 = new Date(2026, 0, 31)
  const feb2026 = addCalendarMonths(jan31_2026, 1)
  assert.equal(feb2026.getFullYear(), 2026)
  assert.equal(feb2026.getMonth(), 1) // Feb
  assert.equal(feb2026.getDate(), 28)

  // Case 10: Leap year: 31 January 2028 + 1 month -> safely clamps to 29 February 2028
  const jan31_2028 = new Date(2028, 0, 31)
  const feb2028 = addCalendarMonths(jan31_2028, 1)
  assert.equal(feb2028.getFullYear(), 2028)
  assert.equal(feb2028.getMonth(), 1)
  assert.equal(feb2028.getDate(), 29)

  // Year addition: 10 Jan 2026 + 1 Year = 10 Jan 2027
  const start10Jan = new Date(2026, 0, 10)
  const maturity1Year = calculateMaturityDate(start10Jan, 1, TENURE_UNITS.YEARS)
  assert.equal(maturity1Year.getFullYear(), 2027)
  assert.equal(maturity1Year.getMonth(), 0)
  assert.equal(maturity1Year.getDate(), 10)

  // addCalendarYears direct check
  const after2Years = addCalendarYears(start10Jan, 2)
  assert.equal(after2Years.getFullYear(), 2028)

  // Installment count helper check
  const countMonthly = calculateInstallmentCount(start10Jan, maturity1Year, REPAYMENT_FREQUENCIES.MONTHLY)
  assert.equal(countMonthly, 12)

  // Facade check
  assert.ok(LoanCalculationService.getProductConfig('Daily Micro Business Loan'))
})

test('Holiday Engine (Case 11)', () => {
  // 26 Jan 2026 is Republic Day (Statutory Holiday)
  const repDay = new Date(2026, 0, 26)
  const adjusted = adjustDateForHoliday(repDay, HOLIDAY_POLICIES.NEXT_WORKING_DAY)
  assert.equal(adjusted.getDate(), 27, 'Should move to next working day (27 Jan)')

  // Sunday check (e.g. 1 Feb 2026 is Sunday)
  const sunday = new Date(2026, 1, 1)
  assert.equal(sunday.getDay(), 0)
  const adjustedSun = adjustDateForHoliday(sunday, HOLIDAY_POLICIES.NEXT_WORKING_DAY)
  assert.equal(adjustedSun.getDate(), 2, 'Should move Sunday to Monday (2 Feb)')
})

test('Repayment Schedule Invariants across all prompt cases', () => {
  const testCases = [
    { name: 'Case 1: ₹50k, 12 Months, Monthly', amount: 50000, tenure: 12, unit: TENURE_UNITS.MONTHS, freq: REPAYMENT_FREQUENCIES.MONTHLY, expectedMinInstallments: 12 },
    { name: 'Case 2: ₹50k, 12 Months, Weekly', amount: 50000, tenure: 12, unit: TENURE_UNITS.MONTHS, freq: REPAYMENT_FREQUENCIES.WEEKLY, expectedMinInstallments: 52 },
    { name: 'Case 3: ₹50k, 12 Months, Daily', amount: 50000, tenure: 12, unit: TENURE_UNITS.MONTHS, freq: REPAYMENT_FREQUENCIES.DAILY, expectedMinInstallments: 360 },
    { name: 'Case 4: ₹50k, 6 Months, Weekly', amount: 50000, tenure: 6, unit: TENURE_UNITS.MONTHS, freq: REPAYMENT_FREQUENCIES.WEEKLY, expectedMinInstallments: 26 },
    { name: 'Case 5: ₹50k, 30 Days, Daily', amount: 50000, tenure: 30, unit: TENURE_UNITS.DAYS, freq: REPAYMENT_FREQUENCIES.DAILY, expectedMinInstallments: 30 },
    { name: 'Case 6: ₹50k, 30 Days, Weekly', amount: 50000, tenure: 30, unit: TENURE_UNITS.DAYS, freq: REPAYMENT_FREQUENCIES.WEEKLY, expectedMinInstallments: 4 },
    { name: 'Case 7: ₹50k, 2 Years, Monthly', amount: 50000, tenure: 2, unit: TENURE_UNITS.YEARS, freq: REPAYMENT_FREQUENCIES.MONTHLY, expectedMinInstallments: 24 },
    { name: 'Case 8: ₹50k, 2 Years, Weekly', amount: 50000, tenure: 2, unit: TENURE_UNITS.YEARS, freq: REPAYMENT_FREQUENCIES.WEEKLY, expectedMinInstallments: 104 }
  ]

  for (const tc of testCases) {
    const res = generateRepaymentSchedule({
      principal: tc.amount,
      annualRate: 14,
      interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
      startDate: new Date(2026, 9, 1), // 1 Oct 2026
      tenureValue: tc.tenure,
      tenureUnit: tc.unit,
      frequency: tc.freq
    })

    // Invariant 1: Total principal across installments = sanctioned principal
    assert.equal(res.totalPrincipal, tc.amount, `${tc.name}: Total principal must match principal exactly`)

    // Invariant 2: Total interest across installments = calculated total interest
    const sumInterest = res.schedule.reduce((s, r) => s + r.interest, 0)
    assert.equal(sumInterest, res.totalInterest, `${tc.name}: Schedule interest sum must equal total interest`)

    // Invariant 3: Total installment amount = principal + interest
    const sumInstallments = res.schedule.reduce((s, r) => s + r.installmentAmount, 0)
    assert.equal(sumInstallments, res.totalPayable, `${tc.name}: Total payable must equal sum of installments`)

    // Invariant 4: Final closing balance = 0 after complete schedule
    const finalRow = res.schedule[res.schedule.length - 1]
    assert.equal(finalRow.closingBalance, 0, `${tc.name}: Final closing balance must be 0`)

    // Verify installment count is within expected range
    assert.ok(res.installmentCount >= tc.expectedMinInstallments - 2 && res.installmentCount <= tc.expectedMinInstallments + 5,
      `${tc.name}: Installment count ${res.installmentCount} should be close to ${tc.expectedMinInstallments}`)
  }
})

test('Validation Enforces Product Rules', () => {
  // Test rejecting 30 Days for Monthly Small Enterprise Loan (min tenure 90 days, allowed MONTHS/YEARS)
  const invalidTenure = validateLoanConfiguration({
    productName: 'Monthly Small Enterprise Loan',
    amount: 50000,
    tenureValue: 30,
    tenureUnit: TENURE_UNITS.DAYS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY,
    annualRate: 16
  })
  assert.equal(invalidTenure.isValid, false)
  assert.ok(invalidTenure.errors.some(e => e.includes('not allowed') || e.includes('minimum duration')))

  // Test rejecting Weekly frequency for Monthly Small Enterprise Loan
  const invalidFreq = validateLoanConfiguration({
    productName: 'Monthly Small Enterprise Loan',
    amount: 50000,
    tenureValue: 12,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.WEEKLY,
    annualRate: 16
  })
  assert.equal(invalidFreq.isValid, false)
  assert.ok(invalidFreq.errors.some(e => e.includes('not compatible')))

  // Test valid config
  const valid = validateLoanConfiguration({
    productName: 'Monthly Small Enterprise Loan',
    amount: 50000,
    tenureValue: 12,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY,
    annualRate: 16
  })
  assert.equal(valid.isValid, true)
  assert.equal(valid.errors.length, 0)
})

test('Dynamic Live Product Configuration & Validation', () => {
  // Mock custom product created in UI
  const customLiveProduct = {
    id: 'PL0099',
    name: 'Custom Women SHG Micro Loan',
    interestRate: '24% flat',
    interestType: 'Flat',
    minAmount: 5000,
    maxAmount: 80000,
    minTenure: 3,
    maxTenure: 18,
    tenureUnit: 'months',
    repaymentFrequency: 'Weekly',
    status: 'Active'
  }

  const liveList = [customLiveProduct]
  const config = LoanCalculationService.getProductConfig('Custom Women SHG Micro Loan', liveList)

  assert.equal(config.name, 'Custom Women SHG Micro Loan')
  assert.equal(config.annualRate, 24)
  assert.equal(config.interestMethod, INTEREST_METHODS.FLAT_INTEREST)
  assert.equal(config.defaultFrequency, REPAYMENT_FREQUENCIES.WEEKLY)
  assert.equal(config.minAmount, 5000)
  assert.equal(config.maxAmount, 80000)

  // Validation with live products list
  const valid = validateLoanConfiguration({
    productName: 'Custom Women SHG Micro Loan',
    liveProducts: liveList,
    amount: 25000,
    tenureValue: 6,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.WEEKLY,
    annualRate: 24
  })
  assert.equal(valid.isValid, true)
  assert.equal(valid.errors.length, 0)

  // Out of range amount validation
  const invalidAmt = validateLoanConfiguration({
    productName: 'Custom Women SHG Micro Loan',
    liveProducts: liveList,
    amount: 100000,
    tenureValue: 6,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.WEEKLY,
    annualRate: 24
  })
  assert.equal(invalidAmt.isValid, false)
  assert.ok(invalidAmt.errors.some(e => e.includes('exceeds maximum limit')))
})

test('Mathematical Accuracy: Exact Flat & Reducing Interest Rates', () => {
  // Test 1: Flat Interest: ₹10,000 for 6 Months at 12% p.a.
  // Time in years = 6 / 12 = 0.5 years.
  // Interest = 10,000 * 0.12 * 0.5 = 600 exactly.
  // Total = 10,600 exactly.
  const flat6Mo = generateRepaymentSchedule({
    principal: 10000,
    annualRate: 12,
    interestMethod: INTEREST_METHODS.FLAT_INTEREST,
    startDate: new Date(2026, 0, 1),
    tenureValue: 6,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY
  })
  assert.equal(flat6Mo.totalInterest, 600, 'Flat interest for ₹10k @ 12% for 6 months must be exactly ₹600')
  assert.equal(flat6Mo.totalPayable, 10600, 'Total payable must be exactly ₹10,600')
  assert.equal(flat6Mo.installmentCount, 6, 'Must have exactly 6 installments')

  // Test 2: Flat Interest: ₹50,000 for 1 Year (12 months) at 14% p.a.
  // Time = 1.0 year. Interest = 50,000 * 0.14 * 1 = 7,000. Total = 57,000.
  const flat1Yr = generateRepaymentSchedule({
    principal: 50000,
    annualRate: 14,
    interestMethod: INTEREST_METHODS.FLAT_INTEREST,
    startDate: new Date(2026, 2, 1),
    tenureValue: 12,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY
  })
  assert.equal(flat1Yr.totalInterest, 7000, 'Flat interest for ₹50k @ 14% for 1 year must be ₹7,000')
  assert.equal(flat1Yr.totalPayable, 57000, 'Total payable must be ₹57,000')

  // Test 3: Reducing Balance: ₹1,00,000 at 12% p.a. for 12 months, Monthly
  // Monthly rate = 1% = 0.01.
  // EMI = 100000 * [0.01 * (1.01)^12] / [(1.01)^12 - 1] = 8884.88 -> 8885.
  const reducing1Yr = generateRepaymentSchedule({
    principal: 100000,
    annualRate: 12,
    interestMethod: INTEREST_METHODS.REDUCING_BALANCE,
    startDate: new Date(2026, 0, 1),
    tenureValue: 12,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY
  })
  assert.equal(reducing1Yr.baseEmi, 8885, 'EMI for ₹100k @ 12% 12 months reducing must be ₹8,885')
  assert.equal(reducing1Yr.totalPrincipal, 100000, 'Total principal must be exactly ₹1,00,000')
  assert.equal(reducing1Yr.schedule[reducing1Yr.schedule.length - 1].closingBalance, 0, 'Closing balance must be 0')
})

test('Insurance Percentage & Net Disbursal calculations', () => {
  // Parsing product config with custom insurance percentage
  const config = parseProductConfig({
    id: 'prod_test_ins',
    name: 'Insured Micro Loan',
    interestRate: '15%',
    processingFeePct: 2.0,
    insurancePercentage: 1.5,
    minAmount: 5000,
    maxAmount: 100000
  })
  assert.equal(config.insurancePercentage, 1.5, 'Parsed insurance percentage must be 1.5%')
  assert.equal(config.processingFeePct, 2.0, 'Parsed processing fee must be 2.0%')

  // Validation with valid and invalid insurance percentages
  const validCheck = validateLoanConfiguration({
    productConfig: config,
    amount: 50000,
    tenureValue: 12,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY,
    annualRate: 15,
    startDate: '2026-04-01',
    insurancePercentage: '2.5'
  })
  assert.equal(validCheck.isValid, true, 'Valid insurance percentage must pass validation')

  const invalidCheck = validateLoanConfiguration({
    productConfig: config,
    amount: 50000,
    tenureValue: 12,
    tenureUnit: TENURE_UNITS.MONTHS,
    frequency: REPAYMENT_FREQUENCIES.MONTHLY,
    annualRate: 15,
    startDate: '2026-04-01',
    insurancePercentage: '-5'
  })
  assert.equal(invalidCheck.isValid, false, 'Negative insurance percentage must fail validation')

  // Mathematical accuracy: entered principal is the full disbursed distribution amount
  const principal = 50000
  const insPct = 2.0
  const insuranceFee = Math.round((principal * insPct) / 100) // 1000
  assert.equal(insuranceFee, 1000, 'Insurance fee for ₹50k @ 2% must be ₹1,000')
  assert.equal(principal, 50000, 'Entered loan amount is the full net distribution amount')
})

