/**
 * Enterprise Legacy Microfinance Data Migration Service
 * Sadagati MicroFinance Core ERP
 * 
 * Provides parsing, column auto-mapping, transformation,
 * duplicate detection, validation, financial reconciliation,
 * and report generation for legacy MF desktop exports.
 */

// ── 1. DATA ENTITY DEFINITIONS & DEPENDENCY ORDER ──
export const DATA_ENTITY_TYPES = [
  {
    id: 'branches',
    label: 'Branches',
    order: 1,
    description: 'Branch offices & operational zones',
    fields: ['branchCode', 'branchName', 'address', 'district', 'state', 'pincode', 'phone', 'manager', 'status']
  },
  {
    id: 'employees',
    label: 'Employees',
    order: 2,
    description: 'Staff & field recovery officers',
    fields: ['name', 'email', 'phone', 'role', 'branch', 'designation', 'status']
  },
  {
    id: 'customers',
    label: 'Customers',
    order: 3,
    description: 'Borrower KYC, addresses & income profiles',
    fields: ['legacyCustomerId', 'name', 'fatherName', 'phone', 'altPhone', 'dob', 'gender', 'address', 'city', 'district', 'state', 'pincode', 'occupation', 'monthlyIncome', 'aadhaar', 'pan', 'center', 'kycStatus']
  },
  {
    id: 'loan_products',
    label: 'Loan Products',
    order: 4,
    description: 'Loan schemes, limits & interest slabs',
    fields: ['productName', 'interestRate', 'loanType', 'minAmount', 'maxAmount', 'minTenure', 'maxTenure', 'status']
  },
  {
    id: 'loans',
    label: 'Loans',
    order: 5,
    description: 'Disbursed active & closed loan accounts',
    fields: ['legacyLoanId', 'customerId', 'borrowerName', 'branch', 'product', 'principal', 'disbursedAmount', 'interestRate', 'tenure', 'frequency', 'emi', 'disbursedDate', 'outstanding', 'status', 'center']
  },
  {
    id: 'payments',
    label: 'Payments',
    order: 6,
    description: 'EMI collections & historical receipts',
    fields: ['receiptId', 'loanId', 'borrowerName', 'amount', 'date', 'mode', 'collector', 'txnRef', 'status']
  },
  {
    id: 'disbursements',
    label: 'Disbursements',
    order: 7,
    description: 'Fund disbursement records & bank payouts',
    fields: ['disbursementId', 'loanId', 'borrowerName', 'amount', 'date', 'channel', 'status']
  },
  {
    id: 'accounting',
    label: 'Accounting',
    order: 8,
    description: 'Opening balances & ledger journals',
    fields: ['entryId', 'date', 'account', 'debit', 'credit', 'narration', 'type']
  }
]

// ── 2. SYSTEM FIELD LABELS ──
export const SYSTEM_FIELD_LABELS = {
  // Common
  status: 'Status',
  date: 'Date',
  amount: 'Amount',
  // Branches
  branchCode: 'Branch Code',
  branchName: 'Branch Name',
  address: 'Address Line',
  district: 'District',
  state: 'State',
  pincode: 'PIN Code',
  manager: 'Branch Manager',
  // Employees
  name: 'Full Name',
  email: 'Email Address',
  phone: 'Mobile / Phone Number',
  altPhone: 'Alternate Mobile',
  role: 'User Role',
  branch: 'Branch',
  designation: 'Designation',
  // Customers
  legacyCustomerId: 'Legacy Customer ID',
  fatherName: 'Father / Husband Name',
  dob: 'Date of Birth (YYYY-MM-DD)',
  gender: 'Gender',
  city: 'City / Locality',
  occupation: 'Occupation / Employment',
  monthlyIncome: 'Monthly Income (₹)',
  aadhaar: 'Aadhaar Number',
  pan: 'PAN Number',
  center: 'Center / Group Name',
  kycStatus: 'KYC Status',
  // Loan Products
  productName: 'Product Scheme Name',
  interestRate: 'Interest Rate (%)',
  loanType: 'Loan Category',
  minAmount: 'Minimum Amount (₹)',
  maxAmount: 'Maximum Amount (₹)',
  minTenure: 'Minimum Tenure',
  maxTenure: 'Maximum Tenure',
  // Loans
  legacyLoanId: 'Legacy Loan No / ID',
  customerId: 'Customer ID',
  borrowerName: 'Borrower Name',
  product: 'Product / Scheme',
  principal: 'Principal Amount (₹)',
  disbursedAmount: 'Disbursed Amount (₹)',
  tenure: 'Tenure (Months/Weeks)',
  frequency: 'Repayment Frequency',
  emi: 'EMI Amount (₹)',
  disbursedDate: 'Disbursement Date',
  outstanding: 'Outstanding Balance (₹)',
  // Payments
  receiptId: 'Receipt / Voucher No',
  loanId: 'Loan Account No',
  mode: 'Payment Mode (Cash/UPI)',
  collector: 'Collecting Officer',
  txnRef: 'Transaction Reference',
  // Disbursements
  disbursementId: 'Disbursement ID',
  channel: 'Payout Channel',
  // Accounting
  entryId: 'Voucher Entry ID',
  account: 'General Ledger Account',
  debit: 'Debit (₹)',
  credit: 'Credit (₹)',
  narration: 'Narration / Remarks',
  type: 'Voucher Type'
}

