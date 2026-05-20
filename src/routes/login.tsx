import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  EyeOpenIcon,
  EyeClosedIcon,
  LockClosedIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  MobileIcon,
  LaptopIcon,
} from '@radix-ui/react-icons'
import { Button, Checkbox } from '@/components/ui'
import { cn } from '@/lib/utils'
import { rootRoute } from './__root'
import { useLoginEmail, useLoginOTP, useRequestOTP } from '@/hooks/use-auth'
import { authMiddleware } from '@/middleware/auth.middleware'
import { useAuthStore } from '@/stores/auth.store'
import logoSvg from '@/assets/logo.svg'

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: authMiddleware.requireGuest,
  component: LoginPage,
})

// ---- Zod schemas -----------------------------------------------

const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  rememberMe: z.boolean(),
})

const totpSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits.')
    .regex(/^\d+$/, 'Digits only.'),
})

type LoginForm = z.infer<typeof loginSchema>
type TotpForm  = z.infer<typeof totpSchema>

// ---- Step type -------------------------------------------------

type Step =
  | 'credentials'   // email + password
  | 'mfa-verify'    // TOTP (MFA already enabled)
  | 'mfa-setup-qr'  // Show QR code (first login, MFA not set up)
  | 'mfa-setup-confirm' // Confirm TOTP after scanning QR

// ---- Left-panel metric card ------------------------------------

