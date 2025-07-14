// Super Admin API Service
// This service provides functions for super admin operations

import { superAdminApiService as baseSuperAdminApiService } from './adminApi'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

// Create super admin API instance
const superAdminApi = axios.create({
  baseURL: `${API_URL}/super-admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor
superAdminApi.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
superAdminApi.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// Extended SuperAdmin API Service with internal booking functionality
export const superAdminApiService = {
  ...baseSuperAdminApiService,

  // Internal Booking Management
  createInternalBooking: async (bookingData: {
    userId: string
    eventId: string
    notes?: string
    adminNotes?: string
  }) => {
    const response = await superAdminApi.post('/internal-booking', bookingData)
    return response.data
  },

  getInternalBookings: async () => {
    const response = await superAdminApi.get('/internal-bookings')
    return response.data
  },
}

// Export the base functions for convenience
export const { getAdminsForEvents } = baseSuperAdminApiService 