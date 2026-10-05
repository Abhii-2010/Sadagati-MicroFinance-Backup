import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DATA_ENTITY_TYPES,
  SYSTEM_FIELD_LABELS,
  autoMapColumn,
  normalizeDate,
  normalizeGender,
  normalizeFrequency,
  normalizeStatus,
  transformRecord,
  detectDuplicates,
  validateRecords,
  calculateReconciliation,
  generateErrorReportCsv,
  generateReconciliationReportText,
  SAMPLE_LEGACY_DATASETS
} from '../src/services/dataMigrationService.js'

test('Data Entity Types and Dependency Order', () => {
  assert.equal(DATA_ENTITY_TYPES.length, 8)
  const branchEntity = DATA_ENTITY_TYPES.find(e => e.id === 'branches')
  const custEntity = DATA_ENTITY_TYPES.find(e => e.id === 'customers')
  const loanEntity = DATA_ENTITY_TYPES.find(e => e.id === 'loans')

  // Dependency order check: Branches must precede Customers, Customers must precede Loans
  assert.ok(branchEntity.order < custEntity.order, 'Branches should be imported before Customers')
  assert.ok(custEntity.order < loanEntity.order, 'Customers should be imported before Loans')
})

test('Column Auto-Mapping Heuristics', () => {
  // Exact match
  const match1 = autoMapColumn('Cust_Code', 'customers')
  assert.equal(match1.field, 'legacyCustomerId')
  assert.equal(match1.confidence, 'high')

  const match2 = autoMapColumn('Mobile_No', 'customers')
  assert.equal(match2.field, 'phone')
  assert.equal(match2.confidence, 'high')

  const match3 = autoMapColumn('Principal_Amt', 'loans')
  assert.equal(match3.field, 'principal')
  assert.equal(match3.confidence, 'high')

  // Substring / partial match
  const match4 = autoMapColumn('Loan_Amount_Sanctioned', 'loans')
  assert.equal(match4.field, 'principal')

  // Unknown column
  const match5 = autoMapColumn('Random_Unrelated_Column', 'customers')
  assert.equal(match5.field, '')
  assert.equal(match5.confidence, 'none')
})

test('Data Normalization Helpers', () => {
  // Date normalization
  assert.equal(normalizeDate('03/10/2026'), '2026-10-03')
  assert.equal(normalizeDate('15-05-1990'), '1990-05-15')
  assert.equal(normalizeDate('2026-10-03'), '2026-10-03')

  // Gender normalization
  assert.equal(normalizeGender('F'), 'Female')
  assert.equal(normalizeGender('M'), 'Male')
  assert.equal(normalizeGender('FEMALE'), 'Female')

  // Frequency normalization
  assert.equal(normalizeFrequency('D'), 'Daily')
  assert.equal(normalizeFrequency('W'), 'Weekly')
  assert.equal(normalizeFrequency('M'), 'Monthly')

  // Status normalization
  assert.equal(normalizeStatus('A'), 'Active')
  assert.equal(normalizeStatus('C'), 'Closed')
  assert.equal(normalizeStatus('NPA'), 'NPA')
})

test('Data Transformation and Exact Monetary Values', () => {
  const rawRow = {
    Cust_Code: 'LEG-1001',
    Cust_Name: ' Sita Devi ',
    DOB: '12/05/1990',
    Gender: 'F',
    Monthly_Income: '₹ 25,000',
    Mobile_No: '9829011223'
  }
  const mapping = {
    Cust_Code: 'legacyCustomerId',
    Cust_Name: 'name',
    DOB: 'dob',
    Gender: 'gender',
    Monthly_Income: 'monthlyIncome',
    Mobile_No: 'phone'
  }

  const transformed = transformRecord(rawRow, 'customers', mapping)
  assert.equal(transformed.legacyCustomerId, 'LEG-1001')
  assert.equal(transformed.name, 'Sita Devi')
  assert.equal(transformed.dob, '1990-05-12')
  assert.equal(transformed.gender, 'Female')
  assert.equal(transformed.monthlyIncome, 25000)
  assert.equal(transformed.phone, '9829011223')
})