// ── 3. COLUMN ALIAS MAP FOR AUTO-MAPPING ──
export const COLUMN_ALIAS_MAP = {
  legacyCustomerId: ['cust_code', 'cust_id', 'customer_code', 'custid', 'client_id', 'borrower_id', 'cid', 'member_no'],
  name: ['cust_name', 'name', 'full_name', 'customer_name', 'borrower_name', 'member_name', 'client_name', 'party_name', 'applicant_name'],
  fatherName: ['father_name', 'father_husband', 'f_name', 'fh_name', 'guardian', 'father_or_husband'],
  phone: ['mobile_no', 'mobile', 'phone', 'contact_no', 'phone_number', 'mobile_number', 'cell_no', 'contact_phone'],
  altPhone: ['alt_mobile', 'alt_phone', 'secondary_phone', 'emergency_contact', 'other_mobile'],
  dob: ['dob', 'date_of_birth', 'birth_date', 'birthdate'],
  gender: ['gender', 'sex'],
  address: ['address', 'address_line', 'addr', 'residential_address', 'full_address'],
  city: ['city', 'town', 'village', 'location'],
  district: ['district', 'dist', 'tehsil'],
  state: ['state', 'province'],
  pincode: ['pincode', 'pin', 'postal_code', 'zip', 'zip_code'],
  occupation: ['occupation', 'profession', 'employment', 'business', 'work'],
  monthlyIncome: ['monthly_income', 'income', 'monthly_salary', 'salary', 'earnings'],
  aadhaar: ['aadhaar_no', 'aadhaar', 'aadhar', 'aadhar_no', 'uid', 'uid_no'],
  pan: ['pan_no', 'pan', 'pan_card'],
  center: ['center_name', 'center', 'centre', 'group_name', 'group', 'shg_name'],
  kycStatus: ['kyc_status', 'kyc', 'verification_status'],

  branchCode: ['branch_code', 'bcode', 'branch_id', 'brid'],
  branchName: ['branch_name', 'branch', 'bname', 'office_name'],
  manager: ['manager_name', 'manager', 'branch_manager', 'incharge'],

  email: ['email', 'email_id', 'email_address'],
  role: ['role', 'user_role', 'access_level'],
  designation: ['designation', 'post', 'job_title'],

  productName: ['product_name', 'scheme', 'scheme_name', 'loan_product', 'product'],
  interestRate: ['interest_rate', 'roi', 'rate', 'interest', 'rate_of_interest'],
  loanType: ['loan_type', 'category', 'type'],
  minAmount: ['min_amount', 'minimum_amount', 'min_loan'],
  maxAmount: ['max_amount', 'maximum_amount', 'max_loan'],
  minTenure: ['min_tenure', 'minimum_tenure'],
  maxTenure: ['max_tenure', 'maximum_tenure'],

  legacyLoanId: ['loan_no', 'loan_id', 'ac_no', 'account_no', 'loan_account_no', 'ln_no', 'agreement_no'],
  customerId: ['cust_code', 'customer_id', 'cust_id', 'cid', 'client_id'],
  borrowerName: ['borrower_name', 'cust_name', 'customer_name', 'client_name', 'member_name'],
  principal: ['principal_amt', 'principal', 'sanctioned_amount', 'loan_amount', 'disbursed_amt', 'amount'],
  disbursedAmount: ['disbursed_amt', 'disbursed_amount', 'disbursal_amount', 'actual_disbursed'],
  tenure: ['tenure_months', 'tenure', 'period', 'duration', 'term'],
  frequency: ['frequency', 'repayment_frequency', 'freq', 'emi_frequency'],
  emi: ['emi_amt', 'emi', 'installment', 'installment_amount', 'monthly_emi'],
  disbursedDate: ['disburse_date', 'disbursed_date', 'disbursal_date', 'sanction_date'],
  outstanding: ['outstanding_amt', 'outstanding', 'balance', 'os_amount', 'balance_principal'],

  receiptId: ['receipt_no', 'receipt_id', 'voucher_no', 'txn_id', 'receipt'],
  amount: ['amount_paid', 'amount', 'paid_amt', 'collection_amount', 'collected_amt'],
  date: ['payment_date', 'date', 'collection_date', 'txn_date', 'entry_date'],
  mode: ['payment_mode', 'mode', 'type', 'channel', 'pay_type'],
  collector: ['collector_name', 'collector', 'field_officer', 'officer', 'collected_by'],
  txnRef: ['txn_ref', 'transaction_ref', 'reference_no', 'ref_no', 'utr'],

  disbursementId: ['disbursement_id', 'disb_id', 'voucher_id'],
  channel: ['channel', 'payout_channel', 'bank_transfer_mode'],

  entryId: ['entry_id', 'journal_id', 'voucher_no', 'voucher_id'],
  account: ['account_name', 'account', 'ledger', 'gl_account'],
  debit: ['debit', 'dr', 'debit_amount'],
  credit: ['credit', 'cr', 'credit_amount'],
  narration: ['narration', 'remarks', 'description', 'notes']
}

