/**
 * Enterprise Native Web Crypto Authentication Service
 * Sadagati MicroFinance Core ERP
 *
 * Implements PBKDF2-HMAC-SHA256 password verifier derivation and verification
 * using the standard W3C Web Crypto API (globalThis.crypto.subtle).
 * Zero external dependencies.
 */

export const PBKDF2_ALGO = 'PBKDF2-HMAC-SHA256'
export const DEFAULT_ITERATIONS = 100000
export const SALT_BYTES = 16
export const DERIVED_KEY_BITS = 256

/**
 * Check if the native Web Crypto Subtle API is available in the current environment
 */
export function isWebCryptoAvailable() {
  return !!(
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    globalThis.crypto.subtle &&
    typeof globalThis.crypto.subtle.deriveBits === 'function' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  )
}

/**
 * Convert a Uint8Array buffer into a lowercase hex string
 */
export function bufferToHex(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * Convert a hex string into a Uint8Array
 */
export function hexToBuffer(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
export function timingSafeEqualStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Generate a cryptographically random salt
 */
export function generateSalt(byteLength = SALT_BYTES) {
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available in the current execution context.')
  }
  const saltBytes = new Uint8Array(byteLength)
  globalThis.crypto.getRandomValues(saltBytes)
  return saltBytes
}

/**
 * Create a deterministic PBKDF2 password verifier from a plaintext password
 *
 * @param {string} password - User plaintext password
 * @param {Object} [options] - Optional custom iterations or salt (Uint8Array)
 * @returns {Promise<{ algo: string, iterations: number, salt: string, hash: string }>}
 */
export async function createPasswordVerifier(password, options = {}) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string.')
  }
  if (!isWebCryptoAvailable()) {
    throw new Error('Web Crypto API is not available in the current execution context.')
  }

  const iterations = options.iterations || DEFAULT_ITERATIONS
  const saltBytes = options.salt instanceof Uint8Array ? options.salt : generateSalt(SALT_BYTES)
  const saltHex = bufferToHex(saltBytes)

  const encoder = new TextEncoder()
  const passwordBytes = encoder.encode(password)

  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    DERIVED_KEY_BITS
  )

  const hashHex = bufferToHex(derivedBits)

  return {
    algo: PBKDF2_ALGO,
    iterations,
    salt: saltHex,
    hash: hashHex
  }
}

/**
 * Verify a candidate password against a stored verifier object
 *
 * Never throws for ordinary invalid user input; returns false on any mismatch or invalid payload.
 *
 * @param {string} password - Candidate plaintext password
 * @param {Object} auth - Stored credential verifier object
 * @returns {Promise<boolean>} - true if valid, false otherwise
 */
export async function verifyPassword(password, auth) {
  if (typeof password !== 'string' || password.length === 0) {
    return false
  }
  if (!auth || typeof auth !== 'object') {
    return false
  }
  if (auth.algo !== PBKDF2_ALGO) {
    return false
  }
  if (typeof auth.iterations !== 'number' || auth.iterations <= 0) {
    return false
  }
  if (typeof auth.salt !== 'string' || auth.salt.length === 0) {
    return false
  }
  if (typeof auth.hash !== 'string' || auth.hash.length === 0) {
    return false
  }
  if (!isWebCryptoAvailable()) {
    console.warn('[authCryptoService] Web Crypto API is unavailable; verification failed.')
    return false
  }

  try {
    const saltBytes = hexToBuffer(auth.salt)
    if (!saltBytes || saltBytes.length !== SALT_BYTES) {
      return false
    }

    const encoder = new TextEncoder()
    const passwordBytes = encoder.encode(password)

    const keyMaterial = await globalThis.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveBits']
    )

    const candidateBits = await globalThis.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: auth.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      DERIVED_KEY_BITS
    )

    const candidateHashHex = bufferToHex(candidateBits)
    return timingSafeEqualStrings(candidateHashHex, auth.hash.toLowerCase())
  } catch (err) {
    console.warn('[authCryptoService] Verification trapped error:', err)
    return false
  }
}

/**
 * Sanitize any user object for safe storage in session (sadagati_mf_current_user_v1)
 * Strips password, auth, hash, salt, and any raw credential fields.
 *
 * @param {Object} user - User record
 * @returns {Object|null} Clean user object containing only profile/authorization metadata
 */
export function sanitizeUserForSession(user) {
  if (!user || typeof user !== 'object') return null
  const {
    password: _password,
    auth: _auth,
    hash: _hash,
    salt: _salt,
    pin: _pin,
    ...safeUser
  } = user
  return safeUser
}
