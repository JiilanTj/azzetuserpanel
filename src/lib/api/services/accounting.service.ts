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

const wsHeaders = (workspaceId: string) => ({ 'X-Workspace-ID': workspaceId })

export const accountingService = {
  // -------------------------------------------------------
  // Accounts (Chart of Accounts)
  // -------------------------------------------------------

  listAccounts: (workspaceId: string) =>
    apiClient
      .get('api/v1/accounts', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<AccountResponse[]>>()
      .then(r => r.data),

  getAccount: (workspaceId: string, id: string) =>
    apiClient
      .get(`api/v1/accounts/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<AccountResponse>>()
      .then(r => r.data),

  createAccount: (workspaceId: string, body: CreateAccountRequest) =>
    apiClient
      .post('api/v1/accounts', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<AccountResponse>>()
      .then(r => r.data),

  updateAccount: (workspaceId: string, id: string, body: UpdateAccountRequest) =>
    apiClient
      .patch(`api/v1/accounts/${id}`, { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Items (Products & Services)
  // -------------------------------------------------------

  listItems: (workspaceId: string) =>
    apiClient
      .get('api/v1/items', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<ItemResponse[]>>()
      .then(r => r.data),

  getItem: (workspaceId: string, id: string) =>
    apiClient
      .get(`api/v1/items/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<ItemResponse>>()
      .then(r => r.data),

  createItem: (workspaceId: string, body: CreateItemRequest) =>
    apiClient
      .post('api/v1/items', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<ItemResponse>>()
      .then(r => r.data),

  updateItem: (workspaceId: string, id: string, body: UpdateItemRequest) =>
    apiClient
      .patch(`api/v1/items/${id}`, { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  deleteItem: (workspaceId: string, id: string) =>
    apiClient
      .delete(`api/v1/items/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Transactions
  // -------------------------------------------------------

  listTransactions: (workspaceId: string) =>
    apiClient
      .get('api/v1/transactions', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TransactionResponse[]>>()
      .then(r => r.data),

  getTransaction: (workspaceId: string, id: string) =>
    apiClient
      .get(`api/v1/transactions/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TransactionResponse>>()
      .then(r => r.data),

  createTransaction: (workspaceId: string, body: CreateTransactionRequest) =>
    apiClient
      .post('api/v1/transactions', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<TransactionResponse>>()
      .then(r => r.data),

  categorizeTransaction: (workspaceId: string, body: CategorizationRequest) =>
    apiClient
      .post('api/v1/transactions/categorize', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<CategorizationResult>>()
      .then(r => r.data),

  voidTransaction: (workspaceId: string, id: string) =>
    apiClient
      .post(`api/v1/transactions/${id}/void`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<MessageResponse>>()
      .then(r => r.data),

  // -------------------------------------------------------
  // Reports
  // -------------------------------------------------------

  getTrialBalance: (workspaceId: string) =>
    apiClient
      .get('api/v1/reports/trial-balance', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TrialBalanceEntry[]>>()
      .then(r => r.data),

  getBalanceSheet: (workspaceId: string) =>
    apiClient
      .get('api/v1/reports/balance-sheet', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<BalanceSheetReport>>()
      .then(r => r.data),

  getIncomeStatement: (workspaceId: string) =>
    apiClient
      .get('api/v1/reports/income-statement', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<IncomeStatementReport>>()
      .then(r => r.data),

  getCashFlow: (workspaceId: string) =>
    apiClient
      .get('api/v1/reports/cash-flow', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<CashFlowEntry[]>>()
      .then(r => r.data),

  getLedger: (workspaceId: string, accountId: string) =>
    apiClient
      .get(`api/v1/reports/ledger/${accountId}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<LedgerEntryResponse[]>>()
      .then(r => r.data),
}
