import axios from 'axios'

// API Configuration
const API_BASE_URL = 'http://localhost:5050/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// QR Code API
export const qrCodeAPI = {
  getMyEventQR: async (eventId: string): Promise<{
    success: boolean
    qrCode: {
      url: string
      checkInCode: string
      eventId: string
      registrationId: string
    }
  }> => {
    const response = await api.get(`/qr-code/event/${eventId}/my-qr`)
    return response.data
  },
}
// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  college: string
  batchYear: string
  role: 'core-member' | 'board-member' | 'special-member' | 'regular-member'
  memberId: string
  photoUrl?: string
  isActive: boolean
  createdAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  maxAttendees?: number
  attendees: User[]
  isActive: boolean
  createdAt: string
  eventType?: string
  registrationCount?: number
  waitlistCount?: number
  isRegistered?: boolean
  registrationStatus?: 'registered' | 'waitlisted' | 'cancelled'
  isPaid?: boolean
  price?: number
  adminPricing?: Array<{
    adminType: string
    amount: number
    adminId?: string
  }>
  priceInfo?: {
    isPaid: boolean
    price: number
    adminName?: string
    collegeName?: string
    batchYear?: string
  }
}

export interface UserStats {
  eventsAttended: number
  upcomingEvents: number
  memberSince: string
  points: number
  totalEvents: number
  registeredEvents: number
}

export interface EventRegistration {
  id: string
  eventId: string
  userId: string
  status: 'registered' | 'waitlisted' | 'cancelled'
  registeredAt: string
}

export interface LoginResponse {
  success: boolean
  message: string
  token: string
  user: User
}

export interface RegisterData {
  fullName: string
  email: string
  phone: string
  college: string
  batchYear: string
  role: string
  photo?: File
}

// Public API
export const publicAPI = {
  getColleges: async (): Promise<{ success: boolean; colleges: any[] }> => {
    const response = await api.get('/public/colleges')
    return response.data
  },
}

// Auth API
export const authAPI = {
  login: async (email: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email })
    return response.data
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value as string | Blob)
      }
    })
    
    const response = await api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

// Users API
export const usersAPI = {
  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/users/profile')
    return response.data
  },

  updateProfile: async (updates: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await api.put('/users/profile', updates)
    return response.data
  },

  getAllUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    const response = await api.get('/users')
    return response.data
  },

  getUserStats: async (): Promise<{ success: boolean; stats: UserStats }> => {
    const response = await api.get('/users/stats')
    return response.data
  },

  getEventRegistrations: async (): Promise<{ success: boolean; registrations: EventRegistration[] }> => {
    const response = await api.get('/users/registrations')
    return response.data
  },
}

// Events API
export const eventsAPI = {
  getEvents: async (): Promise<{ success: boolean; events: Event[] }> => {
    const response = await api.get('/events')
    return response.data
  },

  getEventsWithPricing: async (): Promise<{ success: boolean; events: Event[]; userInfo?: any }> => {
    const response = await api.get('/events/with-pricing')
    return response.data
  },

  getUpcomingEvents: async (): Promise<{ success: boolean; events: Event[] }> => {
    const response = await api.get('/events/upcoming')
    return response.data
  },

  getAdminsForEvents: async (): Promise<any> => {
    const response = await api.get('/events/admins-for-events');
    return response.data;
  },

  getEvent: async (id: string): Promise<{ success: boolean; event: Event }> => {
    const response = await api.get(`/events/${id}`)
    return response.data
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'attendees' | 'isActive' | 'createdAt'>): Promise<{ success: boolean; event: Event }> => {
    const response = await api.post('/events', eventData)
    return response.data
  },

  registerForEvent: async (eventId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/events/${eventId}/register`)
    return response.data
  },



  checkRegistrationStatus: async (eventId: string): Promise<{ success: boolean; isRegistered: boolean; status?: string }> => {
    const response = await api.get(`/events/${eventId}/registration-status`)
    return response.data
  },
}

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token)
}

export const removeAuthToken = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
}

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const setCurrentUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export default api 