// ── 4. AUTO-MAPPING HEURISTICS ──
export function autoMapColumn(headerName, entityType) {
  if (!headerName || !entityType) return { field: '', confidence: 'none' }
  const normalized = String(headerName).toLowerCase().replace(/[\s\-_]+/g, '_').trim()
  const rawClean = String(headerName).toLowerCase().replace(/[^a-z0-9]/g, '')
  const entityDef = DATA_ENTITY_TYPES.find(e => e.id === entityType)
  if (!entityDef) return { field: '', confidence: 'none' }

  // 1. Exact match on system field name
  for (const field of entityDef.fields) {
    if (normalized === field.toLowerCase() || rawClean === field.toLowerCase()) {
      return { field, confidence: 'high' }
    }
  }

  // 2. Exact match in aliases
  for (const field of entityDef.fields) {
    const aliases = COLUMN_ALIAS_MAP[field] || []
    for (const alias of aliases) {
      if (normalized === alias || rawClean === alias.replace(/[^a-z0-9]/g, '')) {
        return { field, confidence: 'high' }
      }
    }
  }

  // 3. Substring / partial match
  for (const field of entityDef.fields) {
    const aliases = COLUMN_ALIAS_MAP[field] || [field]
    for (const alias of aliases) {
      const aliasClean = alias.replace(/[^a-z0-9]/g, '')
      if (rawClean.length >= 3 && (rawClean.includes(aliasClean) || aliasClean.includes(rawClean))) {
        return { field, confidence: 'medium' }
      }
    }
  }

  return { field: '', confidence: 'none' }
}

// ── 5. DATA TRANSFORMATION HELPERS ──
export function normalizeDate(val) {
  if (!val) return ''
  const str = String(val).trim()
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[/.-]/)
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
    }
  }
  return str
}

export function normalizeGender(val) {
  if (!val) return 'Female'
  const s = String(val).trim().toUpperCase()
  if (s === 'M' || s.startsWith('MALE')) return 'Male'
  if (s === 'F' || s.startsWith('FEMALE')) return 'Female'
  return 'Other'
}

export function normalizeFrequency(val) {
  if (!val) return 'Daily'
  const s = String(val).trim().toUpperCase()
  if (s === 'D' || s.includes('DAILY')) return 'Daily'
  if (s === 'W' || s.includes('WEEK')) return 'Weekly'
  if (s === 'BW' || s.includes('BI')) return 'Bi-weekly'
  if (s === 'M' || s.includes('MONTH')) return 'Monthly'
  if (s === 'Q' || s.includes('QUART')) return 'Quarterly'
  return 'Daily'
}

export function normalizeStatus(val) {
  if (!val) return 'Active'
  const s = String(val).trim().toUpperCase()
  if (s === 'A' || s === 'ACT' || s === 'ACTIVE') return 'Active'
  if (s === 'C' || s === 'CLO' || s === 'CLOSED') return 'Closed'
  if (s === 'NPA' || s === 'DEFAULT') return 'NPA'
  if (s === 'OVERDUE') return 'Overdue'
  return 'Active'
}

