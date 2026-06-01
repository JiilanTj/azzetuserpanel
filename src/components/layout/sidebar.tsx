import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import {
  DashboardIcon,
  PersonIcon,
  CardStackIcon,
  LayersIcon,
  GearIcon,
  ExitIcon,
  ChevronDownIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  ArchiveIcon,
  ReaderIcon,
  ChatBubbleIcon,
  CaretSortIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'
import { useAuthStore } from '@/stores/auth.store'
import { useWorkspaceStore } from '@/stores/workspace.store'
import { useWorkspaces } from '@/hooks/use-workspace'
import { useLogout } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import logoSvg from '@/assets/logo.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'

// -------------------------------------------------------
// Navigation definition
// -------------------------------------------------------

interface NavItem {
  to: string
  label: string
  Icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: { to: string; label: string }[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', Icon: DashboardIcon },
  {
    to: '/accounting',
    label: 'Akuntansi',
    Icon: CardStackIcon,
    children: [
      { to: '/accounting/transactions', label: 'Transaksi' },
      { to: '/accounting/accounts', label: 'Daftar Akun' },
      { to: '/accounting/items', label: 'Barang & Jasa' },
      { to: '/accounting/reports', label: 'Laporan' },
      { to: '/accounting/documents', label: 'Dokumen & OCR' },
    ],
  },
  { to: '/counterparties', label: 'Pihak Ketiga', Icon: ArchiveIcon },
  { to: '/claims', label: 'Klaim Entitas', Icon: CheckCircledIcon },
  { to: '/users', label: 'Anggota Tim', Icon: PersonIcon },
  { to: '/subscription', label: 'Langganan', Icon: LayersIcon },
  { to: '/settings', label: 'Pengaturan', Icon: GearIcon },
]

const BOTTOM_ITEMS: NavItem[] = [
  { to: '/docs', label: 'Dokumentasi', Icon: ReaderIcon },
  { to: '/support', label: 'Bantuan', Icon: ChatBubbleIcon },
]

// -------------------------------------------------------
// Sidebar
// -------------------------------------------------------

export function Sidebar() {
  useAuthStore()
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore()
  const { data: workspaces } = useWorkspaces()
  const workspaceList = workspaces || []
  
  const logoutMutation = useLogout()
  const currentPath = useRouterState({ select: s => s.location.pathname })
  const [collapsed, setCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isActive = (to: string) => currentPath === to || currentPath.startsWith(to + '/')

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.to)
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedGroups[item.to] || active

    return (
      <div key={item.to}>
        {/* Main item */}
        {hasChildren ? (
          <button
            onClick={() => toggleGroup(item.to)}
            className={cn(
              'relative flex items-center gap-3 w-full rounded-lg text-[13px] font-medium cursor-pointer',
              'transition-all duration-150',
              collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-9',
              active
                ? 'bg-(--gray-3) text-(--gray-12) font-bold'
                : 'text-(--gray-10) hover:bg-(--gray-2) hover:text-(--gray-12)'
            )}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-(--blue-9) rounded-r-full" />
            )}
            <item.Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-(--gray-12)' : 'text-(--gray-9)')} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-[#e8f5e9] text-[#2e7d32] dark:bg-[#1b3a1b] dark:text-[#66bb6a] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronDownIcon className={cn('h-3.5 w-3.5 text-(--gray-9) transition-transform', !isExpanded && '-rotate-90')} />
              </>
            )}
          </button>
        ) : (
          <Link
            to={item.to}
            className={cn(
              'relative flex items-center gap-3 rounded-lg text-[13px] font-medium',
              'transition-all duration-150',
              collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-9',
              active
                ? 'bg-(--gray-3) text-(--gray-12) font-bold'
                : 'text-(--gray-10) hover:bg-(--gray-2) hover:text-(--gray-12)'
            )}
          >
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-(--blue-9) rounded-r-full" />
            )}
            <item.Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-(--gray-12)' : 'text-(--gray-9)')} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-[#e8f5e9] text-[#2e7d32] dark:bg-[#1b3a1b] dark:text-[#66bb6a] px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )}

        {/* Sub-items */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 ml-[22px] flex flex-col relative">
            <div className="absolute left-0 top-0 bottom-[16px] w-px bg-(--gray-5)" />
            {item.children!.map((child) => {
              const childActive = currentPath === child.to
              return (
                <div key={child.to} className="relative flex items-center">
                  <div className="absolute left-0 top-1/2 w-3 h-px bg-(--gray-5)" />
                  <Link
                    to={child.to}
                    className={cn(
                      'flex items-center gap-2 pl-5 pr-3 h-8 rounded-lg text-[13px] w-full transition-colors',
                      childActive
                        ? 'text-(--gray-12) font-semibold'
                        : 'text-(--gray-9) hover:text-(--gray-12)'
                    )}
                  >
                    {child.label}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col shrink-0 h-full border-r transition-all duration-200',
        'border-[#f0f0f0] dark:border-[#2a2a2a]',
        'bg-surface',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 shrink-0', collapsed ? 'justify-center px-2' : 'gap-2.5 px-5')}>
        <img src={logoSvg} alt="Azzet" className="h-7 w-7 shrink-0" />
        {!collapsed && (
          <span className="text-[15px] font-bold text-[#1a1a1a] dark:text-white tracking-tight">Azzet</span>
        )}
      </div>

      {/* Workspace Badge — expanded & collapsed */}
      {activeWorkspace && (
        <div className={cn('shrink-0', collapsed ? 'px-2 pb-3 pt-2 flex justify-center' : 'px-3 pb-6 pt-3')}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {collapsed ? (
                /* Collapsed: compact avatar only, dropdown opens right */
                <button
                  className="w-10 h-10 rounded-xl bg-(--blue-9) text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-(--blue-9) focus:ring-offset-2"
                  title={activeWorkspace.entity_name}
                >
                  {activeWorkspace.entity_name.charAt(0).toUpperCase()}
                </button>
              ) : (
                /* Expanded: full card */
                <div className="flex items-center justify-between bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#333] rounded-xl px-2.5 py-2 cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-[#222] transition-colors focus:outline-none focus:ring-2 focus:ring-(--blue-9) focus:ring-offset-1">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-(--blue-9) text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {activeWorkspace.entity_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start overflow-hidden leading-tight">
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                        {activeWorkspace.entity_name}
                      </span>
                      <span className="text-[10px] font-medium text-(--blue-9) bg-(--blue-3) px-1.5 py-0.5 rounded-sm mt-0.5 truncate">
                        {activeWorkspace.plan_name || 'Free Plan'}
                      </span>
                    </div>
                  </div>
                  <CaretSortIcon className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[220px]"
              align="start"
              side={collapsed ? 'right' : 'bottom'}
              alignOffset={collapsed ? -8 : -8}
              sideOffset={collapsed ? 8 : 8}
            >
              <DropdownMenuLabel className="text-xs text-gray-500 font-normal">Pilih Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaceList.map((ws) => (
                <DropdownMenuItem 
                  key={ws.id} 
                  className={cn(
                    "flex items-center gap-2.5 cursor-pointer py-2",
                    ws.id === activeWorkspace.id && "bg-(--blue-3) text-(--blue-11) focus:bg-(--blue-4)"
                  )}
                  onClick={() => setActiveWorkspace(ws)}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                    ws.id === activeWorkspace.id 
                      ? "bg-(--blue-9) text-white" 
                      : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  )}>
                    {ws.entity_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-xs font-semibold truncate">{ws.entity_name}</span>
                    <span className="text-[10px] opacity-80">{ws.role}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Main nav */}
      <nav className={cn('flex-1 flex flex-col gap-0.5 overflow-y-auto', collapsed ? 'px-2 py-1' : 'px-3 py-1')}>
        {NAV_ITEMS.map(renderNavItem)}
      </nav>

      {/* Bottom section */}
      <div className={cn('flex flex-col gap-0.5 border-t border-[#f0f0f0] dark:border-[#2a2a2a]', collapsed ? 'px-2 py-3' : 'px-3 py-3')}>
        {/* Bottom nav items */}
        {!collapsed && BOTTOM_ITEMS.map(item => {
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex items-center gap-3 px-3 h-9 rounded-lg text-[13px] font-medium',
                'transition-all duration-150',
                active
                  ? 'bg-(--gray-3) text-(--gray-12) font-bold'
                  : 'text-(--gray-10) hover:bg-(--gray-2) hover:text-(--gray-12)'
              )}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-(--blue-9) rounded-r-full" />
              )}
              <item.Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-(--gray-12)' : 'text-(--gray-9)')} />
              {item.label}
            </Link>
          )
        })}


        {/* Logout */}
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={cn(
            'flex items-center gap-3 rounded-lg text-[13px] font-medium',
            'text-[#6b7280] hover:bg-red-50 hover:text-red-500 dark:text-[#9ca3af] dark:hover:bg-red-950/30 dark:hover:text-red-400',
            'transition-all duration-150 cursor-pointer mt-1',
            collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-9 w-full'
          )}
        >
          <ExitIcon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && (logoutMutation.isPending ? 'Signing out…' : 'Sign out')}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className={cn(
            'flex items-center gap-3 rounded-lg text-[12px] font-medium',
            'text-[#9ca3af] hover:text-[#6b7280] dark:hover:text-[#d1d5db]',
            'transition-all duration-150 cursor-pointer mt-1',
            collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 h-8 w-full'
          )}
        >
          {collapsed ? (
            <DoubleArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <>
              <DoubleArrowLeftIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
