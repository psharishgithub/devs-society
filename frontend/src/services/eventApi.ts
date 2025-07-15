import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'

// Create axios instance
const eventApi = axios.create({
  baseURL: `${API_BASE_URL}/events`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
eventApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Create Razorpay order
export const createRazorpayOrder = async (eventId: string, adminId: string) => {
  try {
    const response = await eventApi.post(`/${eventId}/razorpay-order`, {
      adminId
    })
    return response
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    throw error
  }
}

// Verify Razorpay payment
export const verifyRazorpayPayment = async (eventId: string, paymentData: {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
  adminId: string
}) => {
  try {
    const response = await eventApi.post(`/${eventId}/verify-payment`, paymentData)
    return response
  } catch (error) {
    console.error('Error verifying payment:', error)
    throw error
  }
}

// Get all events
export const getAllEvents = async () => {
  try {
    const response = await eventApi.get('/')
    return response.data
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

// Get event by ID
export const getEventById = async (eventId: string) => {
  try {
    const response = await eventApi.get(`/${eventId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching event:', error)
    throw error
  }
}

// Register for event (free events)
export const registerForEvent = async (eventId: string, userId: string) => {
  try {
    const response = await eventApi.post(`/${eventId}/register`, { userId })
    return response.data
  } catch (error) {
    console.error('Error registering for event:', error)
    throw error
  }
}

// Get event registrations
export const getEventRegistrations = async (eventId: string) => {
  try {
    const response = await eventApi.get(`/${eventId}/registrations`)
    return response.data
  } catch (error) {
    console.error('Error fetching event registrations:', error)
    throw error
  }
}

export const createEventWithPhoto = async (eventData: any) => {
  try {
    const formData = new FormData()
    
    // Handle photo separately
    if (eventData.photo) {
      formData.append('photo', eventData.photo)
    }
    
    // Handle other fields, converting objects to JSON strings
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === 'photo') {
        // Photo already handled above
        return
      }
      
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Convert objects to JSON strings
          formData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          // Handle arrays (like adminPricing)
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      }
    })
    
    const token = localStorage.getItem('authToken')
    const response = await axios.post(`${API_BASE_URL}/events`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    return response.data
  } catch (error) {
    console.error('Error creating event with photo:', error)
    throw error
  }
}

export const updateEventWithPhoto = async (eventId: string, eventData: any) => {
  try {
    const formData = new FormData()
    
    // Handle photo separately
    if (eventData.photo) {
      formData.append('photo', eventData.photo)
    }
    
    // Handle other fields, converting objects to JSON strings
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === 'photo') {
        // Photo already handled above
        return
      }
      
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Convert objects to JSON strings
          formData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          // Handle arrays (like adminPricing)
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, String(value))
        }
      }
    })
    
    const token = localStorage.getItem('authToken')
    const response = await axios.put(`${API_BASE_URL}/events/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    return response.data
  } catch (error) {
    console.error('Error updating event with photo:', error)
    throw error
  }
}

export default eventApi 