import test from 'node:test'
import assert from 'node:assert/strict'

// Test password policy validation
function validatePasswordPolicy(pw) {
  return {
    minLength: pw.length >= 8,
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasNumber: /[0-9]/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw),
    isValid:
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[^A-Za-z0-9]/.test(pw)
  }
}

// Test role-based redirection helper
function determinePortalTarget(user) {
  if (!user) return '/login'
  if (user.role === 'Admin') return '/admin'
  return '/employee'
}

// Test session expiration check
function isSessionExpired(sessionMeta, now = Date.now()) {
  if (!sessionMeta || !sessionMeta.expiresAt) return true
  return now > sessionMeta.expiresAt
}

// Test rate limiting lockout logic
function calculateLockout(currentFailures, now = Date.now()) {
  if (currentFailures >= 5) {
    return { isLocked: true, lockUntil: now + 30000 }
  }
  return { isLocked: false, lockUntil: 0 }
}

test('Password Security Policy Validation', () => {
  // Invalid passwords
  assert.equal(validatePasswordPolicy('short').isValid, false)
  assert.equal(validatePasswordPolicy('alllowercase1!').hasUpper, false)
  assert.equal(validatePasswordPolicy('ALLUPPERCASE1!').hasLower, false)
  assert.equal(validatePasswordPolicy('NoSpecialChar123').hasSpecial, false)
  assert.equal(validatePasswordPolicy('NoNumberHere!@#').hasNumber, false)

  // Valid passwords
  const valid = validatePasswordPolicy('Sadagati#2026')
  assert.equal(valid.isValid, true)
  assert.equal(valid.minLength, true)
  assert.equal(valid.hasUpper, true)
  assert.equal(valid.hasLower, true)
  assert.equal(valid.hasNumber, true)
  assert.equal(valid.hasSpecial, true)
})

test('Role-Based Portal Redirection Logic', () => {
  assert.equal(determinePortalTarget(null), '/login')
  assert.equal(determinePortalTarget({ role: 'Admin', name: 'Abhi' }), '/admin')
  assert.equal(determinePortalTarget({ role: 'Field Officer', name: 'Rahul Sharma' }), '/employee')
  assert.equal(determinePortalTarget({ role: 'Branch Executive', name: 'Priya Singh' }), '/employee')
  assert.equal(determinePortalTarget({ role: 'User', name: 'Staff' }), '/employee')
})

test('Session Expiration Arithmetic', () => {
  const now = 1775000000000
  const activeSession = { expiresAt: now + 3600000, rememberMe: true }
  const expiredSession = { expiresAt: now - 1000, rememberMe: false }

  assert.equal(isSessionExpired(activeSession, now), false)
  assert.equal(isSessionExpired(expiredSession, now), true)
  assert.equal(isSessionExpired(null, now), true)
})

test('Rate Limiting & Lockout Calculation', () => {
  const now = 1000000
  assert.equal(calculateLockout(1, now).isLocked, false)
  assert.equal(calculateLockout(4, now).isLocked, false)
  const locked = calculateLockout(5, now)
  assert.equal(locked.isLocked, true)
  assert.equal(locked.lockUntil, now + 30000)
})
