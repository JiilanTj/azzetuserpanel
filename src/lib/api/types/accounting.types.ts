

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
export type NormalBalance = 'DEBIT' | 'CREDIT'

export interface AccountResponse {
  id: string
  workspace_id: string
  account_type: AccountType
  code: string
  name: string
  normal_balance: NormalBalance
  is_active: boolean
  is_system: boolean
  parent_id?: string
  level: number
  created_at: string
  updated_at: string
}

export interface CreateAccountRequest {
  account_type: AccountType
  code: string
  name: string
  parent_id?: string
}

export interface UpdateAccountRequest {
  name?: string
  is_active?: boolean
  parent_id?: string
}

export interface ItemResponse {
  id: string
  workspace_id: string
  account_id?: string
  item_type: 'BARANG' | 'JASA'
  name: string
  description?: string
  unit?: string
  unit_price: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateItemRequest {
  item_type: 'BARANG' | 'JASA'
  name: string
  description?: string
  unit?: string
  unit_price: string
  account_id?: string
}

export interface UpdateItemRequest {
  item_type?: 'BARANG' | 'JASA'
  name?: string
  description?: string
  unit?: string
  unit_price?: string
  account_id?: string
  is_active?: boolean
}

export interface JournalEntryResponse {
  id: string
  account_id: string
  account_code: string
  account_name: string
  debit: string
  credit: string
  description?: string
  sort_order: number
}

export interface LineItemResponse {
  id: string
  item_id?: string
  description: string
  quantity: string
  unit_price: string
  unit?: string
  discount_amount: string
  tax_amount: string
  line_total: string
  sort_order: number
}

export interface TransactionResponse {
  id: string
  workspace_id: string
  transaction_number: string
  transaction_date: string
  posted_at?: string
  voided_at?: string
  status: 'DRAFT' | 'POSTED' | 'VOIDED'
  transaction_type: 'CASH_IN' | 'CASH_OUT' | 'SALES' | 'PURCHASE' | 'JOURNAL_ENTRY'
  input_mode: 'SIMPLE' | 'ADVANCED'
  payment_method?: string
  counterparty_entity_id?: string
  counterparty_name?: string
  description?: string
  amount: string
  currency: string
  tax_amount: string
  includes_tax: boolean
  category?: string
  ai_confidence?: number
  reversed_transaction_id?: string
  created_by: string
  created_at: string
  updated_at: string
  journal_entries: JournalEntryResponse[]
  line_items: LineItemResponse[]
}

export interface CreateTransactionRequest {
  transaction_date: string
  transaction_type: 'CASH_IN' | 'CASH_OUT' | 'SALES' | 'PURCHASE' | 'JOURNAL_ENTRY'
  input_mode: 'SIMPLE' | 'ADVANCED'
  payment_method?: string
  counterparty_entity_id?: string
  description?: string
  amount: string
  tax_amount?: string
  includes_tax?: boolean
  category?: string
  journal_entries?: {
    account_id: string
    debit: string
    credit: string
    description?: string
  }[]
  line_items?: {
    item_id?: string
    description: string
    quantity: string
    unit_price: string
    discount_amount?: string
    tax_amount?: string
  }[]
}

export interface CategorizationRequest {
  description: string
  amount: number
  transaction_type: string
}

export interface CategorizationResult {
  category: string
  confidence: number
  used_fallback: boolean
}

// Reports
export interface BalanceSheetEntry {
  account_id: string
  account_type: AccountType
  code: string
  name: string
  normal_balance: NormalBalance
  balance: string
}

export interface BalanceSheetReport {
  assets: BalanceSheetEntry[]
  liabilities: BalanceSheetEntry[]
  equity: BalanceSheetEntry[]
  total_assets: string
  total_liabilities: string
  total_equity: string
  is_balanced: boolean
}

export interface IncomeStatementEntry {
  account_id: string
  account_type: AccountType
  code: string
  name: string
  normal_balance: NormalBalance
  total_debit: string
  total_credit: string
  balance: string
}

export interface IncomeStatementReport {
  revenue: IncomeStatementEntry[]
  expenses: IncomeStatementEntry[]
  total_revenue: string
  total_expenses: string
  net_income: string
}

export interface TrialBalanceEntry {
  account_id: string
  account_type: AccountType
  code: string
  name: string
  normal_balance: NormalBalance
  total_debit: string
  total_credit: string
  balance: string
}

export interface CashFlowEntry {
  date: string
  total_debit: string
  total_credit: string
  net_flow: string
}

export interface LedgerEntryResponse {
  id: string
  transaction_date: string
  transaction_number: string
  posted_at: string
  tx_description?: string
  debit: string
  credit: string
  running_balance: string
}
