import React, { useState, useMemo } from 'react'
import { createRoute } from '@tanstack/react-router'
import { authedLayout } from '../_authed'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useAccounts } from '@/hooks/use-accounting'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import type { AccountResponse, AccountType } from '@/lib/api/types/accounting.types'

// Types
type TreeNode = AccountResponse & { children: TreeNode[] }

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'ASSET', label: 'Harta (Aset)' },
  { value: 'LIABILITY', label: 'Kewajiban (Liabilitas)' },
  { value: 'EQUITY', label: 'Ekuitas (Modal)' },
  { value: 'REVENUE', label: 'Pendapatan' },
  { value: 'EXPENSE', label: 'Beban / Pengeluaran' },
]

export const accountsRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/accounting/accounts',
  component: AccountsPage,
})

function buildTree(accounts: AccountResponse[]) {
  const map = new Map<string, TreeNode>()
  const roots: Record<AccountType, TreeNode[]> = {
    ASSET: [],
    LIABILITY: [],
    EQUITY: [],
    REVENUE: [],
    EXPENSE: [],
  }

  accounts.forEach(acc => {
    map.set(acc.id, { ...acc, children: [] })
  })

  accounts.forEach(acc => {
    const node = map.get(acc.id)!
    if (acc.parent_id && map.has(acc.parent_id)) {
      map.get(acc.parent_id)!.children.push(node)
    } else {
      roots[acc.account_type].push(node)
    }
  })

  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.code.localeCompare(b.code))
    nodes.forEach(n => sortNodes(n.children))
  }

  Object.values(roots).forEach(sortNodes)
  return roots
}

function flattenNodes(nodes: TreeNode[], expandedIds: Set<string>): TreeNode[] {
  let result: TreeNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (expandedIds.has(node.id) && node.children.length > 0) {
      result = result.concat(flattenNodes(node.children, expandedIds))
    }
  }
  return result
}

function AccountsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const { data: accountsData, isLoading } = useAccounts(activeWorkspace?.id)

  const [expandedTypes, setExpandedTypes] = useState<Set<AccountType>>(
    new Set(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  )
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const roots = useMemo(() => buildTree(accountsData || []), [accountsData])

  const toggleType = (type: AccountType) => {
    setExpandedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const toggleNode = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => {
    setExpandedTypes(new Set(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']))
    setExpandedIds(new Set((accountsData || []).map(a => a.id)))
  }

  const collapseAll = () => {
    setExpandedTypes(new Set())
    setExpandedIds(new Set())
  }

  if (isLoading) {
    return <div className="p-6 text-center text-(--gray-11)">Memuat data Chart of Accounts...</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-(--gray-12) mb-1.5">
            Daftar Akun (COA)
          </h1>
          <p className="text-sm text-(--gray-10)">
            Kelola Chart of Accounts untuk pencatatan jurnal akuntansi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={collapseAll}>Collapse All</Button>
          <Button variant="outline" onClick={expandAll}>Expand All</Button>
          <Button variant="solid">
            <PlusIcon className="mr-2" />
            Tambah Akun
          </Button>
        </div>
      </div>

      <div className="border border-(--gray-6) rounded-xl overflow-hidden bg-white dark:bg-(--gray-2)">
        <table className="w-full text-sm text-left">
          <thead className="bg-(--gray-3) text-(--gray-11) border-b border-(--gray-6)">
            <tr>
              <th className="py-3 px-4 font-medium w-[250px]">Kode Akun</th>
              <th className="py-3 px-4 font-medium">Nama Akun</th>
              <th className="py-3 px-4 font-medium w-[150px]">Saldo Normal</th>
              <th className="py-3 px-4 font-medium w-[120px] text-center">Status</th>
              <th className="py-3 px-4 font-medium w-[100px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ACCOUNT_TYPES.map(type => (
              <React.Fragment key={type.value}>
                <tr 
                  className="bg-(--gray-4) cursor-pointer hover:bg-(--gray-5) transition-colors border-b border-(--gray-6)"
                  onClick={() => toggleType(type.value)}
                >
                  <td colSpan={5} className="py-3 px-4 font-semibold text-(--gray-12)">
                    <div className="flex items-center gap-2">
                      {expandedTypes.has(type.value) ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      {type.label}
                    </div>
                  </td>
                </tr>
                {expandedTypes.has(type.value) && flattenNodes(roots[type.value], expandedIds).map(node => (
                  <tr key={node.id} className="border-b border-(--gray-5) hover:bg-(--gray-3) transition-colors group">
                    <td className="py-2.5 px-4">
                      <div 
                        className="flex items-center gap-2" 
                        style={{ paddingLeft: `${(node.level - 1) * 1.5}rem` }}
                      >
                        {node.children.length > 0 ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                            className="p-0.5 rounded-md hover:bg-(--gray-6) text-(--gray-11) transition-colors"
                          >
                            {expandedIds.has(node.id) ? <ChevronDownIcon /> : <ChevronRightIcon />}
                          </button>
                        ) : (
                          <span className="w-[20px]" />
                        )}
                        <span className="font-medium text-(--gray-12)">{node.code}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-(--gray-11)">
                      {node.name}
                      {node.is_system && (
                        <Badge variant="gray" className="ml-2 h-5 px-1.5 text-[10px]">Sistem</Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-(--gray-11)">
                      {node.normal_balance === 'DEBIT' ? 'Debit' : 'Kredit'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <Badge variant={node.is_active ? 'success' : 'gray'} className="h-5 text-[10px]">
                        {node.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" className="h-7 w-7 p-0 text-(--gray-11)">
                          <Pencil1Icon className="h-3.5 w-3.5" />
                        </Button>
                        {!node.is_system && (
                          <Button variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                            <TrashIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            
            {(!accountsData || accountsData.length === 0) && !isLoading && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-(--gray-11)">
                  Belum ada akun yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
