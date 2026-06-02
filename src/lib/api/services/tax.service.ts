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
  TaxDocumentRefResponse,
  LinkTaxDocumentRequest,
} from '../types/tax.types'

const wsHeaders = (workspaceId?: string) =>
  workspaceId ? { 'X-Workspace-ID': workspaceId } : undefined

export const taxService = {
  getProfile: (workspaceId: string) =>
    apiClient
      .get('tax/profile', { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxProfileResponse>>()
      .then(r => r.data),

  updateProfile: (workspaceId: string, body: UpdateTaxProfileRequest) =>
    apiClient
      .put('tax/profile', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxProfileResponse>>()
      .then(r => r.data),

  listCalculations: (
    workspaceId: string,
    params?: { period?: string; tax_type?: string; status?: string; limit?: number; offset?: number },
  ) =>
    apiClient
      .get('tax/calculations', { searchParams: params, headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxCalculationResponse[]>>()
      .then(r => r.data),

  getCalculation: (workspaceId: string, id: string) =>
    apiClient
      .get(`tax/calculations/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxCalculationResponse>>()
      .then(r => r.data),

  listCalculationDocuments: (workspaceId: string, calculationId: string) =>
    apiClient
      .get(`tax/calculations/${calculationId}/documents`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxDocumentRefResponse[]>>()
      .then(r => r.data),

  linkCalculationDocument: (workspaceId: string, calculationId: string, body: LinkTaxDocumentRequest) =>
    apiClient
      .post(`tax/calculations/${calculationId}/documents`, { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxDocumentRefResponse>>()
      .then(r => r.data),

  getPPNSummary: (workspaceId: string, period: string) =>
    apiClient
      .get('tax/summary/ppn', { searchParams: { period }, headers: wsHeaders(workspaceId) })
      .json<APIResponse<PPNSummaryResponse>>()
      .then(r => r.data),

  getPPhSummary: (workspaceId: string, periodFrom: string, periodTo: string) =>
    apiClient
      .get('tax/summary/pph', { searchParams: { period_from: periodFrom, period_to: periodTo }, headers: wsHeaders(workspaceId) })
      .json<APIResponse<PPhSummaryResponse>>()
      .then(r => r.data),

  requestReport: (workspaceId: string, body: RequestTaxReportRequest) =>
    apiClient
      .post('tax/reports', { json: body, headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxReportJobResponse>>()
      .then(r => r.data),

  getReportJob: (workspaceId: string, id: string) =>
    apiClient
      .get(`tax/reports/${id}`, { headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxReportJobResponse>>()
      .then(r => r.data),

  listReportJobs: (workspaceId: string, params?: { limit?: number; offset?: number }) =>
    apiClient
      .get('tax/reports', { searchParams: params, headers: wsHeaders(workspaceId) })
      .json<APIResponse<TaxReportJobResponse[]>>()
      .then(r => r.data),
}
