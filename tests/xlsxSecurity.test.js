import test from 'node:test'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'

test('XLSX Secure Parsing & Prototype Pollution Defense', () => {
  // 1. Create a synthetic workbook in memory with potentially dangerous keys
  const maliciousData = [
    {
      cust_name: 'Suresh Kumar',
      mobile_no: '9876543210',
      '__proto__': 'polluted',
      'constructor': 'exploit',
      'prototype': 'override'
    },
    {
      cust_name: 'Pooja Verma',
      mobile_no: '9123456780',
      principal_amt: '50000'
    }
  ]

  const ws = XLSX.utils.json_to_sheet(maliciousData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'TestSheet')
  const wbBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  // 2. Read back with security flags enabled (as in DataMigrationView)
  const parsedWb = XLSX.read(wbBuf, {
    type: 'buffer',
    cellFormula: false,
    cellHTML: false,
    cellText: false
  })

  assert.ok(parsedWb.SheetNames.includes('TestSheet'), 'Sheet name correctly detected')
  const sheet = parsedWb.Sheets['TestSheet']
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
  const sanitizedRows = rawRows.map(row => {
    const cleanRow = {}
    for (const [key, val] of Object.entries(row)) {
      const cleanKey = String(key).trim()
      if (!cleanKey || DANGEROUS_KEYS.has(cleanKey)) continue
      if (typeof val === 'function') continue
      cleanRow[cleanKey] = val === undefined || val === null ? '' : val
    }
    return cleanRow
  })

  const headers = sanitizedRows.length > 0
    ? Object.keys(sanitizedRows[0]).filter(h => !DANGEROUS_KEYS.has(h))
    : []

  // Assertions
  assert.equal(sanitizedRows.length, 2)
  assert.ok(headers.includes('cust_name'))
  assert.ok(headers.includes('mobile_no'))
  assert.ok(!headers.includes('__proto__'), 'Must exclude __proto__')
  assert.ok(!headers.includes('constructor'), 'Must exclude constructor')
  assert.ok(!headers.includes('prototype'), 'Must exclude prototype')

  // Verify Object.prototype was NOT polluted
  assert.equal(Object.prototype.polluted, undefined)
  assert.equal(({}).polluted, undefined)
})
