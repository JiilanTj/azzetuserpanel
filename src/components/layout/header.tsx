import { BellIcon, GearIcon, SunIcon, MoonIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/hooks/use-theme'

export function Header() {
  const { admin } = useAuthStore()
  const { isDark, toggle } = useTheme()

  const initials = admin
    ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??'

  return (
    <header className="flex items-center justify-between h-16 px-6 shrink-0">
      {/* Left — Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="flex items-center gap-2.5 w-full h-10 px-3.5 rounded-surface bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2a2a2a] transition-colors focus-within:border-[#d1d5db] dark:focus-within:border-[#404040]">
          <MagnifyingGlassIcon className="h-4 w-4 text-[#9ca3af] shrink-0" />
          <input
            type="text"
            placeholder="Quick search…"
            className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] dark:text-white placeholder-[#9ca3af] outline-none"
          />
        </div>
      </div>

      {/* Right — Actions + Profile */}
      <div className="flex items-center gap-2.5 ml-4">
        {/* Dark / Light toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center h-10 w-10 rounded-surface bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2a2a2a] text-[#6b7280] hover:text-[#1a1a1a] dark:text-[#9ca3af] dark:hover:text-white transition-colors cursor-pointer"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center h-10 w-10 rounded-surface bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2a2a2a] text-[#6b7280] hover:text-[#1a1a1a] dark:text-[#9ca3af] dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Notifications"
          id="header-notifications-btn"
        >
          <BellIcon className="h-[18px] w-[18px]" />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
        </button>

        {/* Settings */}
        <button
          className="flex items-center justify-center h-10 w-10 rounded-surface bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2a2a2a] text-[#6b7280] hover:text-[#1a1a1a] dark:text-[#9ca3af] dark:hover:text-white transition-colors cursor-pointer"
          aria-label="Settings"
          id="header-settings-btn"
        >
          <GearIcon className="h-[18px] w-[18px]" />
        </button>

        {/* Profile */}
        {admin && (
          <button className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-surface bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#1f1f1f] transition-colors cursor-pointer">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #1a1a1a, #404040)' }}
            >
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-[#1a1a1a] dark:text-white leading-none mb-0.5">{admin.name}</p>
              <p className="text-[10px] text-[#9ca3af] leading-none">{admin.email}</p>
            </div>
          </button>
        )}
      </div>
    </header>
  )
}
