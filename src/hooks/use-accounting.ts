import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { accountingService } from '@/lib/api/services/accounting.service'
import { extractErrorMessage } from '@/lib/api/errors'
import type {
  CreateAccountRequest,
  UpdateAccountRequest,
  CreateItemRequest,
  UpdateItemRequest,
  CreateTransactionRequest,
  CategorizationRequest,
} from '@/lib/api/types/accounting.types'

// -------------------------------------------------------
// Query Keys
// -------------------------------------------------------

export const accountingKeys = {
  all: ['accounting'] as const,
  accounts: (workspaceId: string) => [...accountingKeys.all, workspaceId, 'accounts'] as const,
  accountDetail: (workspaceId: string, id: string) => [...accountingKeys.accounts(workspaceId), id] as const,
  items: (workspaceId: string) => [...accountingKeys.all, workspaceId, 'items'] as const,
  itemDetail: (workspaceId: string, id: string) => [...accountingKeys.items(workspaceId), id] as const,
  transactions: (workspaceId: string) => [...accountingKeys.all, workspaceId, 'transactions'] as const,
  transactionDetail: (workspaceId: string, id: string) => [...accountingKeys.transactions(workspaceId), id] as const,
  reports: (workspaceId: string) => [...accountingKeys.all, workspaceId, 'reports'] as const,
  trialBalance: (workspaceId: string) => [...accountingKeys.reports(workspaceId), 'trial-balance'] as const,
  balanceSheet: (workspaceId: string) => [...accountingKeys.reports(workspaceId), 'balance-sheet'] as const,
  incomeStatement: (workspaceId: string) => [...accountingKeys.reports(workspaceId), 'income-statement'] as const,
  cashFlow: (workspaceId: string) => [...accountingKeys.reports(workspaceId), 'cash-flow'] as const,
  ledger: (workspaceId: string, accountId: string) => [...accountingKeys.reports(workspaceId), 'ledger', accountId] as const,
}

// -------------------------------------------------------
// Accounts
// -------------------------------------------------------

export function useAccounts(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.accounts(workspaceId ?? ''),
    queryFn: () => accountingService.listAccounts(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useAccount(workspaceId?: string, id?: string) {
  return useQuery({
    queryKey: accountingKeys.accountDetail(workspaceId ?? '', id ?? ''),
    queryFn: () => accountingService.getAccount(workspaceId!, id!),
    enabled: !!workspaceId && !!id,
  })
}

export function useCreateAccount(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAccountRequest) => accountingService.createAccount(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.accounts(workspaceId) })
      }
      toast.success('Akun perkiraan berhasil ditambahkan.')
    },
    onError: (err) => {
      toast.error('Gagal menambahkan akun perkiraan', { description: extractErrorMessage(err) })
    },
  })
}

export function useUpdateAccount(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAccountRequest }) =>
      accountingService.updateAccount(workspaceId!, id, body),
    onSuccess: (_, variables) => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.accounts(workspaceId) })
        qc.invalidateQueries({ queryKey: accountingKeys.accountDetail(workspaceId, variables.id) })
      }
      toast.success('Akun perkiraan berhasil diperbarui.')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui akun perkiraan', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// Items
// -------------------------------------------------------

export function useItems(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.items(workspaceId ?? ''),
    queryFn: () => accountingService.listItems(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useCreateItem(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateItemRequest) => accountingService.createItem(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.items(workspaceId) })
      }
      toast.success('Katalog item berhasil ditambahkan.')
    },
    onError: (err) => {
      toast.error('Gagal menambahkan katalog item', { description: extractErrorMessage(err) })
    },
  })
}

export function useUpdateItem(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateItemRequest }) =>
      accountingService.updateItem(workspaceId!, id, body),
    onSuccess: (_, variables) => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.items(workspaceId) })
        qc.invalidateQueries({ queryKey: accountingKeys.itemDetail(workspaceId, variables.id) })
      }
      toast.success('Katalog item berhasil diperbarui.')
    },
    onError: (err) => {
      toast.error('Gagal memperbarui katalog item', { description: extractErrorMessage(err) })
    },
  })
}

export function useDeleteItem(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteItem(workspaceId!, id),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.items(workspaceId) })
      }
      toast.success('Katalog item berhasil dihapus.')
    },
    onError: (err) => {
      toast.error('Gagal menghapus katalog item', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// Transactions
// -------------------------------------------------------

export function useTransactions(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.transactions(workspaceId ?? ''),
    queryFn: () => accountingService.listTransactions(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useTransaction(workspaceId?: string, id?: string) {
  return useQuery({
    queryKey: accountingKeys.transactionDetail(workspaceId ?? '', id ?? ''),
    queryFn: () => accountingService.getTransaction(workspaceId!, id!),
    enabled: !!workspaceId && !!id,
  })
}

export function useCreateTransaction(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTransactionRequest) => accountingService.createTransaction(workspaceId!, body),
    onSuccess: () => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.transactions(workspaceId) })
        // Invalidate reports when a new transaction is created
        qc.invalidateQueries({ queryKey: accountingKeys.reports(workspaceId) })
      }
      toast.success('Transaksi berhasil dicatat.')
    },
    onError: (err) => {
      toast.error('Gagal mencatat transaksi', { description: extractErrorMessage(err) })
    },
  })
}

export function useCategorizeTransaction(workspaceId?: string) {
  return useMutation({
    mutationFn: (body: CategorizationRequest) => accountingService.categorizeTransaction(workspaceId!, body),
    onError: (err) => {
      toast.error('Gagal mendapatkan rekomendasi kategori', { description: extractErrorMessage(err) })
    },
  })
}

export function useVoidTransaction(workspaceId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.voidTransaction(workspaceId!, id),
    onSuccess: (_, variables) => {
      if (workspaceId) {
        qc.invalidateQueries({ queryKey: accountingKeys.transactions(workspaceId) })
        qc.invalidateQueries({ queryKey: accountingKeys.transactionDetail(workspaceId, variables) })
        qc.invalidateQueries({ queryKey: accountingKeys.reports(workspaceId) })
      }
      toast.success('Transaksi berhasil di-void.')
    },
    onError: (err) => {
      toast.error('Gagal melakukan void transaksi', { description: extractErrorMessage(err) })
    },
  })
}

// -------------------------------------------------------
// Reports
// -------------------------------------------------------

export function useTrialBalance(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.trialBalance(workspaceId ?? ''),
    queryFn: () => accountingService.getTrialBalance(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useBalanceSheet(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.balanceSheet(workspaceId ?? ''),
    queryFn: () => accountingService.getBalanceSheet(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useIncomeStatement(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.incomeStatement(workspaceId ?? ''),
    queryFn: () => accountingService.getIncomeStatement(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useCashFlow(workspaceId?: string) {
  return useQuery({
    queryKey: accountingKeys.cashFlow(workspaceId ?? ''),
    queryFn: () => accountingService.getCashFlow(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function useLedger(workspaceId?: string, accountId?: string) {
  return useQuery({
    queryKey: accountingKeys.ledger(workspaceId ?? '', accountId ?? ''),
    queryFn: () => accountingService.getLedger(workspaceId!, accountId!),
    enabled: !!workspaceId && !!accountId,
  })
}
