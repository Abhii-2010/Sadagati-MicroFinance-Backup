/**
 * Enterprise Safe LocalStorage Persistence & Recovery Service
 * Sadagati MicroFinance Core ERP
 * 
 * Provides atomic-style writes, rolling versioned backups, FNV-1a integrity checksums,
 * corruption detection, automated fallback recovery, quota protection, and data export.
 */

export const PRIMARY_LEDGER_KEY = 'sadagati_mf_ledger_v1'
export const LEGACY_LEDGER_KEY = 'sadagati_mf_dashboard_state_v6'
export const STAGING_LEDGER_KEY = 'sadagati_mf_ledger_staging'
export const BACKUP_KEY_PREFIX = 'sadagati_mf_ledger_backup_'
export const CORRUPTED_KEY_PREFIX = 'sadagati_mf_ledger_corrupted_'
export const MAX_BACKUPS = 3
export const SCHEMA_VERSION = 1

/**
 * 32-bit FNV-1a Checksum
 * Fast, pure JavaScript, 0 external dependencies.
 * Deterministic and sensitive to single-bit/byte changes.
 */
export function calculateChecksum(str) {
  if (typeof str !== 'string') return ''
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Safe localStorage provider resolver (browser or test environment)
 */
export function getLocalStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return null
}

/**
 * Safe JSON serializer with circular-reference & error trapping
 */
export function safeStringify(data) {
  try {
    const json = JSON.stringify(data)
    return { success: true, json, sizeBytes: json.length * 2 }
  } catch (err) {
    return { success: false, error: err.message || 'Serialization failed', isSerializationError: true }
  }
}

/**
 * Safe JSON parser with error trapping
 */
export function safeParse(str) {
  if (!str || typeof str !== 'string') {
    return { success: false, error: 'Empty or non-string payload' }
  }
  try {
    const data = JSON.parse(str)
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err.message || 'Malformed JSON syntax', isSyntaxError: true }
  }
}

/**
 * Validate that an object has expected core ledger structure
 */
export function validateLedgerStructure(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false
  }
  // Expected key footprint of Sadagati MicroFinance Core State
  const recognizedKeys = [
    'customers',
    'loans',
    'metrics',
    'loanProducts',
    'branches',
    'users',
    'settings',
    'disbursements',
    'recentPayments',
    'auditLogs'
  ]
  const matchedKeys = recognizedKeys.filter(k => Object.prototype.hasOwnProperty.call(obj, k))
  // A valid state payload must contain at least 2 recognized core keys
  return matchedKeys.length >= 2
}

/**
 * Check if an error represents storage quota exhaustion
 */
export function isQuotaError(err) {
  if (!err) return false
  const name = err.name || ''
  const code = err.code
  return (
    name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    code === 22 ||
    code === 1014 ||
    err.number === -2147024882
  )
}

/**
 * Envelope raw state data with metadata, checksum & schema version
 */
export function createLedgerEnvelope(data) {
  const serializeRes = safeStringify(data)
  if (!serializeRes.success) {
    return { success: false, error: serializeRes.error, isSerializationError: true }
  }
  const checksum = calculateChecksum(serializeRes.json)
  return {
    success: true,
    envelope: {
      _schemaVersion: SCHEMA_VERSION,
      _timestamp: Date.now(),
      _checksum: checksum,
      _payloadLength: serializeRes.json.length,
      data
    }
  }
}

/**
 * Rotate versioned rolling backups (e.g. backup_1 -> backup_2 -> backup_3)
 */
export function rotateBackups(storage = getLocalStorage()) {
  if (!storage) return false
  try {
    // Current primary state to become backup 1
    const currentPrimary = storage.getItem(PRIMARY_KEY_KEY_RESOLVER(storage))
    if (!currentPrimary) return false

    // Shift 2 -> 3
    const backup2 = storage.getItem(`${BACKUP_KEY_PREFIX}2`)
    if (backup2) {
      try {
        storage.setItem(`${BACKUP_KEY_PREFIX}3`, backup2)
      } catch (e) {
        if (isQuotaError(e)) {
          // If quota hit while shifting to 3, remove oldest to conserve space
          storage.removeItem(`${BACKUP_KEY_PREFIX}3`)
        }
      }
    }

    // Shift 1 -> 2
    const backup1 = storage.getItem(`${BACKUP_KEY_PREFIX}1`)
    if (backup1) {
      try {
        storage.setItem(`${BACKUP_KEY_PREFIX}2`, backup1)
      } catch (e) {
        if (isQuotaError(e)) {
          storage.removeItem(`${BACKUP_KEY_PREFIX}2`)
        }
      }
    }

    // Primary -> 1
    try {
      storage.setItem(`${BACKUP_KEY_PREFIX}1`, currentPrimary)
      return true
    } catch (e) {
      if (isQuotaError(e)) {
        // Free oldest backup to fit backup 1
        storage.removeItem(`${BACKUP_KEY_PREFIX}3`)
        try {
          storage.setItem(`${BACKUP_KEY_PREFIX}1`, currentPrimary)
          return true
        } catch {
          return false
        }
      }
      return false
    }
  } catch {
    return false
  }
}

