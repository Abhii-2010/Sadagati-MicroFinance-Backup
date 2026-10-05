import test from 'node:test'
import assert from 'node:assert/strict'
import {
  safeSaveLedger,
  safeLoadLedger,
  calculateChecksum,
  validateLedgerStructure,
  safeStringify,
  safeParse,
  rotateBackups,
  createLedgerEnvelope,
  PRIMARY_LEDGER_KEY,
  LEGACY_LEDGER_KEY,
  BACKUP_KEY_PREFIX,
  CORRUPTED_KEY_PREFIX,
  MAX_BACKUPS
} from '../src/services/storageService.js'

/**
 * In-memory Mock Storage implementation for test isolation
 */
function createMockStorage(options = {}) {
  const map = new Map()
  let quotaErrorTrigger = options.failOnSetItem || false

  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null
    },
    setItem(key, value) {
      if (quotaErrorTrigger) {
        const err = new Error('QuotaExceededError: The quota has been exceeded.')
        err.name = 'QuotaExceededError'
        err.code = 22
        throw err
      }
      map.set(key, String(value))
    },
    removeItem(key) {
      map.delete(key)
    },
    clear() {
      map.clear()
    },
    get length() {
      return map.size
    },
    key(index) {
      const keys = Array.from(map.keys())
      return keys[index] || null
    },
    setQuotaError(enable) {
      quotaErrorTrigger = enable
    },
    _rawMap: map
  }
}

function getValidMockState(identifier = '1') {
  return {
    metrics: { totalPortfolio: 100000, activeLoans: 10 },
    customers: [{ id: `CUST-${identifier}`, name: 'Ramesh Sharma', phone: '9876543210' }],
    loans: [{ id: `LN-${identifier}`, customerId: `CUST-${identifier}`, principal: 50000 }],
    loanProducts: [{ id: 'LP-1', name: 'Micro Business Loan' }],
    branches: [{ id: 'BR-1', name: 'Patna Central' }],
    users: [{ id: 'U-1', username: 'admin' }],
    settings: { company: { name: 'Sadagati MicroFinance' } },
    disbursements: [],
    recentPayments: [],
    auditLogs: []
  }
}

// ── TEST A: Normal persistence (save state, reload state, verify identical data) ──
test('A. Normal Persistence: save state, reload state, verify identical data', () => {
  const storage = createMockStorage()
  const originalState = getValidMockState('A')

  const saveRes = safeSaveLedger(originalState, storage)
  assert.equal(saveRes.success, true, 'Save should succeed')
  assert.ok(saveRes.checksum, 'Should produce a checksum')

  const loadRes = safeLoadLedger(storage)
  assert.equal(loadRes.source, 'primary')
  assert.equal(loadRes.data.customers[0].name, 'Ramesh Sharma')
  assert.equal(loadRes.data.loans[0].principal, 50000)
  assert.equal(loadRes.data.metrics.totalPortfolio, 100000)
})

// ── TEST B: Corrupted primary storage (inject invalid JSON, verify recovery from backup) ──
test('B. Corrupted Primary Storage: inject invalid JSON, verify application recovers from backup', () => {
  const storage = createMockStorage()
  const state1 = getValidMockState('INITIAL')
  const state2 = getValidMockState('UPDATED')

  // First save state 1
  safeSaveLedger(state1, storage)
  // Second save state 2 -> state 1 moves into backup_1
  safeSaveLedger(state2, storage)

  // Verify backup 1 exists
  assert.ok(storage.getItem(`${BACKUP_KEY_PREFIX}1`), 'Backup 1 should exist')

  // Now corrupt the primary key with broken JSON
  storage.setItem(PRIMARY_LEDGER_KEY, '{"corrupted": true, [malformed_syntax}')

  // Load ledger
  const loadRes = safeLoadLedger(storage)
  assert.equal(loadRes.source, 'backup_1', 'Should recover from backup_1')
  assert.equal(loadRes.recoveredFromBackup, true)
  assert.equal(loadRes.data.customers[0].id, 'CUST-INITIAL')

  // Check that corrupted data was preserved
  let preservedCount = 0
  for (let i = 0; i < storage.length; i++) {
    if (storage.key(i)?.startsWith(CORRUPTED_KEY_PREFIX)) {
      preservedCount++
    }
  }
  assert.ok(preservedCount > 0, 'Corrupted raw data must be preserved under a backup key')
})

// ── TEST C: Corrupted backup (verify invalid backup is skipped) ──
test('C. Corrupted Backup: verify invalid backup is skipped to next valid backup', () => {
  const storage = createMockStorage()
  const state1 = getValidMockState('OLDEST')
  const state2 = getValidMockState('MIDDLE')
  const state3 = getValidMockState('LATEST')

  safeSaveLedger(state1, storage)
  safeSaveLedger(state2, storage)
  safeSaveLedger(state3, storage)

  // Corrupt primary key
  storage.setItem(PRIMARY_LEDGER_KEY, '{ invalid_json_primary')
  // Corrupt backup 1
  storage.setItem(`${BACKUP_KEY_PREFIX}1`, '{ corrupted_backup_1')

  // Load ledger -> should skip corrupted backup 1 and recover from backup 2
  const loadRes = safeLoadLedger(storage)
  assert.equal(loadRes.source, 'backup_2', 'Should skip corrupted backup 1 and use backup 2')
  assert.equal(loadRes.data.customers[0].id, 'CUST-OLDEST')
})