export function transformRecord(row, entityType, fieldMapping) {
  const transformed = {}
  Object.entries(fieldMapping).forEach(([sourceCol, targetField]) => {
    if (!targetField) return
    const rawVal = row[sourceCol]
    if (rawVal === undefined || rawVal === null) return

    // Apply specific transformations based on target field
    if (targetField === 'dob' || targetField === 'date' || targetField === 'disbursedDate') {
      transformed[targetField] = normalizeDate(rawVal)
    } else if (targetField === 'gender') {
      transformed[targetField] = normalizeGender(rawVal)
    } else if (targetField === 'frequency') {
      transformed[targetField] = normalizeFrequency(rawVal)
    } else if (targetField === 'status') {
      transformed[targetField] = normalizeStatus(rawVal)
    } else if (['principal', 'outstanding', 'amount', 'emi', 'monthlyIncome', 'interestRate'].includes(targetField)) {
      const num = Number(String(rawVal).replace(/[₹,$\s]/g, ''))
      transformed[targetField] = isNaN(num) ? rawVal : num
    } else {
      transformed[targetField] = typeof rawVal === 'string' ? rawVal.trim() : rawVal
    }
  })

  return transformed
}

// ── 6. DUPLICATE DETECTION ENGINE ──
export function detectDuplicates(record, existingList = [], entityType) {
  if (!existingList || existingList.length === 0) {
    return { isDuplicate: false, matchType: 'NONE' }
  }

  const recMobile = String(record.phone || record.primaryMobile || '').replace(/\D/g, '')
  const recAadhaar = String(record.aadhaar || record.aadhaarNumber || '').replace(/\D/g, '')
  const recLegacyId = String(record.legacyCustomerId || record.legacyLoanId || record.branchCode || record.receiptId || '').trim().toUpperCase()

  for (const existing of existingList) {
    // 1. Exact match on legacy reference ID
    const exLegacyId = String(existing.legacyCustomerId || existing.legacyLoanId || existing.code || existing.id || '').trim().toUpperCase()
    if (recLegacyId && exLegacyId && recLegacyId === exLegacyId) {
      return { isDuplicate: true, matchType: 'EXACT', field: 'Legacy ID', matchValue: recLegacyId, existing }
    }

    // 2. Exact match on primary mobile for customers
    if (entityType === 'customers' && recMobile && recMobile.length >= 10) {
      const exMobile = String(existing.phone || existing.primaryMobile || '').replace(/\D/g, '')
      if (exMobile.endsWith(recMobile.slice(-10))) {
        return { isDuplicate: true, matchType: 'EXACT', field: 'Mobile Number', matchValue: recMobile, existing }
      }
    }

    // 3. Aadhaar match
    if (recAadhaar && recAadhaar.length >= 12) {
      const exAadhaar = String(existing.aadhaarNumber || existing.aadhaar || '').replace(/\D/g, '')
      if (exAadhaar === recAadhaar) {
        return { isDuplicate: true, matchType: 'EXACT', field: 'Aadhaar', matchValue: recAadhaar, existing }
      }
    }

    // 4. Probable match on Name + Center
    if (record.name && existing.name && record.center && existing.center) {
      if (
        record.name.trim().toLowerCase() === existing.name.trim().toLowerCase() &&
        record.center.trim().toLowerCase() === existing.center.trim().toLowerCase()
      ) {
        return { isDuplicate: true, matchType: 'PROBABLE', field: 'Name + Center', matchValue: `${record.name} (${record.center})`, existing }
      }
    }
  }

  return { isDuplicate: false, matchType: 'NONE' }
}

