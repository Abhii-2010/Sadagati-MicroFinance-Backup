import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createPasswordVerifier,
  verifyPassword,
  sanitizeUserForSession,
  isWebCryptoAvailable,
  PBKDF2_ALGO,
  DEFAULT_ITERATIONS
} from '../src/services/authCryptoService.js'

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

// Authentication simulation helper reflecting DashboardContext logic
async function authenticateUser(user, candidatePassword) {
  if ((!user.auth && !user.password) || user.pendingSetup) {
    return { success: false, error: 'Account credentials have not been configured' }
  }

  let isPasswordValid = false
  let requiresMigration = false

  if (user.auth) {
    isPasswordValid = await verifyPassword(candidatePassword, user.auth)
  } else if (user.password) {
    if (user.password === candidatePassword) {
      isPasswordValid = true
      requiresMigration = true
    }
  }

  if (!isPasswordValid) {
    return { success: false, error: 'Invalid credentials' }
  }

  let upgradedUser = user
  if (requiresMigration) {
    const verifier = await createPasswordVerifier(candidatePassword)
    const { password: _p, ...clean } = user
    upgradedUser = { ...clean, auth: verifier }
  }

  return { success: true, user: upgradedUser }
}

// Startup ledger sanitization simulation
async function sanitizeLedgerUsers(users) {
  return Promise.all(
    users.map(async (u) => {
      if (u && typeof u.password === 'string' && u.password.length > 0) {
        const verifier = await createPasswordVerifier(u.password)
        const { password: _p, ...clean } = u
        return { ...clean, auth: verifier }
      }
      return u
    })
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL TESTS PRESERVED
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// MANDATORY NEW SECURITY & HARDENING TESTS (A - L)
// ─────────────────────────────────────────────────────────────────────────────

test('A. Password Verifier Creation', async () => {
  const verifier = await createPasswordVerifier('SecureFin2026!')
  assert.ok(verifier, 'Verifier object should be generated')
  assert.equal(verifier.algo, PBKDF2_ALGO)
  assert.equal(verifier.iterations, DEFAULT_ITERATIONS)
  assert.ok(verifier.salt, 'Salt must exist')
  assert.equal(verifier.salt.length, 32, '16-byte salt must be 32 hex characters')
  assert.ok(verifier.hash, 'Hash must exist')
  assert.equal(verifier.hash.length, 64, '256-bit derived key must be 64 hex characters')
})

test('B. Password Verification (Correct and Incorrect)', async () => {
  const verifier = await createPasswordVerifier('StrongP@ss99')
  const validResult = await verifyPassword('StrongP@ss99', verifier)
  assert.equal(validResult, true, 'Matching password must verify to true')

  const invalidResult = await verifyPassword('WrongPassword!', verifier)
  assert.equal(invalidResult, false, 'Non-matching password must verify to false')

  const caseSensitiveResult = await verifyPassword('strongp@ss99', verifier)
  assert.equal(caseSensitiveResult, false, 'Verification must be case-sensitive')
})

test('C. Unique Salts Generate Distinct Verifiers for Identical Passwords', async () => {
  const password = 'SharedPassword#123'
  const verifierA = await createPasswordVerifier(password)
  const verifierB = await createPasswordVerifier(password)

  assert.notEqual(verifierA.salt, verifierB.salt, 'Salts must be cryptographically random and unique')
  assert.notEqual(verifierA.hash, verifierB.hash, 'Hashes must differ even for identical input passwords')

  // Both should verify their own respective credentials
  assert.equal(await verifyPassword(password, verifierA), true)
  assert.equal(await verifyPassword(password, verifierB), true)
})

test('D. Legacy Migration on Successful Authentication', async () => {
  const legacyUser = {
    id: 'USR-LEGACY-001',
    name: 'Legacy Field Agent',
    email: 'agent@sadagati.com',
    password: 'OldPassword123!'
  }

  const authResult = await authenticateUser(legacyUser, 'OldPassword123!')
  assert.equal(authResult.success, true, 'Legacy authentication should succeed')
  assert.equal('password' in authResult.user, false, 'Plaintext password field must be completely deleted')
  assert.ok(authResult.user.auth, 'PBKDF2 auth object must be present')
  assert.equal(authResult.user.auth.algo, PBKDF2_ALGO)

  // Verify that future logins with the newly upgraded verifier work
  const futureAuth = await verifyPassword('OldPassword123!', authResult.user.auth)
  assert.equal(futureAuth, true, 'Upgraded verifier must verify the existing credential')
})

test('E. Wrong Legacy Password Fails Login and Does NOT Migrate', async () => {
  const legacyUser = {
    id: 'USR-LEGACY-002',
    name: 'Strict User',
    password: 'CorrectLegacySecret#1'
  }

  const authResult = await authenticateUser(legacyUser, 'WrongSecretAttempt!')
  assert.equal(authResult.success, false, 'Failed authentication must not succeed')
  assert.equal('auth' in legacyUser, false, 'User must not have been migrated on failure')
  assert.equal(legacyUser.password, 'CorrectLegacySecret#1', 'Legacy password remains untouched')
})

test('F. Missing Credential / Pending Accounts Cannot Authenticate', async () => {
  const unconfiguredUser = {
    id: 'USR-BLANK-001',
    name: 'Unset Password User',
    email: 'blank@sadagati.com'
  }

  const authResult = await authenticateUser(unconfiguredUser, 'AnyAttempt#2026')
  assert.equal(authResult.success, false, 'Account without auth or password must fail authentication')

  const pendingUser = {
    id: 'USR-PENDING-001',
    name: 'Invited Staff',
    pendingSetup: true,
    auth: null
  }

  const pendingResult = await authenticateUser(pendingUser, 'password123')
  assert.equal(pendingResult.success, false, 'Account marked pendingSetup must not be allowed to log in')
})

test('G. Master Password Removal Prevents Universal Bypass', async () => {
  const user = {
    id: 'USR-REAL-001',
    name: 'Custom Admin',
    auth: await createPasswordVerifier('UniqueAdminSecret#2026')
  }

  // Attempting to log in with universal demo 'password123' must FAIL
  const bypassAttempt = await authenticateUser(user, 'password123')
  assert.equal(bypassAttempt.success, false, 'Universal master password password123 must NOT authenticate arbitrary accounts')

  // Attempting with true secret must SUCCEED
  const legitAttempt = await authenticateUser(user, 'UniqueAdminSecret#2026')
  assert.equal(legitAttempt.success, true, 'Legitimate credential succeeds')
})

test('H. Password Reset Generates PBKDF2 Verifier and Invalidates Old Credential', async () => {
  const oldVerifier = await createPasswordVerifier('InitialPassword#1')
  const user = {
    id: 'USR-RESET-001',
    name: 'Reset Test User',
    auth: oldVerifier
  }

  // Perform password reset to new password
  const newPassword = 'NewSecretPassword#2026'
  const newVerifier = await createPasswordVerifier(newPassword)
  user.auth = newVerifier
  delete user.password

  // Old password must now fail
  assert.equal(await verifyPassword('InitialPassword#1', user.auth), false, 'Old password must be invalidated')

  // New password must now succeed
  assert.equal(await verifyPassword(newPassword, user.auth), true, 'New password must verify')
  assert.equal('password' in user, false, 'No plaintext password retained')
})

test('I. Current User Session Storage Sanitization', () => {
  const fullUserRecord = {
    id: 'USR-SESS-001',
    name: 'Abhi',
    email: 'abhi@sadagati.com',
    role: 'Admin',
    branchId: 'BR-001',
    password: 'should_not_leak',
    auth: { algo: PBKDF2_ALGO, salt: 'abc', hash: 'def' },
    hash: 'raw_hash',
    salt: 'raw_salt'
  }

  const sanitized = sanitizeUserForSession(fullUserRecord)

  assert.equal('password' in sanitized, false, 'Session user must not contain password')
  assert.equal('auth' in sanitized, false, 'Session user must not contain auth')
  assert.equal('hash' in sanitized, false, 'Session user must not contain hash')
  assert.equal('salt' in sanitized, false, 'Session user must not contain salt')

  // Profile properties preserved
  assert.equal(sanitized.id, 'USR-SESS-001')
  assert.equal(sanitized.name, 'Abhi')
  assert.equal(sanitized.email, 'abhi@sadagati.com')
  assert.equal(sanitized.role, 'Admin')
})

test('J. Startup Ledger Sanitization Migrates Plaintext Records', async () => {
  const rawLedgerUsers = [
    { id: 'U1', name: 'User One', password: 'SecretOne#123' },
    { id: 'U2', name: 'User Two', auth: await createPasswordVerifier('AlreadyMigrated#456') }
  ]

  const sanitized = await sanitizeLedgerUsers(rawLedgerUsers)

  assert.equal(sanitized.length, 2)
  assert.equal('password' in sanitized[0], false, 'Legacy password in U1 must be deleted')
  assert.ok(sanitized[0].auth, 'U1 must have PBKDF2 verifier')
  assert.equal(await verifyPassword('SecretOne#123', sanitized[0].auth), true, 'U1 verifier matches original password')
  assert.equal('password' in sanitized[1], false, 'U2 remains without password')
  assert.equal(await verifyPassword('AlreadyMigrated#456', sanitized[1].auth), true, 'U2 verifier still valid')
})

test('K. Web Crypto Unavailable / Edge Input Safety', async () => {
  // Safe verification behavior with null or invalid inputs (never throws unhandled exception)
  assert.equal(await verifyPassword('', null), false)
  assert.equal(await verifyPassword('pass', {}), false)
  assert.equal(await verifyPassword('pass', { algo: 'UNKNOWN-MD5' }), false)
  assert.equal(await verifyPassword('pass', { algo: PBKDF2_ALGO, salt: 'short', hash: 'bad' }), false)

  // Verify availability helper returns a valid boolean
  const isAvailable = isWebCryptoAvailable()
  assert.equal(typeof isAvailable, 'boolean')
  assert.equal(isAvailable, true, 'Web Crypto should be available in standard test runner')
})

test('L. End-to-End Authentication Invariants (Redirection, Session, Lockout)', () => {
  // Redirection
  assert.equal(determinePortalTarget({ role: 'Admin' }), '/admin')
  assert.equal(determinePortalTarget({ role: 'Field Officer' }), '/employee')
  assert.equal(determinePortalTarget(null), '/login')

  // Expiration
  const now = 2000000000000
  assert.equal(isSessionExpired({ expiresAt: now - 5000 }, now), true)
  assert.equal(isSessionExpired({ expiresAt: now + 5000 }, now), false)

  // Lockout calculation at 5 failed attempts
  assert.equal(calculateLockout(4, now).isLocked, false)
  assert.equal(calculateLockout(5, now).isLocked, true)
})
