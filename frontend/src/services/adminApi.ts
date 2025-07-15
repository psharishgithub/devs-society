import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

// Create admin API instance
const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create super admin API instance
const superAdminApi = axios.create({
  baseURL: `${API_URL}/super-admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create college admin API instance
const collegeAdminApi = axios.create({
  baseURL: `${API_URL}/college-admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
const addAuthInterceptor = (apiInstance: any) => {
  apiInstance.interceptors.request.use(
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
  apiInstance.interceptors.response.use(
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
}

// Add interceptors to all API instances
addAuthInterceptor(adminApi)
addAuthInterceptor(superAdminApi)
addAuthInterceptor(collegeAdminApi)

// Admin interfaces
export interface Admin {
  id: string
  username: string
  email: string
  fullName: string
  role: 'super-admin' | 'admin' | 'college-admin'
  assignedCollege?: {
    id: string
    name: string
    code: string
    location: string
  }
  batchYear?: number // Year of the batch this admin represents
  tenureInfo?: {
    startDate: Date
    endDate?: Date
    isActive: boolean
  }
  tenure?: {
    startDate: Date
    endDate?: Date
    isActive: boolean
  }
  permissions: string[]
  lastLogin?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface College {
  id: string
  name: string
  code: string
  location: string
  address: string
  contactInfo: {
    email: string
    phone: string
    website?: string
  }
  currentTenureHeads?: Array<{
    id: string
    adminId: string
    adminName: string
    adminEmail: string
    batchYear: number
    startDate: string
    isActive: boolean
  }> | null
  tenureHistory: Array<{
    adminId: string
    startDate: Date
    endDate?: Date
    transferReason?: string
  }>
  isActive: boolean
  createdAt: Date
}

export interface AdminLoginData {
  identifier: string // username or email
  password: string
}

export interface AdminRegisterData {
  username: string
  email: string
  password: string
  fullName: string
  assignedCollege?: string
}

export interface AdminDashboardStats {
  totalUsers: number
  totalEvents: number
  activeMembers: number
  upcomingEvents: number
}

export interface SuperAdminStats {
  totalColleges: number
  totalAdmins: number
  totalUsers: number
  totalEvents: number
  collegeWiseData: Array<{
    college: {
      name: string
      code: string
    }
    users: number
    events: number
    admin: string | null
  }>
}

// Admin API functions
export const adminApiService = {
  // Authentication
  login: async (data: AdminLoginData) => {
    const response = await adminApi.post('/login', data)
    return response.data
  },

  register: async (data: AdminRegisterData) => {
    const response = await adminApi.post('/register', data)
    return response.data
  },

  // Profile
  getProfile: async () => {
    const response = await adminApi.get('/profile')
    return response.data
  },

  // Dashboard stats (basic)
  getDashboardStats: async (): Promise<{ success: boolean; stats: AdminDashboardStats }> => {
    const response = await adminApi.get('/dashboard')
    return response.data
  },

  // QR Code Scanning
  scanQRCode: async (qrData: string) => {
    const response = await adminApi.post('/scan-qr', { qrData })
    return response.data
  },

  getEventRegistrations: async (eventId: string) => {
    const response = await adminApi.get(`/events/${eventId}/registrations`)
    return response.data
  },
}

// SuperAdmin API functions
export const superAdminApiService = {
  // Dashboard and Analytics
  getDashboardStats: async () => {
    const response = await superAdminApi.get('/dashboard')
    return response.data
  },

  getAnalytics: async () => {
    const response = await superAdminApi.get('/analytics')
    return response.data
  },

  // College Management
  getColleges: async () => {
    const response = await superAdminApi.get('/colleges')
    return response.data
  },

  createCollege: async (data: { 
    name: string
    code: string
    location: string
    address: string
    contactInfo: {
      email: string
      phone: string
      website?: string
    }
  }) => {
    const response = await superAdminApi.post('/colleges', data)
    return response.data
  },

  deleteCollege: async (id: string) => {
    const response = await superAdminApi.delete(`/colleges/${id}`)
    return response.data
  },

  // Admin Management
  getAdmins: async () => {
    const response = await superAdminApi.get('/admins')
    return response.data
  },

  getAdminsForEvents: async () => {
    const response = await superAdminApi.get('/admins-for-events')
    return response.data
  },

  createAdmin: async (data: { 
    fullName: string
    username: string
    email: string
    password: string
    assignedCollege: string
    batchYear: number
  }) => {
    const response = await superAdminApi.post('/admins', data)
    return response.data
  },

  deleteAdmin: async (id: string) => {
    const response = await superAdminApi.delete(`/admins/${id}`)
    return response.data
  },

  // Tenure Management
  transferTenure: async (data: {
    toAdminId: string
    collegeId: string
    batchYear: number
    transferReason?: string
  }) => {
    const response = await superAdminApi.post('/admins/transfer', data)
    return response.data
  },

  endTenure: async (data: { adminId: string; reason: string }) => {
    const response = await superAdminApi.post('/end-tenure', data)
    return response.data
  },

  // Global User Management
  getAllUsers: async (params?: { 
    page?: number
    limit?: number
    search?: string
    college?: string
    role?: string 
  }) => {
    const response = await superAdminApi.get('/users', { params })
    return response.data
  },

  // Global Event Management
  getAllEvents: async (params?: { 
    page?: number
    limit?: number
    search?: string
    college?: string
    eventType?: string 
  }) => {
    const response = await superAdminApi.get('/events', { params })
    return response.data
  },

  createEvent: async (eventData: any) => {
    const response = await superAdminApi.post('/events', eventData)
    return response.data
  },

  updateEvent: async (id: string, eventData: any) => {
    const response = await superAdminApi.put(`/events/${id}`, eventData)
    return response.data
  },

  deleteEvent: async (id: string) => {
    const response = await superAdminApi.delete(`/events/${id}`)
    return response.data
  },

  // Event Registrations and QR Codes
  getEventRegistrations: async (eventId: string) => {
    const response = await superAdminApi.get(`/events/${eventId}/registrations`)
    return response.data
  },

  scanQRCode: async (qrData: string) => {
    const response = await superAdminApi.post('/scan-qr', { qrData })
    return response.data
  },

  // Get single entities
  getCollege: async (id: string) => {
    const response = await superAdminApi.get(`/colleges/${id}`)
    return response.data
  },

  getAdmin: async (id: string) => {
    const response = await superAdminApi.get(`/admins/${id}`)
    return response.data
  },

  getEvent: async (id: string) => {
    const response = await superAdminApi.get(`/events/${id}`)
    return response.data
  },

  getUser: async (id: string) => {
    const response = await superAdminApi.get(`/users/${id}`)
    return response.data
  },

  // Update entities
  updateCollege: async (id: string, data: {
    name?: string
    code?: string
    location?: string
    address?: string
    contactInfo?: {
      email?: string
      phone?: string
      website?: string
    }
  }) => {
    const response = await superAdminApi.put(`/colleges/${id}`, data)
    return response.data
  },

  updateEventDetails: async (id: string, data: {
    title?: string
    description?: string
    date?: string
    location?: string
    maxAttendees?: number
    eventType?: string
    targetCollege?: string
  }) => {
    const response = await superAdminApi.put(`/events/${id}`, data)
    return response.data
  },

  updateAdminDetails: async (id: string, data: {
    fullName?: string
    role?: string
    isActive?: boolean
  }) => {
    const response = await superAdminApi.put(`/admins/${id}`, data)
    return response.data
  },
  // Add updateUser for super admin
  updateUser: async (id: string, data: any) => {
    const response = await superAdminApi.put(`/users/${id}`, data)
    return response.data
  }
}

// College Admin API functions
export const collegeAdminApiService = {
  // Dashboard and Analytics
  getAnalytics: async () => {
    const response = await collegeAdminApi.get('/analytics')
    return response.data
  },

  // User Management (College-specific)
  getUsers: async (params?: { 
    page?: number
    limit?: number
    search?: string
    role?: string 
  }) => {
    const response = await collegeAdminApi.get('/users', { params })
    return response.data
  },

  getUser: async (id: string) => {
    const response = await collegeAdminApi.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, data: any) => {
    const response = await collegeAdminApi.put(`/users/${id}`, data)
    return response.data
  },

  // Event Management (College-specific)
  getEvents: async (params?: { 
    page?: number
    limit?: number
    search?: string
    status?: string 
  }) => {
    const response = await collegeAdminApi.get('/events', { params })
    return response.data
  },

  getEvent: async (id: string) => {
    const response = await collegeAdminApi.get(`/events/${id}`)
    return response.data
  },

  createEvent: async (eventData: any) => {
    const response = await collegeAdminApi.post('/events', eventData)
    return response.data
  },

  updateEvent: async (id: string, eventData: any) => {
    const response = await collegeAdminApi.put(`/events/${id}`, eventData)
    return response.data
  },

  deleteEvent: async (id: string) => {
    const response = await collegeAdminApi.delete(`/events/${id}`)
    return response.data
  }
}

export default adminApi 