// ── 7. VALIDATION ENGINE ──
export function validateRecords(records, entityType, fieldMapping, existingRecords = []) {
  const errors = []
  const warnings = []
  let validCount = 0
  const validRecords = []
  const internalSeenPks = new Map()

  const requiredFields = {
    customers: ['name', 'phone'],
    branches: ['branchName', 'branchCode'],
    employees: ['name', 'email'],
    loan_products: ['productName', 'interestRate'],
    loans: ['principal', 'tenure'],
    payments: ['amount', 'date'],
    disbursements: ['amount', 'date'],
    accounting: ['account', 'date']
  }[entityType] || []

  records.forEach((row, idx) => {
    const rowNum = idx + 2 // Row 1 is header
    let rowHasFatalError = false

    // Transform row to internal fields
    const transformed = transformRecord(row, entityType, fieldMapping)

    // Check required fields
    for (const reqField of requiredFields) {
      const val = transformed[reqField]
      if (val === undefined || val === null || String(val).trim() === '') {
        errors.push({
          row: rowNum,
          field: SYSTEM_FIELD_LABELS[reqField] || reqField,
          severity: 'CRITICAL',
          message: `Missing required field: ${SYSTEM_FIELD_LABELS[reqField] || reqField}`,
          suggestedAction: `Enter a valid ${SYSTEM_FIELD_LABELS[reqField] || reqField} or map the corresponding column.`
        })
        rowHasFatalError = true
      }
    }

    // Check numeric fields
    const numericKeys = ['principal', 'outstanding', 'amount', 'emi', 'monthlyIncome', 'interestRate']
    for (const numKey of numericKeys) {
      if (transformed[numKey] !== undefined) {
        const val = transformed[numKey]
        if (isNaN(Number(val)) || Number(val) < 0) {
          errors.push({
            row: rowNum,
            field: SYSTEM_FIELD_LABELS[numKey] || numKey,
            severity: 'CRITICAL',
            message: `Invalid numeric value "${val}" for ${SYSTEM_FIELD_LABELS[numKey] || numKey}`,
            suggestedAction: 'Ensure positive numerical amount without currency symbols.'
          })
          rowHasFatalError = true
        }
      }
    }

    // Check phone format
    if (transformed.phone) {
      const cleanPhone = String(transformed.phone).replace(/\D/g, '')
      if (cleanPhone.length < 10) {
        warnings.push({
          row: rowNum,
          field: 'Mobile Phone',
          severity: 'WARNING',
          message: `Phone number "${transformed.phone}" contains fewer than 10 digits`,
          suggestedAction: 'Verify borrower contact number before disbursement.'
        })
      }
    }

    // Intra-file primary key uniqueness check
    const pkVal = transformed.legacyCustomerId || transformed.legacyLoanId || transformed.receiptId || transformed.branchCode || transformed.phone
    if (pkVal) {
      const pkClean = String(pkVal).trim().toLowerCase()
      if (internalSeenPks.has(pkClean)) {
        warnings.push({
          row: rowNum,
          field: 'Identifier Uniqueness',
          severity: 'WARNING',
          message: `Duplicate record ID "${pkVal}" detected (matches row ${internalSeenPks.get(pkClean)})`,
          suggestedAction: 'Verify whether this is an intentional repeat or double entry in old system.'
        })
      } else {
        internalSeenPks.set(pkClean, rowNum)
      }
    }

    // Duplicate detection against existing ERP database
    const dupCheck = detectDuplicates(transformed, existingRecords, entityType)
    if (dupCheck.isDuplicate) {
      if (dupCheck.matchType === 'EXACT') {
        warnings.push({
          row: rowNum,
          field: dupCheck.field,
          severity: 'WARNING',
          message: `Exact match found in current ERP: ${dupCheck.field} "${dupCheck.matchValue}"`,
          suggestedAction: 'Strategy "Create Only" will safely skip this row to prevent duplicates.'
        })
      } else {
        warnings.push({
          row: rowNum,
          field: dupCheck.field,
          severity: 'INFO',
          message: `Probable match with existing record: "${dupCheck.matchValue}"`,
          suggestedAction: 'Review customer identity to avoid multi-borrowing.'
        })
      }
    }

    if (!rowHasFatalError) {
      validCount++
      validRecords.push(transformed)
    }
  })

  return {
    total: records.length,
    valid: validCount,
    errors,
    warnings,
    validRecords
  }
}

// ── 8. RECONCILIATION CALCULATION ──
export function calculateReconciliation(sourceRecords, importedRecords, entityType) {
  const sourceCount = sourceRecords.length
  const importedCount = importedRecords.length
  const countDiff = sourceCount - importedCount

  let sourceFinancialTotal = 0
  let importedFinancialTotal = 0

  if (entityType === 'loans') {
    sourceFinancialTotal = sourceRecords.reduce((sum, r) => sum + (Number(r.principal) || 0), 0)
    importedFinancialTotal = importedRecords.reduce((sum, r) => sum + (Number(r.principal) || 0), 0)
  } else if (entityType === 'payments') {
    sourceFinancialTotal = sourceRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    importedFinancialTotal = importedRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  }

  const financialDiff = sourceFinancialTotal - importedFinancialTotal

  let status = 'MATCHED'
  if (countDiff > 0 || Math.abs(financialDiff) > 0) {
    status = countDiff > (sourceCount * 0.1) ? 'CRITICAL_MISMATCH' : 'REVIEW_REQUIRED'
  }

  return {
    entityType,
    sourceCount,
    importedCount,
    countDiff,
    sourceFinancialTotal,
    importedFinancialTotal,
    financialDiff,
    status
  }
}

