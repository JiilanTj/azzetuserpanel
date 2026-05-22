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
} from '@radix-ui/react-icons'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import logoSvg from '@/assets/logo.svg'

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
      { to: '/transactions', label: 'Transaksi' },
      { to: '/accounts', label: 'Daftar Akun' },
      { to: '/items', label: 'Barang & Jasa' },
      { to: '/reports', label: 'Laporan' },
    ],
  },
  { to: '/counterparties', label: 'Pihak Ketiga', Icon: ArchiveIcon },
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
      <div className={cn('flex items-center h-14', collapsed ? 'justify-center px-2' : 'gap-2.5 px-5')}>
        <img src={logoSvg} alt="Azzet" className="h-7 w-7 shrink-0" />
        {!collapsed && (
          <span className="text-[15px] font-bold text-[#1a1a1a] dark:text-white tracking-tight">Azzet</span>
        )}
      </div>

      {/* Main nav */}
      <nav className={cn('flex-1 flex flex-col gap-0.5 overflow-y-auto', collapsed ? 'px-2 py-3' : 'px-3 py-3')}>
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
