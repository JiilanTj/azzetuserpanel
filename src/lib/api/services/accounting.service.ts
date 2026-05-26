import { apiClient } from '../client'
import type {
  APIResponse,
  MessageResponse,
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
  ItemResponse,
  CreateItemRequest,
  UpdateItemRequest,
  TransactionResponse,
  CreateTransactionRequest,
  CategorizationRequest,
  CategorizationResult,
  BalanceSheetReport,
  IncomeStatementReport,
  TrialBalanceEntry,
  CashFlowEntry,
  LedgerEntryResponse,
} from '../types'

export const accountingService = {
  // -------------------------------------------------------
  // Accounts (Chart of Accounts)
  // -------------------------------------------------------

  listAccounts: (_workspaceId: string, params?: { include_inactive?: boolean }) =>
    apiClient
      .get('accounts', { searchParams: params })
      .json<APIResponse<AccountResponse[]>>()
      .then(r => r.data),

  getAccount: (_workspaceId: string, id: string) =>
    apiClient
      .get(`accounts/${id}`)
      .json<APIResponse<AccountResponse>>()
      .then(r => r.data),

  createAccount: (_workspaceId: string, body: CreateAccountRequest) =>
    apiClient
      .post('accounts', { json: body })
      .json<APIResponse<AccountResponse>>()
      .then(r => r.data),

  updateAccount: (_workspaceId: string, id: string, body: UpdateAccountRequest) =>
    apiClient
      .patch(`accounts/${id}`, { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Items (Products & Services)
  // -------------------------------------------------------

  listItems: (_workspaceId: string, params?: { include_inactive?: boolean }) =>
    apiClient
      .get('items', { searchParams: params })
      .json<APIResponse<ItemResponse[]>>()
      .then(r => r.data),

  getItem: (_workspaceId: string, id: string) =>
    apiClient
      .get(`items/${id}`)
      .json<APIResponse<ItemResponse>>()
      .then(r => r.data),

  createItem: (_workspaceId: string, body: CreateItemRequest) =>
    apiClient
      .post('items', { json: body })
      .json<APIResponse<ItemResponse>>()
      .then(r => r.data),

  updateItem: (_workspaceId: string, id: string, body: UpdateItemRequest) =>
    apiClient
      .patch(`items/${id}`, { json: body })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  deleteItem: (_workspaceId: string, id: string) =>
    apiClient
      .delete(`items/${id}`)
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  reactivateItem: (_workspaceId: string, id: string) =>
    apiClient
      .post(`items/${id}/reactivate`)
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Transactions
  // -------------------------------------------------------

  listTransactions: (_workspaceId: string) =>
    apiClient
      .get('transactions')
      .json<APIResponse<TransactionResponse[]>>()
      .then(r => r.data),

  getTransaction: (_workspaceId: string, id: string) =>
    apiClient
      .get(`transactions/${id}`)
      .json<APIResponse<TransactionResponse>>()
      .then(r => r.data),

  createTransaction: (_workspaceId: string, body: CreateTransactionRequest) =>
    apiClient
      .post('transactions', { json: body })
      .json<APIResponse<TransactionResponse>>()
      .then(r => r.data),

  categorizeTransaction: (_workspaceId: string, body: CategorizationRequest) =>
    apiClient
      .post('transactions/categorize', { json: body })
      .json<APIResponse<CategorizationResult>>()
      .then(r => r.data),

  voidTransaction: (_workspaceId: string, id: string) =>
    apiClient
      .post(`transactions/${id}/void`)
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Reports
  // -------------------------------------------------------

  getTrialBalance: (_workspaceId: string, periodFrom: string, periodTo: string) =>
    apiClient
      .get('reports/trial-balance', {
        searchParams: { period_from: periodFrom, period_to: periodTo }
      })
      .json<APIResponse<TrialBalanceEntry[]>>()
      .then(r => r.data),

  getBalanceSheet: (_workspaceId: string, period: string) =>
    apiClient
      .get('reports/balance-sheet', {
        searchParams: { period }
      })
      .json<APIResponse<BalanceSheetReport>>()
      .then(r => r.data),

  getIncomeStatement: (_workspaceId: string, periodFrom: string, periodTo: string) =>
    apiClient
      .get('reports/income-statement', {
        searchParams: { period_from: periodFrom, period_to: periodTo }
      })
      .json<APIResponse<IncomeStatementReport>>()
      .then(r => r.data),

  getCashFlow: (_workspaceId: string, dateFrom: string, dateTo: string) =>
    apiClient
      .get('reports/cash-flow', {
        searchParams: { date_from: dateFrom, date_to: dateTo }
      })
      .json<APIResponse<CashFlowEntry[]>>()
      .then(r => r.data),

  getLedger: (_workspaceId: string, accountId: string, limit = 50, offset = 0) =>
    apiClient
      .get(`reports/ledger/${accountId}`, {
        searchParams: { limit: String(limit), offset: String(offset) }
      })
      .json<APIResponse<LedgerEntryResponse[]>>()
      .then(r => r.data),
}
