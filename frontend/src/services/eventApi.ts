import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

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

export default eventApi 