function PRIMARY_KEY_KEY_RESOLVER(storage) {
  if (storage.getItem(PRIMARY_LEDGER_KEY)) return PRIMARY_LEDGER_KEY
  if (storage.getItem(LEGACY_LEDGER_KEY)) return LEGACY_LEDGER_KEY
  return PRIMARY_LEDGER_KEY
}

/**
 * 1. SAFE STORAGE WRITE (Atomic Staging + Backup Rotation + Quota Protection)
 */
export function safeSaveLedger(stateData, storage = getLocalStorage()) {
  if (!storage) {
    return { success: false, error: 'LocalStorage not available' }
  }

  // 1. Validate structure before writing
  if (!validateLedgerStructure(stateData)) {
    return { success: false, error: 'Invalid ledger structure rejected', isValidationError: true }
  }

  // 2. Prepare envelope & serialization
  const envResult = createLedgerEnvelope(stateData)
  if (!envResult.success) {
    return {
      success: false,
      error: envResult.error,
      isSerializationError: true
    }
  }

  const serializeResult = safeStringify(envResult.envelope)
  if (!serializeResult.success) {
    return {
      success: false,
      error: serializeResult.error,
      isSerializationError: true
    }
  }

  const payloadString = serializeResult.json
  const estimatedSizeBytes = serializeResult.sizeBytes

  // 3. Atomic-style staging write:
  // Write to temporary STAGING key first. If this throws QuotaExceededError,
  // the PRIMARY key is NEVER touched, protecting previously persisted state.
  try {
    storage.setItem(STAGING_LEDGER_KEY, payloadString)
  } catch (err) {
    try {
      storage.removeItem(STAGING_LEDGER_KEY)
    } catch {
      // ignore
    }
    return {
      success: false,
      error: err.message || 'Storage write failed',
      isQuota: isQuotaError(err),
      estimatedSizeBytes
    }
  }

  // 4. Staging succeeded -> We have verified storage capacity.
  // Now safely rotate backups before replacing primary.
  const existingPrimary = storage.getItem(PRIMARY_LEDGER_KEY) || storage.getItem(LEGACY_LEDGER_KEY)
  if (existingPrimary && existingPrimary !== payloadString) {
    rotateBackups(storage)
  }

  // 5. Commit to primary key
  try {
    storage.setItem(PRIMARY_LEDGER_KEY, payloadString)
    // Clean up staging key
    storage.removeItem(STAGING_LEDGER_KEY)
    return {
      success: true,
      sizeBytes: estimatedSizeBytes,
      checksum: envResult.envelope._checksum
    }
  } catch (err) {
    // If commit failed unexpectedly, staging key holds the state
    return {
      success: false,
      error: err.message || 'Commit to primary key failed',
      isQuota: isQuotaError(err)
    }
  }
}

/**
 * Unpack raw string and verify integrity
 */
function unpackAndVerify(rawString) {
  const parseRes = safeParse(rawString)
  if (!parseRes.success) {
    return { valid: false, error: parseRes.error, isSyntaxError: true }
  }

  const parsed = parseRes.data

  // Case A: Enveloped payload
  if (parsed && typeof parsed === 'object' && parsed._checksum && parsed.data) {
    const innerSerialized = JSON.stringify(parsed.data)
    const expectedChecksum = calculateChecksum(innerSerialized)
    if (parsed._checksum !== expectedChecksum) {
      return { valid: false, error: 'Checksum mismatch (data corruption detected)' }
    }
    if (!validateLedgerStructure(parsed.data)) {
      return { valid: false, error: 'Malformed inner ledger state' }
    }
    return { valid: true, data: parsed.data, metadata: parsed }
  }

  // Case B: Raw unenveloped legacy payload
  if (validateLedgerStructure(parsed)) {
    return { valid: true, data: parsed, metadata: { _schemaVersion: 0 } }
  }

  return { valid: false, error: 'Unrecognized top-level state structure' }
}

