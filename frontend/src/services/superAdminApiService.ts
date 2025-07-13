// Super Admin API Service
// This service provides functions for super admin operations

import { adminApi } from './adminApi'

// Re-export the getAdminsForEvents function from adminApi
export const superAdminApiService = {
  getAdminsForEvents: adminApi.getAdminsForEvents
}

// Export the function directly as well for convenience
export const { getAdminsForEvents } = adminApi 