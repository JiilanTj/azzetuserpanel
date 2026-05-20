import { QueryClient } from '@tanstack/react-query'
import { HTTPError } from '@/lib/api/client'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Re-fetch stale data in the background when the window regains focus
      refetchOnWindowFocus: true,
      // Treat data as stale after 30 seconds
      staleTime: 30_000,
      // Don't retry on 4xx errors (only on network errors or 5xx)
      retry: (failureCount, error) => {
        if (error instanceof HTTPError) {
          const status = error.response.status
          // Client errors → no retry
          if (status >= 400 && status < 500) return false
        }
        return failureCount < 2
      },
    },
    mutations: {
      // Don't retry mutations — they may not be idempotent
      retry: false,
    },
  },
})