// ── 9. REPORT GENERATORS ──
export function generateErrorReportCsv(errors) {
  if (!errors || errors.length === 0) return 'Row Number,Field,Severity,Error Message,Suggested Action\n'
  const headers = ['Row Number', 'Field', 'Severity', 'Error Message', 'Suggested Action']
  const rows = errors.map(e => [
    e.row,
    `"${(e.field || '').replace(/"/g, '""')}"`,
    e.severity || 'ERROR',
    `"${(e.message || '').replace(/"/g, '""')}"`,
    `"${(e.suggestedAction || '').replace(/"/g, '""')}"`
  ])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function generateReconciliationReportText(reconData) {
  return `========================================================================
SADAGATI MICROFINANCE CORE ERP — LEGACY DATA MIGRATION RECONCILIATION
========================================================================
Report Generated: ${new Date().toLocaleString()}
Run ID:          ${reconData.runId || 'N/A'}
Source File:     ${reconData.sourceFile || 'N/A'}
Target Entity:   ${reconData.entityLabel || reconData.entityType}
Status:          ${reconData.status || 'COMPLETED'}

RECORD VOLUME COMPARISON:
  - Source File Records:    ${reconData.sourceCount}
  - Successfully Imported:  ${reconData.importedCount}
  - Difference / Skipped:   ${reconData.countDiff}
  - Integrity Ratio:        ${reconData.sourceCount > 0 ? Math.round((reconData.importedCount / reconData.sourceCount) * 100) : 0}%

FINANCIAL TOTAL RECONCILIATION:
  - Source Financial Total: ₹${reconData.sourceFinancialTotal?.toLocaleString('en-IN') || 0}
  - Target ERP Total:       ₹${reconData.importedFinancialTotal?.toLocaleString('en-IN') || 0}
  - Net Variance:           ₹${reconData.financialDiff?.toLocaleString('en-IN') || 0}
  - Audit Verdict:          ${reconData.status === 'MATCHED' ? 'PASSED (Zero Discrepancy)' : 'DISCREPANCY FLAGGED FOR REVIEW'}

AUDIT NOTES:
  1. No monetary amounts were silently altered or rounded.
  2. Legacy reference IDs preserved for end-to-end traceability.
  3. Execution performed by authorized administrator.
========================================================================`
}

// ── 10. PRE-BUILT LEGACY DATASETS FOR TESTING ──
export const SAMPLE_LEGACY_DATASETS = {
  customers: {
    name: 'Legacy_MF_Customer_Master_Oct2026.csv',
    entityType: 'customers',
    sheetName: 'CustomerMaster',
    headers: ['Cust_Code', 'Cust_Name', 'Father_Name', 'Mobile_No', 'Alt_Mobile', 'DOB', 'Gender', 'Address', 'City', 'State', 'Pincode', 'Occupation', 'Monthly_Income', 'Aadhaar_No', 'PAN_No', 'Center_Name', 'KYC_Status'],
    rows: [
      { Cust_Code: 'LEG-CUST-1001', Cust_Name: 'Anita Meena', Father_Name: 'Ramprasad Meena', Mobile_No: '9829011223', Alt_Mobile: '9829011224', DOB: '1989-05-12', Gender: 'F', Address: 'B-142, Pratap Nagar', City: 'Jaipur', State: 'Rajasthan', Pincode: '302033', Occupation: 'Tailoring', Monthly_Income: '18000', Aadhaar_No: '987654321012', PAN_No: 'ABCDE1234F', Center_Name: 'Center #14 (Pragati)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1002', Cust_Name: 'Kiran Prajapat', Father_Name: 'Gopal Prajapat', Mobile_No: '9829122334', Alt_Mobile: '', DOB: '1992-11-20', Gender: 'F', Address: 'Plot #45, Kalyan Basti', City: 'Jaipur', State: 'Rajasthan', Pincode: '302018', Occupation: 'Pottery & Handicraft', Monthly_Income: '22000', Aadhaar_No: '876543210987', PAN_No: 'BCDEF2345G', Center_Name: 'Center #08 (Kalyan)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1003', Cust_Name: 'Santosh Devi', Father_Name: 'Kailash Chand', Mobile_No: '9829233445', Alt_Mobile: '9829233446', DOB: '1985-03-15', Gender: 'F', Address: 'House #12, Udaan Colony', City: 'Jaipur', State: 'Rajasthan', Pincode: '302029', Occupation: 'Dairy Farming', Monthly_Income: '25000', Aadhaar_No: '765432109876', PAN_No: 'CDEFG3456H', Center_Name: 'Center #02 (Udaan)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1004', Cust_Name: 'Rekha Choudhary', Father_Name: 'Suraj Mal', Mobile_No: '9829344556', Alt_Mobile: '', DOB: '1990-08-25', Gender: 'F', Address: 'Gram Panchayat Road #4', City: 'Chomu', State: 'Rajasthan', Pincode: '303702', Occupation: 'Vegetable Vendor', Monthly_Income: '15000', Aadhaar_No: '654321098765', PAN_No: 'DEFGH4567I', Center_Name: 'Center #11 (Samriddhi)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1005', Cust_Name: 'Manju Sharma', Father_Name: 'Dinesh Sharma', Mobile_No: '9829455667', Alt_Mobile: '9829455668', DOB: '1988-12-05', Gender: 'F', Address: 'Shop #3, Sanganer Bazar', City: 'Jaipur', State: 'Rajasthan', Pincode: '302029', Occupation: 'Boutique Store', Monthly_Income: '32000', Aadhaar_No: '543210987654', PAN_No: 'EFGHI5678J', Center_Name: 'Center #05 (Adarsh)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1006', Cust_Name: 'Kamla Bai', Father_Name: 'Mishrilal', Mobile_No: '9829566778', Alt_Mobile: '', DOB: '1982-07-19', Gender: 'F', Address: 'Ward #8, Jamwa Ramgarh', City: 'Jaipur', State: 'Rajasthan', Pincode: '303104', Occupation: 'Agriculture', Monthly_Income: '14000', Aadhaar_No: '432109876543', PAN_No: 'FGHIJ6789K', Center_Name: 'Center #09 (Utthan)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1007', Cust_Name: 'Suman Gurjar', Father_Name: 'Bhanwar Singh', Mobile_No: '9829677889', Alt_Mobile: '9829677890', DOB: '1994-01-30', Gender: 'F', Address: 'C-89, Jhotwara Extension', City: 'Jaipur', State: 'Rajasthan', Pincode: '302012', Occupation: 'General Store', Monthly_Income: '28000', Aadhaar_No: '321098765432', PAN_No: 'GHIJK7890L', Center_Name: 'Center #14 (Pragati)', KYC_Status: 'Verified' },
      { Cust_Code: 'LEG-CUST-1008', Cust_Name: 'Geeta Bairwa', Father_Name: 'Mohan Lal', Mobile_No: '9829788990', Alt_Mobile: '', DOB: '1991-09-14', Gender: 'F', Address: 'Village Bassi, Main Road', City: 'Bassi', State: 'Rajasthan', Pincode: '303301', Occupation: 'Handloom Weaving', Monthly_Income: '16500', Aadhaar_No: '210987654321', PAN_No: 'HIJKL8901M', Center_Name: 'Center #07 (Vikas)', KYC_Status: 'Verified' }
    ]
  },

  loans: {
    name: 'Legacy_Active_Loans_Oct2026.csv',
    entityType: 'loans',
    sheetName: 'LoanPortfolio',
    headers: ['Loan_No', 'Cust_Code', 'Borrower_Name', 'Branch', 'Scheme', 'Principal_Amt', 'Disbursed_Amt', 'ROI', 'Tenure_Months', 'Frequency', 'EMI_Amt', 'Disburse_Date', 'Maturity_Date', 'Outstanding_Amt', 'Loan_Status'],
    rows: [
      { Loan_No: 'LEG-LN-2001', Cust_Code: 'LEG-CUST-1001', Borrower_Name: 'Anita Meena', Branch: 'Pragati Nagar Branch', Scheme: 'Daily Micro Business Loan', Principal_Amt: '25000', Disbursed_Amt: '25000', ROI: '12', Tenure_Months: '6', Frequency: 'Daily', EMI_Amt: '180', Disburse_Date: '2026-06-01', Maturity_Date: '2026-12-01', Outstanding_Amt: '14200', Loan_Status: 'Active' },
      { Loan_No: 'LEG-LN-2002', Cust_Code: 'LEG-CUST-1002', Borrower_Name: 'Kiran Prajapat', Branch: 'Kalyan Basti Branch', Scheme: 'Women Entrepreneur Scheme', Principal_Amt: '35000', Disbursed_Amt: '35000', ROI: '14', Tenure_Months: '12', Frequency: 'Monthly', EMI_Amt: '3150', Disburse_Date: '2026-03-15', Maturity_Date: '2027-03-15', Outstanding_Amt: '21400', Loan_Status: 'Active' },
      { Loan_No: 'LEG-LN-2003', Cust_Code: 'LEG-CUST-1003', Borrower_Name: 'Santosh Devi', Branch: 'Udaan Colony Branch', Scheme: 'Livestock & Dairy Micro Loan', Principal_Amt: '40000', Disbursed_Amt: '40000', ROI: '13', Tenure_Months: '10', Frequency: 'Weekly', EMI_Amt: '1100', Disburse_Date: '2026-05-10', Maturity_Date: '2027-03-10', Outstanding_Amt: '26500', Loan_Status: 'Active' },
      { Loan_No: 'LEG-LN-2004', Cust_Code: 'LEG-CUST-1004', Borrower_Name: 'Rekha Choudhary', Branch: 'Chomu Rural Branch', Scheme: 'Daily Micro Business Loan', Principal_Amt: '15000', Disbursed_Amt: '15000', ROI: '12', Tenure_Months: '4', Frequency: 'Daily', EMI_Amt: '150', Disburse_Date: '2026-08-01', Maturity_Date: '2026-12-01', Outstanding_Amt: '8900', Loan_Status: 'Active' },
      { Loan_No: 'LEG-LN-2005', Cust_Code: 'LEG-CUST-1005', Borrower_Name: 'Manju Sharma', Branch: 'Pragati Nagar Branch', Scheme: 'Emergency Medical Micro Loan', Principal_Amt: '50000', Disbursed_Amt: '50000', ROI: '15', Tenure_Months: '12', Frequency: 'Monthly', EMI_Amt: '4520', Disburse_Date: '2026-04-10', Maturity_Date: '2027-04-10', Outstanding_Amt: '32000', Loan_Status: 'Active' }
    ]
  },

  payments: {
    name: 'Legacy_Receipts_Export_Oct2026.csv',
    entityType: 'payments',
    sheetName: 'Collections',
    headers: ['Receipt_No', 'Loan_No', 'Borrower_Name', 'Amount_Paid', 'Payment_Date', 'Payment_Mode', 'Txn_Ref', 'Collector_Name', 'Status'],
    rows: [
      { Receipt_No: 'LEG-RCP-9001', Loan_No: 'LEG-LN-2001', Borrower_Name: 'Anita Meena', Amount_Paid: '180', Payment_Date: '2026-10-01', Payment_Mode: 'CASH', Txn_Ref: 'CSH-00192', Collector_Name: 'Rajesh Kumar (FO #04)', Status: 'Success' },
      { Receipt_No: 'LEG-RCP-9002', Loan_No: 'LEG-LN-2001', Borrower_Name: 'Anita Meena', Amount_Paid: '180', Payment_Date: '2026-10-02', Payment_Mode: 'CASH', Txn_Ref: 'CSH-00214', Collector_Name: 'Rajesh Kumar (FO #04)', Status: 'Success' },
      { Receipt_No: 'LEG-RCP-9003', Loan_No: 'LEG-LN-2002', Borrower_Name: 'Kiran Prajapat', Amount_Paid: '3150', Payment_Date: '2026-10-02', Payment_Mode: 'UPI', Txn_Ref: 'UPI202610029910', Collector_Name: 'Vikram Singh (FO #02)', Status: 'Success' },
      { Receipt_No: 'LEG-RCP-9004', Loan_No: 'LEG-LN-2003', Borrower_Name: 'Santosh Devi', Amount_Paid: '1100', Payment_Date: '2026-10-02', Payment_Mode: 'CASH', Txn_Ref: 'CSH-00289', Collector_Name: 'Sunita Rao (FO #01)', Status: 'Success' },
      { Receipt_No: 'LEG-RCP-9005', Loan_No: 'LEG-LN-2004', Borrower_Name: 'Rekha Choudhary', Amount_Paid: '150', Payment_Date: '2026-10-03', Payment_Mode: 'CASH', Txn_Ref: 'CSH-00341', Collector_Name: 'Rajesh Kumar (FO #04)', Status: 'Success' }
    ]
  },

  branches: {
    name: 'Legacy_Branch_Offices_Oct2026.csv',
    entityType: 'branches',
    sheetName: 'Branches',
    headers: ['Branch_ID', 'Branch_Code', 'Branch_Name', 'Address', 'District', 'State', 'Pincode', 'Manager_Name', 'Contact_Phone', 'Status'],
    rows: [
      { Branch_ID: 'LEG-BR-01', Branch_Code: 'BR-PRAGATI', Branch_Name: 'Pragati Nagar Branch', Address: 'Plot #12, Pragati Circle, Sector 4', District: 'Jaipur', State: 'Rajasthan', Pincode: '302012', Manager_Name: 'Suresh Verma', Contact_Phone: '9829000101', Status: 'Active' },
      { Branch_ID: 'LEG-BR-02', Branch_Code: 'BR-KALYAN', Branch_Name: 'Kalyan Basti Branch', Address: 'B-45, Community Center Complex', District: 'Jaipur', State: 'Rajasthan', Pincode: '302018', Manager_Name: 'Priya Rathore', Contact_Phone: '9829000102', Status: 'Active' },
      { Branch_ID: 'LEG-BR-03', Branch_Code: 'BR-UDAAN', Branch_Name: 'Udaan Colony Branch', Address: 'Station Road, Near Dairy Plant', District: 'Jaipur', State: 'Rajasthan', Pincode: '302029', Manager_Name: 'Amit Saxena', Contact_Phone: '9829000103', Status: 'Active' }
    ]
  }
}
