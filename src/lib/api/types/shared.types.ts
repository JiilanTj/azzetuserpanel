// -------------------------------------------------------
// Shared API shapes — used across all services
// -------------------------------------------------------

export interface APIResponse<T = unknown> {
  success: boolean
  data: T
  meta?: unknown
}

export interface APIError {
  code: string
  message: string
  domain: string
  request_id: string
  timestamp: string
  details?: FieldError[]
}

export interface FieldError {
  field: string
  message: string
}

export interface ErrorResponse {
  success: false
  error: APIError
}