test('Duplicate Detection Engine', () => {
  const existingCustomers = [
    {
      id: 'SGTPL000001',
      legacyCustomerId: 'LEG-1001',
      phone: '9829011223',
      aadhaarNumber: '987654321012',
      name: 'Sunita Sharma',
      center: 'Center #14'
    }
  ]

  // Test 1: Match by Legacy ID
  const dup1 = detectDuplicates({ legacyCustomerId: 'LEG-1001', phone: '9999999999' }, existingCustomers, 'customers')
  assert.equal(dup1.isDuplicate, true)
  assert.equal(dup1.matchType, 'EXACT')
  assert.equal(dup1.field, 'Legacy ID')

  // Test 2: Match by Phone
  const dup2 = detectDuplicates({ legacyCustomerId: 'LEG-9999', phone: '9829011223' }, existingCustomers, 'customers')
  assert.equal(dup2.isDuplicate, true)
  assert.equal(dup2.matchType, 'EXACT')
  assert.equal(dup2.field, 'Mobile Number')

  // Test 3: New customer (no match)
  const dup3 = detectDuplicates({ legacyCustomerId: 'LEG-9999', phone: '9829099887' }, existingCustomers, 'customers')
  assert.equal(dup3.isDuplicate, false)
})

test('Validation Engine with Errors, Warnings and Valid Records', () => {
  const sampleRows = [
    // Valid record
    { name: 'Kavita Devi', phone: '9829011223', monthlyIncome: 20000 },
    // Missing required field (name)
    { name: '', phone: '9829022334', monthlyIncome: 15000 },
    // Non-numeric income
    { name: 'Pooja Verma', phone: '9829033445', monthlyIncome: 'INVALID' },
    // Incomplete phone number (warning)
    { name: 'Meena Bai', phone: '98290', monthlyIncome: 18000 }
  ]
  const mapping = { name: 'name', phone: 'phone', monthlyIncome: 'monthlyIncome' }

  const result = validateRecords(sampleRows, 'customers', mapping, [])
  assert.equal(result.total, 4)
  assert.equal(result.valid, 2) // 2 records have fatal errors
  assert.equal(result.errors.length, 2)
  assert.ok(result.warnings.length >= 1)
})

test('Financial Reconciliation Calculation', () => {
  const sourceLoans = [
    { principal: 25000 },
    { principal: 35000 },
    { principal: 40000 }
  ]
  const importedLoans = [
    { principal: 25000 },
    { principal: 35000 },
    { principal: 40000 }
  ]

  const recon = calculateReconciliation(sourceLoans, importedLoans, 'loans')
  assert.equal(recon.sourceCount, 3)
  assert.equal(recon.importedCount, 3)
  assert.equal(recon.countDiff, 0)
  assert.equal(recon.sourceFinancialTotal, 100000)
  assert.equal(recon.importedFinancialTotal, 100000)
  assert.equal(recon.financialDiff, 0)
  assert.equal(recon.status, 'MATCHED')
})

test('Sample Legacy Datasets Integrity', () => {
  assert.ok(SAMPLE_LEGACY_DATASETS.customers.rows.length >= 8)
  assert.ok(SAMPLE_LEGACY_DATASETS.loans.rows.length >= 5)
  assert.ok(SAMPLE_LEGACY_DATASETS.payments.rows.length >= 5)
  assert.ok(SAMPLE_LEGACY_DATASETS.branches.rows.length >= 3)

  // Verify customers have essential legacy fields
  const firstCust = SAMPLE_LEGACY_DATASETS.customers.rows[0]
  assert.ok(firstCust.Cust_Code)
  assert.ok(firstCust.Cust_Name)
  assert.ok(firstCust.Mobile_No)
})

test('Report Generators produce valid CSV and text', () => {
  const errors = [
    { row: 2, field: 'Full Name', severity: 'CRITICAL', message: 'Missing required field: Full Name', suggestedAction: 'Provide name' }
  ]
  const csv = generateErrorReportCsv(errors)
  assert.ok(csv.includes('Row Number,Field,Severity,Error Message,Suggested Action'))
  assert.ok(csv.includes('Missing required field: Full Name'))

  const reconText = generateReconciliationReportText({
    runId: 'MIG-TEST',
    sourceFile: 'test.csv',
    entityType: 'loans',
    sourceCount: 10,
    importedCount: 10,
    countDiff: 0,
    sourceFinancialTotal: 250000,
    importedFinancialTotal: 250000,
    financialDiff: 0,
    status: 'MATCHED'
  })
  assert.ok(reconText.includes('PASSED (Zero Discrepancy)'))
  assert.ok(reconText.includes('₹2,50,000'))
})
