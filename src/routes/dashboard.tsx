import { createRoute } from '@tanstack/react-router'
import { authedLayout } from './_authed'
import {
  DotsHorizontalIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  DesktopIcon,
  RocketIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  BarChartIcon,
  ChatBubbleIcon,
  Link2Icon,
  StarIcon,
  ArchiveIcon,
  ExclamationTriangleIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import { cn, formatIDR } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const MRR_DATA = [
  { name: 'Oct', enterprise: 40000000, pro: 120000000, basic: 80000000 },
  { name: 'Nov', enterprise: 50000000, pro: 140000000, basic: 100000000 },
  { name: 'Dec', enterprise: 70000000, pro: 130000000, basic: 110000000 },
  { name: 'Jan', enterprise: 100000000, pro: 180000000, basic: 150000000 },
  { name: 'Feb', enterprise: 120000000, pro: 150000000, basic: 120000000 },
  { name: 'Mar', enterprise: 150000000, pro: 200000000, basic: 160000000 },
  { name: 'Apr', enterprise: 180000000, pro: 220000000, basic: 170000000 },
]

export const dashboardRoute = createRoute({
  getParentRoute: () => authedLayout,
  path: '/dashboard',
  component: DashboardPage,
})

// -------------------------------------------------------
// Dashboard Page - Platform Admin for SaaS Accounting
// -------------------------------------------------------

function DashboardPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

      {/* ========================================================= */}
      {/* LEFT COLUMN (BENTO GRID)                                    */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-6">

        {/* ROW 1: Chart (Span 2) & Quick Metrics (Span 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MRR Overview Chart */}
          <div className="lg:col-span-2 rounded-surface bg-surface p-6 shadow-sm border border-(--gray-4) flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[32px] font-bold text-(--gray-12) tracking-tight leading-none mb-1">{formatIDR(723750000)}</h2>
                <p className="text-[13px] text-(--gray-9)">Monthly Recurring Revenue (MRR)</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-(--gray-4) text-[12px] font-medium text-(--gray-11) hover:bg-(--gray-2)">
                  30d <ChevronDownIcon className="h-3.5 w-3.5" />
                </button>
                <div className="flex gap-1 border border-(--gray-4) rounded-lg p-0.5">
                  <button className="p-1 rounded-md bg-(--gray-3) text-(--gray-12)"><DotsHorizontalIcon className="h-3.5 w-3.5" /></button>
                  <button className="p-1 rounded-md text-(--gray-9) hover:bg-(--gray-2)"><DotsHorizontalIcon className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="flex-1 h-[220px] mt-4 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MRR_DATA} barSize={32} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-gray-4)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-gray-9)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--color-gray-9)' }} width={60} tickFormatter={(val) => `Rp${val / 1000000}jt`} />
                  <Tooltip
                    cursor={{ fill: 'var(--color-gray-3)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-gray-4)', backgroundColor: 'var(--color-surface)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any, name: any) => [formatIDR(Number(value)), String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                  />
                  <Bar dataKey="basic" stackId="a" fill="#f59e0b" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pro" stackId="a" fill="#10b981" />
                  <Bar dataKey="enterprise" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-col gap-4">
            <div className="rounded-surface bg-surface p-5 shadow-sm border border-(--gray-4) flex-1 flex flex-col justify-center">
              <p className="text-[12px] font-medium text-(--gray-9) mb-1">Total Platform Revenue</p>
              <p className="text-2xl font-bold text-(--gray-12) mb-1.5">{formatIDR(8130000000)}</p>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowUpIcon className="h-3 w-3" /> 12.4% <span className="text-(--gray-8) font-normal">YTD growth</span>
              </p>
            </div>
            <div className="rounded-surface bg-surface p-5 shadow-sm border border-(--gray-4) flex-1 flex flex-col justify-center">
              <p className="text-[12px] font-medium text-(--gray-9) mb-1">Active Subscriptions</p>
              <p className="text-2xl font-bold text-(--gray-12) mb-1.5">1,248</p>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowUpIcon className="h-3 w-3" /> 4.2% <span className="text-(--gray-8) font-normal">from last month</span>
              </p>
            </div>
            <div className="rounded-surface bg-surface p-5 shadow-sm border border-(--gray-4) flex-1 flex flex-col justify-center">
              <p className="text-[12px] font-medium text-(--gray-9) mb-1">Churn Rate</p>
              <p className="text-2xl font-bold text-(--gray-12) mb-1.5">1.2%</p>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowDownIcon className="h-3 w-3" /> 0.3% <span className="text-(--gray-8) font-normal">improvement</span>
              </p>
            </div>
          </div>

        </div>

        {/* ROW 2: System Usage & Platform Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-surface bg-surface p-6 shadow-sm border border-(--gray-4) flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-(--gray-12)">Cloud Infrastructure Usage</h3>
                <p className="text-[12px] text-(--gray-9)">Global Database Storage</p>
              </div>
            </div>
            <div className="h-4 w-full mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={[{ name: 'usage', used: 7.8, free: 2.2 }]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide domain={[0, 10]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Bar dataKey="used" stackId="a" fill="#3b82f6" radius={[8, 0, 0, 8]} isAnimationActive={false} />
                  <Bar dataKey="free" stackId="a" fill="var(--color-gray-3)" radius={[0, 8, 8, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[12px] font-medium">
              <span className="text-(--gray-12)">7.8 TB used</span>
              <span className="text-(--gray-9)">10.0 TB allocated</span>
            </div>
          </div>

          <div className="rounded-surface bg-surface p-6 shadow-sm border border-(--gray-4) flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10 max-w-[220px]">
              <h3 className="text-[15px] font-bold text-(--gray-12) mb-2 leading-tight">Platform Insights</h3>
              <p className="text-[11px] text-(--gray-9) mb-3">15 tenants are approaching their API limits. Consider launching an automated upsell campaign.</p>
              <button className="text-[12px] font-semibold text-(--blue-11) hover:underline flex items-center gap-1">
                View candidates <ChevronDownIcon className="h-3 w-3 -rotate-90" />
              </button>
            </div>
            {/* Decorative block */}
            <div className="absolute right-[-20px] bottom-[-20px] flex gap-1 opacity-60">
              <div className="w-12 h-24 bg-blue-200 dark:bg-blue-900 rounded-xl" />
              <div className="w-12 h-32 bg-blue-400 dark:bg-blue-700 rounded-xl -translate-y-4" />
              <div className="w-12 h-16 bg-blue-600 dark:bg-blue-500 rounded-xl mt-auto" />
            </div>
          </div>
        </div>

        {/* ROW 3: Plans Breakdown, Retention, Recent Signups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Subscription Plans */}
          <div className="rounded-surface bg-surface p-5 shadow-sm border border-(--gray-4)">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-(--gray-12)">Subscription Plans</h3>
                <p className="text-[11px] text-(--gray-9)">Tenant distribution</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-(--gray-12) mb-4">1,248 <span className="text-sm font-normal text-(--gray-9)">Total</span></p>

            <div className="h-[140px] w-full mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Enterprise', value: 15, fill: '#3b82f6' },
                      { name: 'Professional', value: 45, fill: '#10b981' },
                      { name: 'Basic', value: 25, fill: '#f59e0b' },
                      { name: 'Free Trial', value: 15, fill: 'var(--color-gray-3)' }
                    ]}
                    dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} stroke="none"
                  >
                    {[
                      { name: 'Enterprise', value: 15, fill: '#3b82f6' },
                      { name: 'Professional', value: 45, fill: '#10b981' },
                      { name: 'Basic', value: 25, fill: '#f59e0b' },
                      { name: 'Free Trial', value: 15, fill: 'var(--color-gray-3)' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-gray-4)', backgroundColor: 'var(--color-surface)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--color-gray-12)' }}
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-2 text-[11px] font-medium text-(--gray-9) mt-4">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-[#3b82f6]" /> Enterprise</div><span>15%</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-[#10b981]" /> Professional</div><span>45%</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-[#f59e0b]" /> Basic</div><span>25%</span></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded bg-(--gray-3)" /> Free Trial</div><span>15%</span></div>
            </div>
          </div>

          {/* Retention Health */}
          <div className="rounded-surface bg-surface p-5 shadow-sm border border-(--gray-4) flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-(--gray-12)">Customer Retention</h3>
                <p className="text-[11px] text-(--gray-9)">Platform stickiness</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-(--gray-12) mb-1">98.8%</p>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mb-6">
              <ArrowUpIcon className="h-2.5 w-2.5" /> 1.2% <span className="text-(--gray-8) font-normal">vs industry avg</span>
            </p>

            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Recharts Semi Circle */}
              <div className="w-full h-24 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Retained', value: 98.8, fill: '#10b981' },
                        { name: 'Churned', value: 1.2, fill: 'var(--color-gray-3)' }
                      ]}
                      cx="50%" cy="100%"
                      startAngle={180} endAngle={0}
                      innerRadius={65} outerRadius={85}
                      dataKey="value" stroke="none"
                      isAnimationActive={false}
                    >
                      {[
                        { name: 'Retained', value: 98.8, fill: '#10b981' },
                        { name: 'Churned', value: 1.2, fill: 'var(--color-gray-3)' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-gray-4)', backgroundColor: 'var(--color-surface)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', zIndex: 50 }}
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-end justify-center">
                  <span className="text-xl font-bold text-(--gray-12) leading-none">High</span>
                </div>
              </div>
              <p className="text-[10px] text-(--gray-9) text-center mt-2 max-w-[140px]">
                Calculated based on renewal rates over the past 12 months
              </p>
            </div>
          </div>

          {/* Recent Onboardings */}
          <div className="rounded-surface bg-surface p-5 shadow-sm border border-(--gray-4)">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[14px] font-bold text-(--gray-12)">Recent Onboardings</h3>
              <button className="flex items-center gap-1 px-2 py-1 rounded border border-(--gray-4) text-[10px] font-semibold text-(--gray-12) hover:bg-(--gray-2)">
                View all
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-semibold text-(--gray-8) uppercase tracking-wider mb-2">Enterprise Plan</p>
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                    <RocketIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-bold text-(--gray-12) mb-1">
                      <span>PT Nusantara Corp</span>
                      <span className="text-emerald-600">Active</span>
                    </div>
                    <div className="h-1.5 w-full mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={[{ name: 'progress', val: 100 }]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <XAxis type="number" hide domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" hide />
                          <Bar dataKey="val" fill="#3b82f6" radius={4} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[9px] text-(--gray-8)">Onboarding completed in 3 days</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-(--gray-8) uppercase tracking-wider mb-2">Professional Plan</p>
                <div className="flex gap-3 items-center mb-3">
                  <div className="w-10 h-10 rounded-lg bg-(--gray-2) text-(--gray-11) flex items-center justify-center">
                    <DesktopIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-bold text-(--gray-12) mb-1">
                      <span>TechSolutions Ltd</span>
                      <span className="text-amber-500">Setting up</span>
                    </div>
                    <div className="h-1.5 w-full mb-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={[{ name: 'progress', val: 60, rest: 40 }]} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <XAxis type="number" hide domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" hide />
                          <Bar dataKey="val" stackId="a" fill="#f59e0b" radius={[4, 0, 0, 4]} isAnimationActive={false} />
                          <Bar dataKey="rest" stackId="a" fill="var(--color-gray-3)" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[9px] text-(--gray-8)">Importing financial data (60%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ========================================================= */}
      {/* RIGHT COLUMN (SIDEBAR WIDGETS)                            */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-6">

        {/* Right Pane Container */}
        <div className="rounded-surface bg-surface shadow-sm border border-(--gray-4) flex flex-col overflow-hidden">

          {/* Top Priority Tenants Section */}
          <div className="p-5 border-b border-(--gray-4)">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-(--gray-12)">Priority Accounts</h3>
                <p className="text-[11px] text-(--gray-9)">Needs attention</p>
              </div>
              <button className="flex items-center gap-1 px-2 py-1 rounded border border-(--gray-4) text-[10px] font-semibold text-(--gray-12) hover:bg-(--gray-2)">
                <PlusIcon className="h-3 w-3" /> Manage
              </button>
            </div>

            {/* VIP Tenant Highlight */}
            <div className="w-full rounded-xl bg-linear-to-br from-[#1e3a8a] to-[#3b82f6] p-4 flex flex-col justify-between text-blue-50 relative overflow-hidden mb-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
              <div className="flex justify-between items-center relative z-10 mb-4">
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/20 rounded">Enterprise VIP</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </div>
              <div className="relative z-10">
                <p className="text-[16px] font-bold mb-1">MegaFinance Group</p>
                <div className="flex items-center gap-2 text-[10px] opacity-90">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Contract renewal in 14 days
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2 px-1">
              {[
                { icon: EnvelopeClosedIcon, label: 'Email' },
                { icon: FileTextIcon, label: 'Contract' },
                { icon: BarChartIcon, label: 'Report' },
                { icon: ChatBubbleIcon, label: 'Contact' },
              ].map(action => (
                <div key={action.label} className="flex flex-col items-center gap-1.5 cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg border border-(--gray-4) bg-surface flex items-center justify-center text-(--gray-12) group-hover:bg-(--gray-2) transition-colors">
                    <action.icon className="h-[18px] w-[18px]" />
                  </div>
                  <span className="text-[9px] font-medium text-(--gray-10)">{action.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Support Agents / Admins */}
          <div className="p-5 border-b border-(--gray-4)">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[12px] font-bold text-(--gray-12)">Active Support Team</h3>
              <button className="text-(--gray-9) hover:text-(--gray-12)"><DotsHorizontalIcon className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { name: 'Diana', status: 'bg-emerald-500' },
                { name: 'Budi', status: 'bg-emerald-500' },
                { name: 'Sari', status: 'bg-emerald-500' },
                { name: 'Reza', status: 'bg-amber-500' },
                { name: 'Tomy', status: 'bg-(--gray-5)' },
              ].map((agent, i) => (
                <div key={agent.name} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-(--gray-3) overflow-hidden border border-(--gray-4) relative">
                    <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt={agent.name} className="w-full h-full object-cover" />
                    <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#141414]", agent.status)} />
                  </div>
                  <span className="text-[10px] font-medium text-(--gray-11)">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs / Event History */}
          <div className="p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold text-(--gray-12)">System Events</h3>
              <button className="flex items-center gap-1 px-2 py-1 rounded border border-(--gray-4) text-[10px] font-medium">
                Real-time <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 animate-pulse" />
              </button>
            </div>

            <div className="flex justify-between text-[10px] text-(--gray-8) font-medium mb-3 px-1">
              <span>Event details</span>
              <span>Time</span>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: 'New API Key generated', sub: 'TechCorp SaaS Integration', time: 'Just now', type: 'info', icon: Link2Icon, i: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
                { name: 'Subscription upgraded', sub: 'PT Abadi to Enterprise', time: '12m ago', type: 'success', icon: StarIcon, i: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' },
                { name: 'Database automated backup', sub: 'Cluster 01 - Completed', time: '1h ago', type: 'system', icon: ArchiveIcon, i: 'bg-(--gray-2) text-(--gray-11)' },
                { name: 'Failed payment webhook', sub: 'Stripe integration error', time: '2h ago', type: 'error', icon: ExclamationTriangleIcon, i: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
                { name: 'New admin account created', sub: 'User: dewi@azzet.io', time: '5h ago', type: 'info', icon: PersonIcon, i: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-8 h-8 rounded flex items-center justify-center', ev.i)}>
                      <ev.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-(--gray-12) leading-none mb-1 group-hover:text-blue-600 transition-colors">{ev.name}</p>
                      <p className="text-[10px] text-(--gray-8) leading-none truncate max-w-[150px]">{ev.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-(--gray-8) font-medium">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