function MetricCard({ label, value, change, positive = true, className }: {
  label: string; value: string; change: string; positive?: boolean; className?: string
}) {
  return (
    <div
      className={cn('absolute rounded-2xl border border-white/10 px-4 py-3.5 shadow-xl w-48', className)}
      style={{ backdropFilter: 'blur(16px)', background: 'rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-medium leading-none text-white/50 mb-2.5">{label}</p>
      <p className="text-[22px] font-bold leading-none text-white mb-2">{value}</p>
      <p className={cn('text-[11px] font-medium leading-none', positive ? 'text-emerald-400' : 'text-red-400')}>
        {change}
      </p>
    </div>
  )
}

const FEATURES = [
  'Full control over all user accounts & permissions',
  'Real-time system monitoring & audit trail',
  'Billing management, invoices & subscription control',
]

// ---- Main component --------------------------------------------

function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [step, setStep]           = useState<Step>('credentials')
  const [mfaToken, setMfaToken]   = useState('')
  const [qrCode, setQrCode]       = useState('')
  const [secret, setSecret]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation      = useLogin()
  const mfaVerifyMutation  = useMfaVerify()
  const mfaSetupMutation   = useMfaSetup()
  const mfaConfirmMutation = useMfaConfirm()

  // ---- Step 1 form ----
  const {
    register: regLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: le },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  // ---- TOTP form (used for both mfa-verify and mfa-setup-confirm) ----
  const {
    register: regTotp,
    handleSubmit: handleTotpSubmit,
    formState: { errors: te },
    reset: resetTotp,
  } = useForm<TotpForm>({
    resolver: zodResolver(totpSchema),
    defaultValues: { code: '' },
  })

  // ---- Handlers ----

  const onLoginSubmit = handleLoginSubmit(async ({ email, password }) => {
    const data = await loginMutation.mutateAsync({ email, password })

    if (data.requires_mfa) {
      // Admin has MFA → go to TOTP verify step
      setMfaToken(data.mfa_token ?? '')
      setStep('mfa-verify')
    } else {
      // First login — temp access_token stored by useLogin hook
      // Initiate MFA setup
      const setup = await mfaSetupMutation.mutateAsync()
      setQrCode(setup.qr_code)
      setSecret(setup.secret)
      setStep('mfa-setup-qr')
    }
  })

  const onMfaVerify = handleTotpSubmit(async ({ code }) => {
    const data = await mfaVerifyMutation.mutateAsync({ mfa_token: mfaToken, code })
    setAuth(data.access_token, data.admin)
    navigate({ to: '/dashboard' })
  })

  const onMfaSetupProceed = () => {
    resetTotp()
    setStep('mfa-setup-confirm')
  }

  const onMfaConfirm = handleTotpSubmit(async ({ code }) => {
    const data = await mfaConfirmMutation.mutateAsync({ code })
    setAuth(data.access_token, data.admin)
    navigate({ to: '/dashboard' })
  })

  const isLoading =
    loginMutation.isPending ||
    mfaVerifyMutation.isPending ||
    mfaSetupMutation.isPending ||
    mfaConfirmMutation.isPending

  // ---- Common input class helper ----
  const inputCls = (hasError: boolean) =>
    cn(
      'flex h-10 w-full rounded-lg border px-3 text-sm',
      'bg-(--gray-1) text-(--gray-12) placeholder:text-(--gray-9)',
      'transition-all duration-200 outline-none',
      hasError
        ? 'border-red-500 focus:ring-2 focus:ring-red-400'
        : 'border-(--gray-6) hover:border-(--gray-8) focus:ring-2 focus:ring-(--blue-9) focus:border-(--blue-8)'
    )

  // ---- Render ----

  return (
    <div className="min-h-screen flex bg-(--color-background)">

      {/* ===================================================== */}
      {/* LEFT — branded panel                                   */}
      {/* ===================================================== */}
      <div
        className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col"
        style={{ background: 'linear-gradient(145deg, #0b1530 0%, #0f2060 45%, #1a3a8f 100%)' }}
      >
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        <MetricCard label="Monthly Revenue" value="$2.4M"   change="↑ 12.4% vs last month"   positive className="top-[22%] right-[8%]" />
        <MetricCard label="Active Users"    value="1,247"   change="↑ 84 new this week"       positive className="top-[43%] right-[8%]" />
        <MetricCard label="System Uptime"   value="99.98%"  change="All systems operational"  positive className="top-[64%] right-[8%]" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <div className="flex items-center gap-3">
            <img src={logoSvg} alt="Azzet" className="h-9 w-9" />
            <span className="text-xl font-bold text-white tracking-tight">Azzet OS</span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-blue-400/30 text-blue-300 mb-6 w-fit"
              style={{ background: 'rgba(59,130,246,0.12)' }}>
              Restricted Access · Admin Only
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Admin Control<br />
              <span style={{ color: '#60a5fa' }}>Center</span> — built<br />
              for your team.
            </h1>
            <p className="text-white/55 text-base leading-relaxed mb-10">
              Full visibility and control over users, workspaces, billing, and
              system health — all in one secure place.
            </p>
            <ul className="flex flex-col gap-3">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircledIcon className="h-4 w-4 shrink-0" style={{ color: '#34d399' }} />
                  <span className="text-sm text-white/70">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Azzet Technologies. All rights reserved.</p>
        </div>
      </div>

      {/* ===================================================== */}
      {/* RIGHT — form panel                                      */}
      {/* ===================================================== */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <img src={logoSvg} alt="Azzet" className="h-8 w-8" />
          <span className="text-lg font-bold text-(--gray-12)">Azzet OS</span>
        </div>

        <div className="w-full max-w-[400px]">

          {/* ========================= STEP 1: Credentials ========================= */}
          {step === 'credentials' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">Admin Sign In</h2>
                <p className="text-sm text-(--gray-10)">
                  This portal is restricted to authorized administrators only.
                </p>
              </div>

              <form onSubmit={onLoginSubmit} noValidate className="flex flex-col gap-5">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-email" className="text-sm font-medium text-(--gray-12)">Email address</label>
                  <input id="login-email" type="email" autoComplete="email" placeholder="you@azzet.io"
                    {...regLogin('email')} className={inputCls(!!le.email)} />
                  {le.email && <p className="text-xs text-red-500">{le.email.message}</p>}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-(--gray-12)">Password</label>
                    <button type="button"
                      className="text-xs text-(--blue-11) hover:text-(--blue-9) transition-colors cursor-pointer">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input id="login-password" type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password" placeholder="••••••••••"
                      {...regLogin('password')}
                      className={cn(inputCls(!!le.password), 'pr-10')} />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gray-9) hover:text-(--gray-12) transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeClosedIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  {le.password && <p className="text-xs text-red-500">{le.password.message}</p>}
                </div>

                {/* Remember me */}
                <Checkbox id="remember-me" label="Keep me signed in for 30 days"
                  {...regLogin('rememberMe')} />

                <Button type="submit" variant="solid" size="3" loading={isLoading} className="w-full mt-1"
                  rightIcon={!isLoading ? <ArrowRightIcon /> : undefined}>
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </Button>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-(--gray-5)" />
                  <span className="text-xs text-(--gray-9) shrink-0">or continue with</span>
                  <div className="flex-1 h-px bg-(--gray-5)" />
                </div>

                <Button type="button" variant="outline" size="3" className="w-full" leftIcon={<LockClosedIcon />}
                  onClick={() => toast.info('SSO not configured', { description: 'Contact your IT administrator.' })}>
                  Single Sign-On (SSO)
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-(--gray-9)">
                Not an admin?{' '}
                <button type="button"
                  className="text-(--blue-11) hover:text-(--blue-9) font-medium transition-colors cursor-pointer"
                  onClick={() => toast.info('Contact your administrator to request access.')}>
                  Request access
                </button>
              </p>
            </>
          )}

          {/* ========================= STEP 2a: MFA Verify ========================= */}
          {step === 'mfa-verify' && (
            <>
              <button type="button" onClick={() => setStep('credentials')}
                className="flex items-center gap-1.5 text-xs text-(--gray-10) hover:text-(--gray-12) mb-8 transition-colors cursor-pointer">
                ← Back to sign in
              </button>

              <div className="mb-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <MobileIcon className="h-5 w-5 text-(--blue-11)" />
                </div>
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">Two-Factor Auth</h2>
                <p className="text-sm text-(--gray-10)">
                  Open your authenticator app and enter the 6-digit code for your Azzet admin account.
                </p>
              </div>

              <form onSubmit={onMfaVerify} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mfa-code" className="text-sm font-medium text-(--gray-12)">Verification code</label>
                  <input id="mfa-code" type="text" inputMode="numeric" maxLength={6}
                    autoComplete="one-time-code" placeholder="000000"
                    {...regTotp('code')}
                    className={cn(inputCls(!!te.code), 'text-center text-xl font-bold tracking-[0.5em] h-12')} />
                  {te.code && <p className="text-xs text-red-500">{te.code.message}</p>}
                </div>

                <Button type="submit" variant="solid" size="3" loading={isLoading} className="w-full"
                  rightIcon={!isLoading ? <ArrowRightIcon /> : undefined}>
                  {isLoading ? 'Verifying…' : 'Verify code'}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-(--gray-9)">
                Lost your authenticator?{' '}
                <button type="button"
                  className="text-(--blue-11) hover:text-(--blue-9) font-medium transition-colors cursor-pointer"
                  onClick={() => toast.info('Contact your super administrator to reset MFA.')}>
                  Get help
                </button>
              </p>
            </>
          )}

          {/* ========================= STEP 2b: MFA Setup QR ========================= */}
          {step === 'mfa-setup-qr' && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <LaptopIcon className="h-5 w-5" style={{ color: '#16a34a' }} />
                </div>
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">Set up 2FA</h2>
                <p className="text-sm text-(--gray-10)">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                </p>
              </div>

              {/* QR Code — generated locally, secret never leaves the browser */}
              <div className="flex flex-col items-center mb-6 p-6 rounded-2xl border border-(--gray-5) bg-(--gray-2)">
                <div className="p-3 rounded-xl bg-white mb-4">
                  <QRCodeSVG
                    value={qrCode}
                    size={152}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-(--gray-9) mb-1">Or enter the secret manually:</p>
                <code className="text-xs font-mono bg-(--gray-3) px-3 py-1.5 rounded-lg text-(--gray-12) tracking-wider select-all">
                  {secret}
                </code>
              </div>

              <Button variant="solid" size="3" className="w-full" rightIcon={<ArrowRightIcon />}
                onClick={onMfaSetupProceed}>
                I've scanned the QR code →
              </Button>
            </>
          )}

          {/* ========================= STEP 2b: Confirm TOTP ========================= */}
          {step === 'mfa-setup-confirm' && (
            <>
              <button type="button" onClick={() => setStep('mfa-setup-qr')}
                className="flex items-center gap-1.5 text-xs text-(--gray-10) hover:text-(--gray-12) mb-8 transition-colors cursor-pointer">
                ← Back to QR code
              </button>

              <div className="mb-8">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4"
                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <MobileIcon className="h-5 w-5 text-(--blue-11)" />
                </div>
                <h2 className="text-2xl font-bold text-(--gray-12) mb-1.5">Confirm your code</h2>
                <p className="text-sm text-(--gray-10)">
                  Enter the first 6-digit code from your authenticator app to confirm setup.
                </p>
              </div>

              <form onSubmit={onMfaConfirm} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mfa-confirm-code" className="text-sm font-medium text-(--gray-12)">Authentication code</label>
                  <input id="mfa-confirm-code" type="text" inputMode="numeric" maxLength={6}
                    autoComplete="one-time-code" placeholder="000000"
                    {...regTotp('code')}
                    className={cn(inputCls(!!te.code), 'text-center text-xl font-bold tracking-[0.5em] h-12')} />
                  {te.code && <p className="text-xs text-red-500">{te.code.message}</p>}
                </div>

                <Button type="submit" variant="solid" size="3" loading={isLoading} className="w-full"
                  rightIcon={!isLoading ? <ArrowRightIcon /> : undefined}>
                  {isLoading ? 'Enabling 2FA…' : 'Enable 2FA & Sign in'}
                </Button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