/**
 * 2. SAFE STORAGE READ & STARTUP RECOVERY SEQUENCE
 * 
 * Logic:
 * 1. Primary exists & valid -> use primary
 * 2. Primary corrupted -> preserve raw corrupted string, try backup 1
 * 3. Backup 1 invalid -> try backup 2
 * 4. Backup 2 invalid -> try backup 3
 * 5. Backup 3 invalid -> try legacy key
 * 6. No valid backup -> return default initial state (null)
 */
export function safeLoadLedger(storage = getLocalStorage()) {
  if (!storage) {
    return { data: null, source: 'none', message: 'Storage not available' }
  }

  // Step 1: Check primary key
  const primaryRaw = storage.getItem(PRIMARY_LEDGER_KEY)
  if (primaryRaw) {
    const verified = unpackAndVerify(primaryRaw)
    if (verified.valid) {
      return {
        data: verified.data,
        source: 'primary',
        metadata: verified.metadata
      }
    }

    // Primary is corrupted! Preserve raw content
    try {
      const corruptKey = `${CORRUPTED_KEY_PREFIX}${Date.now()}`
      storage.setItem(corruptKey, primaryRaw)
    } catch {
      // ignore
    }
  }

  // Step 2: Try versioned backups in sequence (1 -> 2 -> 3)
  for (let i = 1; i <= MAX_BACKUPS; i++) {
    const backupKey = `${BACKUP_KEY_PREFIX}${i}`
    const backupRaw = storage.getItem(backupKey)
    if (backupRaw) {
      const verified = unpackAndVerify(backupRaw)
      if (verified.valid) {
        return {
          data: verified.data,
          source: `backup_${i}`,
          recoveredFromBackup: true,
          metadata: verified.metadata
        }
      }
    }
  }

  // Step 3: Try legacy key (backward compatibility)
  const legacyRaw = storage.getItem(LEGACY_LEDGER_KEY)
  if (legacyRaw) {
    const verified = unpackAndVerify(legacyRaw)
    if (verified.valid) {
      return {
        data: verified.data,
        source: 'legacy',
        recoveredFromBackup: true,
        metadata: verified.metadata
      }
    }
  }

  // Step 4: No valid backup exists
  return {
    data: null,
    source: 'default',
    recoveredFromBackup: false,
    message: 'No valid primary or backup found. Initialized fresh state.'
  }
}

/**
 * 6. EXPORT RECOVERY
 * Triggers a browser download of the current ledger state as a JSON file.
 */
export function exportLedgerBackupFile(data, filename) {
  if (!data) return false
  try {
    const dateStr = new Date().toISOString().slice(0, 10)
    const envRes = createLedgerEnvelope(data)
    const jsonStr = envRes.success ? JSON.stringify(envRes.envelope, null, 2) : JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })

    if (typeof window !== 'undefined' && window.document) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = finalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      return true
    }
    return false
  } catch (err) {
    console.error('Failed to export backup file:', err)
    return false
  }
}

/**
 * Diagnostic inspector for storage health and usage
 */
export function getStorageDiagnostics(storage = getLocalStorage()) {
  if (!storage) {
    return { available: false, totalUsedBytes: 0, backups: [], corruptedKeys: [] }
  }

  let totalChars = 0
  const backups = []
  const corruptedKeys = []
  let primarySizeChars = 0

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key) continue
    const val = storage.getItem(key) || ''
    const len = key.length + val.length
    totalChars += len

    if (key === PRIMARY_LEDGER_KEY || key === LEGACY_LEDGER_KEY) {
      primarySizeChars = val.length
    } else if (key.startsWith(BACKUP_KEY_PREFIX)) {
      backups.push({ key, sizeChars: val.length, valid: unpackAndVerify(val).valid })
    } else if (key.startsWith(CORRUPTED_KEY_PREFIX)) {
      corruptedKeys.push(key)
    }
  }

  // Standard browser quota is approx 5MB = ~5,242,880 chars
  const ESTIMATED_MAX_CHARS = 5242880
  const usagePercent = Math.min(100, (totalChars / ESTIMATED_MAX_CHARS) * 100).toFixed(1)

  return {
    available: true,
    totalUsedChars: totalChars,
    totalUsedBytesApprox: totalChars * 2,
    primarySizeChars,
    usagePercent: Number(usagePercent),
    backups,
    corruptedCount: corruptedKeys.length
  }
}
