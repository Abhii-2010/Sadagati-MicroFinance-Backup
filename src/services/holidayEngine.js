/**
 * Holiday Engine for Microfinance Repayment Scheduling
 * Handles weekend policies, statutory holidays, and date adjustment rules.
 */

// Common statutory and bank holidays (YYYY-MM-DD)
export const STATUTORY_HOLIDAYS = new Set([
  // 2026 Holidays
  '2026-01-01', // New Year's Day
  '2026-01-26', // Republic Day
  '2026-03-03', // Maha Shivratri
  '2026-03-20', // Eid al-Fitr (approx)
  '2026-03-25', // Holi
  '2026-04-03', // Good Friday
  '2026-04-14', // Ambedkar Jayanti
  '2026-05-01', // May Day
  '2026-08-15', // Independence Day
  '2026-08-27', // Janmashtami
  '2026-10-02', // Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-08', // Diwali
  '2026-11-24', // Guru Nanak Jayanti
  '2026-12-25', // Christmas

  // 2027 Holidays
  '2027-01-01',
  '2027-01-26',
  '2027-03-15',
  '2027-08-15',
  '2027-10-02',
  '2027-10-29',
  '2027-12-25'
])

export const HOLIDAY_POLICIES = {
  NEXT_WORKING_DAY: 'NEXT_WORKING_DAY',
  PREVIOUS_WORKING_DAY: 'PREVIOUS_WORKING_DAY',
  SKIP_HOLIDAY: 'SKIP_HOLIDAY'
}

/**
 * Checks if a given Date is a non-working day (Sunday or statutory holiday)
 * In Indian microfinance field operations, Sundays are standard non-working center days.
 * @param {Date} date
 * @returns {boolean}
 */
export function isNonWorkingDay(date) {
  const dayOfWeek = date.getDay() // 0 = Sunday
  if (dayOfWeek === 0) return true

  const isoDate = formatDateToISO(date)
  return STATUTORY_HOLIDAYS.has(isoDate)
}

/**
 * Formats a Date to YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDateToISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Adjusts a date according to the configured holiday policy if it falls on a non-working day
 * @param {Date} date
 * @param {string} policy HOLIDAY_POLICIES
 * @returns {Date}
 */
export function adjustDateForHoliday(date, policy = HOLIDAY_POLICIES.NEXT_WORKING_DAY) {
  const adjusted = new Date(date.getTime())

  if (policy === HOLIDAY_POLICIES.SKIP_HOLIDAY) {
    return adjusted
  }

  if (policy === HOLIDAY_POLICIES.PREVIOUS_WORKING_DAY) {
    let safetyCounter = 0
    while (isNonWorkingDay(adjusted) && safetyCounter < 14) {
      adjusted.setDate(adjusted.getDate() - 1)
      safetyCounter++
    }
    return adjusted
  }

  // Default: NEXT_WORKING_DAY
  let safetyCounter = 0
  while (isNonWorkingDay(adjusted) && safetyCounter < 14) {
    adjusted.setDate(adjusted.getDate() + 1)
    safetyCounter++
  }
  return adjusted
}
