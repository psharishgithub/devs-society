import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  BookOpen,
  CreditCard,
  FileText,
  UserPlus
} from 'lucide-react'
import { superAdminApiService } from '../../services/superAdminApiService'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  fullName: string
  email: string
  memberId: string
  college: string
  batchYear: string
  role: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxAttendees: number
  isPaid: boolean
  price: number
  registrationCount?: number
}

interface InternalBooking {
  id: string
  registrationDate: string
  status: string
  paymentVerified: boolean
  qrCode: string
  user: User
  event: Event
  internalBooking: {
    bookedBy: string
    notes: string
    adminNotes: string
    paymentBypassed: boolean
  }
}

export function InternalBooking() {
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [internalBookings, setInternalBookings] = useState<InternalBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [notes, setNotes] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in as SuperAdmin
    const adminToken = localStorage.getItem('adminToken')
    const adminUser = localStorage.getItem('adminUser')
    
    if (!adminToken || !adminUser) {
      setErrorMessage('Authentication required. Please log in as SuperAdmin.')
      setIsLoading(false)
      return
    }
    
    try {
      const adminData = JSON.parse(adminUser)
      if (adminData.role !== 'super-admin') {
        setErrorMessage('Access denied. You need SuperAdmin privileges to access this page.')
        setIsLoading(false)
        return
      }
    } catch (error) {
      setErrorMessage('Invalid admin session. Please log in again.')
      setIsLoading(false)
      return
    }
    
    loadData()
  }, [])

  // Handle browser back button
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Don't show warning on page refresh/close
      return
    }

    const handlePopState = (e: PopStateEvent) => {
      // Check if user is still authenticated when browser back is pressed
      const adminToken = localStorage.getItem('adminToken')
      const adminUser = localStorage.getItem('adminUser')
      
      if (!adminToken || !adminUser) {
        navigate('/admin/login')
        return
      }
      
      try {
        const adminData = JSON.parse(adminUser)
        if (adminData.role !== 'super-admin') {
          navigate('/admin/login')
          return
        }
      } catch (error) {
        navigate('/admin/login')
        return
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])

  const loadData = async () => {
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      const [usersResponse, eventsResponse, bookingsResponse] = await Promise.all([
        superAdminApiService.getAllUsers(),
        superAdminApiService.getAllEvents(),
        superAdminApiService.getInternalBookings()
      ])

      if (usersResponse.success) {
        setUsers(usersResponse.users || [])
      } else {
        console.error('Failed to load users:', usersResponse.message)
      }
      
      if (eventsResponse.success) {
        setEvents(eventsResponse.events || [])
      } else {
        console.error('Failed to load events:', eventsResponse.message)
      }
      
      if (bookingsResponse.success) {
        setInternalBookings(bookingsResponse.data || [])
      } else {
        console.error('Failed to load internal bookings:', bookingsResponse.message)
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      
      // Show specific error messages
      if (error.response?.status === 401) {
        setErrorMessage('Authentication required. Please log in as SuperAdmin.')
      } else if (error.response?.status === 403) {
        setErrorMessage('Access denied. You need SuperAdmin privileges.')
      } else if (error.response?.status === 404) {
        setErrorMessage('API endpoint not found. Please check if the server is running.')
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setErrorMessage('Network error. Please check your connection and try again.')
      } else {
        setErrorMessage(`Failed to load data: ${error.response?.data?.message || error.message || 'Unknown error'}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser || !selectedEvent) {
      setErrorMessage('Please select both a user and an event')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await superAdminApiService.createInternalBooking({
        userId: selectedUser.id,
        eventId: selectedEvent.id,
        notes: notes.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined
      })

      if (response.success) {
        setSuccessMessage(`Successfully registered ${selectedUser.fullName} for ${selectedEvent.title}`)
        setShowCreateForm(false)
        setSelectedUser(null)
        setSelectedEvent(null)
        setNotes('')
        setAdminNotes('')
        loadData() // Refresh the bookings list
      } else {
        setErrorMessage(response.message || 'Failed to create booking')
      }
    } catch (error: any) {
      console.error('Error creating booking:', error)
      setErrorMessage(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.college.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-gray-400">Loading internal booking system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  // Check if user is still authenticated before navigating
                  const adminToken = localStorage.getItem('adminToken')
                  const adminUser = localStorage.getItem('adminUser')
                  
                  if (!adminToken || !adminUser) {
                    // If not authenticated, redirect to login
                    navigate('/admin/login')
                    return
                  }
                  
                  try {
                    const adminData = JSON.parse(adminUser)
                    if (adminData.role !== 'super-admin') {
                      // If not super admin, redirect to login
                      navigate('/admin/login')
                      return
                    }
                  } catch (error) {
                    // If invalid session, redirect to login
                    navigate('/admin/login')
                    return
                  }
                  
                  // If authenticated, navigate to dashboard
                  navigate('/superadmin')
                }}
                className="text-gray-300 hover:text-cyan-400"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-bold">Internal Booking System</h1>
                  <p className="text-gray-400">Register users for events internally</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              New Internal Booking
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-green-300">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-300">{errorMessage}</span>
          </motion.div>
        )}

        {/* Create Booking Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Create Internal Booking</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-6">
                {/* User Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select User *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search users by name, email, or member ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{user.fullName}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                            <div className="text-xs text-gray-500">
                              {user.memberId} • {user.college} • {user.batchYear}
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Event *
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedEvent?.id === event.id
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-white">{event.title}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.registrationCount || 0} / {event.maxAttendees} registered
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {event.isPaid && (
                              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                <CreditCard className="h-3 w-3" />
                                ₹{event.price}
                              </div>
                            )}
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              event.isPaid ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                              {event.isPaid ? 'Paid Event' : 'Free Event'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this booking..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes for admin reference..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedUser || !selectedEvent || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Internal Booking
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Internal Bookings List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Internal Bookings</h2>
            <div className="text-sm text-gray-400">
              Total: {internalBookings.length} bookings
            </div>
          </div>

          {internalBookings.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No Internal Bookings</h3>
              <p className="text-gray-500">Create your first internal booking to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {internalBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{booking.event.title}</h3>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {booking.status}
                        </div>
                        {booking.paymentVerified && (
                          <div className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                            Payment Verified
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">User Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="text-white">{booking.user.fullName}</div>
                            <div className="text-gray-400">{booking.user.email}</div>
                            <div className="text-gray-500">
                              {booking.user.memberId} • {booking.user.college}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Event Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="text-white">{booking.event.title}</div>
                            <div className="text-gray-400">
                              {new Date(booking.event.date).toLocaleDateString()} at {booking.event.time}
                            </div>
                            <div className="text-gray-500">{booking.event.location}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Booking Info</h4>
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-400">
                              Booked: {new Date(booking.registrationDate).toLocaleString()}
                            </div>
                            <div className="text-gray-400">
                              By: {booking.internalBooking.bookedBy}
                            </div>
                            {booking.internalBooking.paymentBypassed && (
                              <div className="text-yellow-400">
                                Payment bypassed for paid event
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Notes</h4>
                          <div className="space-y-1 text-sm">
                            {booking.internalBooking.notes && (
                              <div className="text-gray-400">
                                <span className="text-gray-500">Notes:</span> {booking.internalBooking.notes}
                              </div>
                            )}
                            {booking.internalBooking.adminNotes && (
                              <div className="text-gray-400">
                                <span className="text-gray-500">Admin:</span> {booking.internalBooking.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.qrCode && (
                      <div className="ml-4 text-center">
                        <img 
                          src={booking.qrCode} 
                          alt="QR Code" 
                          className="w-16 h-16 mx-auto mb-2"
                        />
                        <p className="text-xs text-gray-500">QR Code</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 