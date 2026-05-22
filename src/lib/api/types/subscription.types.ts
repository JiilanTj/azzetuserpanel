// -------------------------------------------------------
// Subscription Domain Types — Plans, Subscriptions, Billing, Invoices, Payments
// -------------------------------------------------------

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled' | 'pending_payment'
export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'

// -------------------------------------------------------
// Plans
// -------------------------------------------------------

export interface FeatureResponse {
  feature_key: string
  feature_type: 'boolean' | 'quota' | 'tier'
  value_bool?: boolean
  value_int?: number
  value_text?: string
}

export interface PlanResponse {
  id: string
  name: string
  slug: string
  description?: string
  type: 'free' | 'paid'
  price_monthly: number
  price_yearly: number
  is_trial: boolean
  trial_days: number
  tier: number
  is_active: boolean
  features?: FeatureResponse[]
  created_at: string
  updated_at?: string
}

// -------------------------------------------------------
// Subscriptions
// -------------------------------------------------------

export interface SubscribeRequest {
  plan_id: string
  billing_cycle?: 'monthly' | 'yearly'
}

export interface SubscriptionResponse {
  id: string
  workspace_id: string
  plan_id: string
  plan_name?: string
  plan_slug?: string
  billing_cycle?: 'monthly' | 'yearly'
  status: SubscriptionStatus
  started_at: string
  expires_at?: string
  trial_ends_at?: string
  cancelled_at?: string
  payment_url?: string
  created_at: string
}

export interface UsageResponse {
  feature_key: string
  usage_count: number
  limit: number
  period_start: string
  period_end: string
}

// -------------------------------------------------------
// Billing & Payments
// -------------------------------------------------------

export interface InvoiceResponse {
  id: string
  workspace_id: string
  subscription_id: string
  invoice_number: string
  description?: string
  amount: number
  currency: string
  status: InvoiceStatus
  due_date: string
  paid_at?: string
  created_at: string
}

export interface CreatePaymentRequest {
  invoice_id: string
}

export interface PaymentResponse {
  id: string
  invoice_id: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method?: string
  payment_url?: string
  paid_at?: string
  expires_at?: string
  created_at: string
}
