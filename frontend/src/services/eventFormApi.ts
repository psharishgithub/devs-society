import axios from 'axios'

const API_BASE_URL = 'http://localhost:5050/api'

// Create axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  order: number
}

export interface EventForm {
  id: string
  eventId: string
  title: string
  description?: string
  fields: FormField[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FormSubmission {
  id: string
  eventId: string
  userId: string
  formId: string
  responses: Record<string, any>
  submittedAt: string
  createdAt: string
}

export const eventFormAPI = {
  // Admin APIs
  createEventForm: async (eventId: string, formData: {
    title: string
    description?: string
    fields: Omit<FormField, 'id'>[]
  }): Promise<{ success: boolean; form: EventForm }> => {
    const response = await api.post(`/event-forms/${eventId}`, formData)
    return response.data
  },

  updateEventForm: async (formId: string, updates: {
    title?: string
    description?: string
    fields?: FormField[]
  }): Promise<{ success: boolean; form: EventForm }> => {
    const response = await api.put(`/event-forms/form/${formId}`, updates)
    return response.data
  },

  deleteEventForm: async (formId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/event-forms/form/${formId}`)
    return response.data
  },

  getEventFormSubmissions: async (eventId: string): Promise<{ 
    success: boolean
    count: number
    submissions: FormSubmission[] 
  }> => {
    const response = await api.get(`/event-forms/${eventId}/submissions`)
    return response.data
  },

  // Public APIs
  getEventForm: async (eventId: string): Promise<{ 
    success: boolean
    form: EventForm | null 
  }> => {
    const response = await api.get(`/event-forms/${eventId}`)
    return response.data
  },

  submitFormResponse: async (eventId: string, responses: Record<string, any>): Promise<{ 
    success: boolean
    submission: FormSubmission 
  }> => {
    const response = await api.post(`/event-forms/${eventId}/submit`, { responses })
    return response.data
  },

  getUserFormSubmission: async (eventId: string): Promise<{ 
    success: boolean
    submission: FormSubmission | null 
  }> => {
    const response = await api.get(`/event-forms/${eventId}/my-submission`)
    return response.data
  }
}

export const qrCodeAPI = {
  // User APIs
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

  // Admin APIs
  processCheckIn: async (qrCodeData: string, notes?: string): Promise<{
    success: boolean
    message: string
    checkIn?: {
      userName: string
      eventTitle: string
      checkInTime: string
    }
  }> => {
    const response = await api.post('/qr-code/check-in', { qrCodeData, notes })
    return response.data
  },

  processCheckInByCode: async (checkInCode: string, notes?: string): Promise<{
    success: boolean
    message: string
    checkIn?: {
      userName: string
      eventTitle: string
      checkInTime: string
    }
  }> => {
    const response = await api.post('/qr-code/check-in-by-code', { checkInCode, notes })
    return response.data
  },

  getEventCheckIns: async (eventId: string): Promise<{
    success: boolean
    statistics: {
      total_registrations: number
      total_check_ins: number
      pending_check_ins: number
      check_in_percentage: number
    }
    checkIns: Array<{
      id: string
      checkInCode: string
      checkedInAt: string
      checkInMethod: string
      notes?: string
      users: {
        full_name: string
        email: string
        member_id: string
      }
      admins?: {
        full_name: string
      }
    }>
  }> => {
    const response = await api.get(`/qr-code/event/${eventId}/check-ins`)
    return response.data
  },

  getScannerQR: async (eventId: string): Promise<{
    success: boolean
    scannerQRCode: string
    event: {
      id: string
      title: string
      date: string
    }
  }> => {
    const response = await api.get(`/qr-code/event/${eventId}/scanner-qr`)
    return response.data
  }
}

export default { eventFormAPI, qrCodeAPI }