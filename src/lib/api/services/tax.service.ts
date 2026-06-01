import { apiClient } from '../client'
import type { APIResponse } from '../types/shared.types'
import type {
  TaxProfileResponse,
  UpdateTaxProfileRequest,
  TaxCalculationResponse,
  PPNSummaryResponse,
  PPhSummaryResponse,
  RequestTaxReportRequest,
  TaxReportJobResponse,
} from '../types/tax.types'

export const taxService = {
  getProfile: () =>
    apiClient.get('tax/profile').json<APIResponse<TaxProfileResponse>>().then(r => r.data),

  updateProfile: (body: UpdateTaxProfileRequest) =>
    apiClient.put('tax/profile', { json: body }).json<APIResponse<TaxProfileResponse>>().then(r => r.data),

  listCalculations: (params?: { period?: string; tax_type?: string; status?: string; limit?: number; offset?: number }) =>
    apiClient.get('tax/calculations', { searchParams: params }).json<APIResponse<TaxCalculationResponse[]>>().then(r => r.data),

  getPPNSummary: (period: string) =>
    apiClient.get('tax/summary/ppn', { searchParams: { period } }).json<APIResponse<PPNSummaryResponse>>().then(r => r.data),

  getPPhSummary: (periodFrom: string, periodTo: string) =>
    apiClient.get('tax/summary/pph', { searchParams: { period_from: periodFrom, period_to: periodTo } }).json<APIResponse<PPhSummaryResponse>>().then(r => r.data),

  requestReport: (body: RequestTaxReportRequest) =>
    apiClient.post('tax/reports', { json: body }).json<APIResponse<TaxReportJobResponse>>().then(r => r.data),

  getReportJob: (id: string) =>
    apiClient.get(`tax/reports/${id}`).json<APIResponse<TaxReportJobResponse>>().then(r => r.data),

  listReportJobs: (params?: { limit?: number; offset?: number }) =>
    apiClient.get('tax/reports', { searchParams: params }).json<APIResponse<TaxReportJobResponse[]>>().then(r => r.data),
}