// ── TEST D: QuotaExceededError (simulate a failed LocalStorage write, verify previous state intact) ──
test('D. QuotaExceededError: simulate failed write, verify previous valid state remains intact', () => {
  const storage = createMockStorage()
  const validState = getValidMockState('STABLE')

  // Successfully write initial state
  const initialRes = safeSaveLedger(validState, storage)
  assert.equal(initialRes.success, true)

  const primaryContentBefore = storage.getItem(PRIMARY_LEDGER_KEY)

  // Now simulate storage quota exhausted
  storage.setQuotaError(true)

  const newState = getValidMockState('TOO_LARGE')
  const failedRes = safeSaveLedger(newState, storage)

  assert.equal(failedRes.success, false)
  assert.equal(failedRes.isQuota, true)

  // Turn quota error off to inspect storage
  storage.setQuotaError(false)

  // Verify primary key was NEVER destroyed or modified
  const primaryContentAfter = storage.getItem(PRIMARY_LEDGER_KEY)
  assert.equal(primaryContentBefore, primaryContentAfter, 'Primary key must be completely preserved')

  // And safeLoadLedger still loads the stable state
  const loadRes = safeLoadLedger(storage)
  assert.equal(loadRes.data.customers[0].id, 'CUST-STABLE')
})

// ── TEST E: Serialization failure (circular structure, verify previous state intact) ──
test('E. Serialization Failure: simulate circular reference, verify previous state remains intact', () => {
  const storage = createMockStorage()
  const validState = getValidMockState('VALID')
  safeSaveLedger(validState, storage)

  const primaryContentBefore = storage.getItem(PRIMARY_LEDGER_KEY)

  // Create an object with circular reference
  const circularState = getValidMockState('CIRCULAR')
  circularState.self = circularState

  const failRes = safeSaveLedger(circularState, storage)
  assert.equal(failRes.success, false)
  assert.equal(failRes.isSerializationError, true)

  // Verify storage was not altered
  const primaryContentAfter = storage.getItem(PRIMARY_LEDGER_KEY)
  assert.equal(primaryContentBefore, primaryContentAfter, 'Primary key must not be altered')
})

// ── TEST F: Backup rotation (create multiple backups, verify only configured number remains) ──
test('F. Backup Rotation: rotate multiple saves and enforce MAX_BACKUPS limit', () => {
  const storage = createMockStorage()

  // Save 5 successive versions
  for (let i = 1; i <= 5; i++) {
    safeSaveLedger(getValidMockState(`V${i}`), storage)
  }

  // Check backup keys in storage
  assert.ok(storage.getItem(`${BACKUP_KEY_PREFIX}1`), 'backup_1 should exist')
  assert.ok(storage.getItem(`${BACKUP_KEY_PREFIX}2`), 'backup_2 should exist')
  assert.ok(storage.getItem(`${BACKUP_KEY_PREFIX}3`), 'backup_3 should exist')
  assert.equal(storage.getItem(`${BACKUP_KEY_PREFIX}4`), null, 'backup_4 must NOT exist')

  // Verify newest backup is V4, next is V3, oldest is V2
  const b1 = JSON.parse(storage.getItem(`${BACKUP_KEY_PREFIX}1`))
  const b2 = JSON.parse(storage.getItem(`${BACKUP_KEY_PREFIX}2`))
  const b3 = JSON.parse(storage.getItem(`${BACKUP_KEY_PREFIX}3`))

  assert.equal(b1.data.customers[0].id, 'CUST-V4')
  assert.equal(b2.data.customers[0].id, 'CUST-V3')
  assert.equal(b3.data.customers[0].id, 'CUST-V2')
})

// ── TEST G: Recovery with no valid backup (safely returns default state without crashing) ──
test('G. Recovery with No Valid Backup: safely initializes default state without crashing', () => {
  const storage = createMockStorage()

  // Storage is completely empty
  const loadEmpty = safeLoadLedger(storage)
  assert.equal(loadEmpty.source, 'default')
  assert.equal(loadEmpty.data, null)

  // Storage has garbage in all keys
  storage.setItem(PRIMARY_LEDGER_KEY, 'corrupt')
  storage.setItem(`${BACKUP_KEY_PREFIX}1`, 'corrupt')
  storage.setItem(`${BACKUP_KEY_PREFIX}2`, 'corrupt')
  storage.setItem(`${BACKUP_KEY_PREFIX}3`, 'corrupt')

  const loadCorrupt = safeLoadLedger(storage)
  assert.equal(loadCorrupt.source, 'default')
  assert.equal(loadCorrupt.data, null)
})

// ── TEST H: Checksum Integrity Validation ──
test('H. Checksum Integrity: detects single-character tampering in payload', () => {
  const testStr = JSON.stringify({ customers: [{ id: '1', name: 'Anita' }] })
  const sum1 = calculateChecksum(testStr)
  assert.equal(typeof sum1, 'string')
  assert.equal(sum1.length, 8)

  // Tamper with one character
  const tamperedStr = JSON.stringify({ customers: [{ id: '1', name: 'Anite' }] })
  const sum2 = calculateChecksum(tamperedStr)
  assert.notEqual(sum1, sum2, 'Checksum must change when payload is modified')
})

// ── TEST I: Backward compatibility with legacy unenveloped state ──
test('I. Backward Compatibility: successfully reads legacy unenveloped localStorage key', () => {
  const storage = createMockStorage()
  const legacyState = getValidMockState('LEGACY')

  // Store directly as raw JSON in legacy key
  storage.setItem(LEGACY_LEDGER_KEY, JSON.stringify(legacyState))

  const loadRes = safeLoadLedger(storage)
  assert.equal(loadRes.source, 'legacy')
  assert.equal(loadRes.data.customers[0].id, 'CUST-LEGACY')
})
