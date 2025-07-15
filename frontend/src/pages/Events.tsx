import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ParticlesComponent } from '../components/particles'
import { Code, Calendar, MapPin, CheckCircle, Clock, LogOut, Users, Star, ExternalLink, ArrowLeft, Search, Filter, Plus, RefreshCw, AlertCircle, UserCheck, UserX, Calendar as CalendarIcon, QrCode, FileText, CreditCard, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI } from '../services/api'
import { eventFormAPI } from '../services/eventFormApi'
import EventFormViewer from '../components/EventFormViewer'
import type { Event } from '../services/api'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface EventWithRegistration extends Event {
  isRegistered?: boolean
  registrationStatus?: 'registered' | 'waitlisted' | 'cancelled'
}

export function Events() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState<EventWithRegistration[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventWithRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, upcoming, past, registered
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showFormViewer, setShowFormViewer] = useState(false)
  const [selectedEventForForm, setSelectedEventForForm] = useState<Event | null>(null)

  
  // Payment-related state
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [adminsByCollege, setAdminsByCollege] = useState<any>({})
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [showAdminSelection, setShowAdminSelection] = useState(false)
  const [eventForPayment, setEventForPayment] = useState<Event | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, filter])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Use the new endpoint that provides personalized pricing
      const response = await eventsAPI.getEventsWithPricing()
      
      if (response.success) {
        // Get real registration status for each event
        const eventsWithRegistration = await Promise.all(
          response.events.map(async (event) => {
            try {
              const registrationResponse = await eventsAPI.checkRegistrationStatus(event.id)
              return {
                ...event,
                isRegistered: registrationResponse.success ? registrationResponse.isRegistered : false,
                registrationStatus: (registrationResponse.success && registrationResponse.isRegistered 
                  ? (registrationResponse.status === 'confirmed' ? 'registered' : registrationResponse.status)
                  : undefined) as 'registered' | 'waitlisted' | 'cancelled' | undefined
              }
            } catch (error) {
              console.error(`Failed to check registration status for event ${event.id}:`, error)
              return {
                ...event,
                isRegistered: false,
                registrationStatus: undefined
              }
            }
          })
        )
        setEvents(eventsWithRegistration)
      }
    } catch (error: any) {
      console.error('Failed to load events:', error)
      setError('Failed to load events. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    const now = new Date()
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(event => new Date(event.date) > now)
        break
      case 'past':
        filtered = filtered.filter(event => new Date(event.date) <= now)
        break
      case 'registered':
        filtered = filtered.filter(event => event.isRegistered)
        break
      default:
        // Show all events
        break
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setFilteredEvents(filtered)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadEvents()
    setIsRefreshing(false)
  }

  const handleRegister = async (eventId: string) => {
    if (!user) return

    const event = events.find(e => e.id === eventId)
    if (!event) return

    // For paid events, handle payment directly
    if (event.priceInfo?.isPaid || event.isPaid) {
      // For open-to-all events, we need to load admin options first
      if (event.eventType === 'open-to-all') {
        try {
          const adminsResponse = await eventsAPI.getAdminsForEvents();
          if (adminsResponse.success) {
            setAdminsByCollege(adminsResponse.adminsByCollege);
            setEventForPayment(event);
            setShowAdminSelection(true);
            return;
          }
        } catch (error) {
          console.error('Error loading admins:', error);
          setPaymentError('Failed to load admin options. Please try again.');
          return;
        }
      } else {
        // For non-open-to-all paid events, proceed directly to payment
        await handlePayment(event, null);
        return;
      }
    }

    // Check if event has a custom form
    try {
      const formResponse = await eventFormAPI.getEventForm(eventId)
      if (formResponse.success && formResponse.form) {
        setSelectedEventForForm(event)
        setShowFormViewer(true)
        return
      }
    } catch (error) {
      console.error('Error checking for event form:', error)
    }

    setRegisteringEventId(eventId)
    try {
      const response = await eventsAPI.registerForEvent(eventId)
      if (response.success) {
        // Refresh the specific event data to get updated attendee count
        try {
          const eventResponse = await eventsAPI.getEvent(eventId)
          if (eventResponse.success) {
            // Update local state with fresh event data
            setEvents(prev => prev.map(event => 
              event.id === eventId 
                ? { 
                    ...eventResponse.event, 
                    isRegistered: true, 
                    registrationStatus: 'registered',
                    priceInfo: event.priceInfo // Preserve pricing info
                  }
                : event
            ))
          } else {
            // Fallback: just update registration status
            setEvents(prev => prev.map(event => 
              event.id === eventId 
                ? { ...event, isRegistered: true, registrationStatus: 'registered' }
                : event
            ))
          }
        } catch (refreshError) {
          console.error('Failed to refresh event data:', refreshError)
          // Fallback: just update registration status
          setEvents(prev => prev.map(event => 
            event.id === eventId 
              ? { ...event, isRegistered: true, registrationStatus: 'registered' }
              : event
          ))
        }
      }
    } catch (error: any) {
      console.error('Registration failed:', error)
      setError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setRegisteringEventId(null)
    }
  }



  const handleFormSubmit = async (responses: Record<string, any>) => {
    if (!selectedEventForForm) return

    try {
      // Submit the form
      await eventFormAPI.submitFormResponse(selectedEventForForm.id, responses)
      
      // Register for the event
      const response = await eventsAPI.registerForEvent(selectedEventForForm.id)
      if (response.success) {
        // Refresh the specific event data to get updated attendee count
        try {
          const eventResponse = await eventsAPI.getEvent(selectedEventForForm.id)
          if (eventResponse.success) {
            // Update local state with fresh event data
            setEvents(prev => prev.map(event => 
              event.id === selectedEventForForm.id 
                ? { 
                    ...eventResponse.event, 
                    isRegistered: true, 
                    registrationStatus: 'registered',
                    priceInfo: event.priceInfo // Preserve pricing info
                  }
                : event
            ))
          } else {
            // Fallback: just update registration status
            setEvents(prev => prev.map(event => 
              event.id === selectedEventForForm.id 
                ? { ...event, isRegistered: true, registrationStatus: 'registered' }
                : event
            ))
          }
        } catch (refreshError) {
          console.error('Failed to refresh event data:', refreshError)
          // Fallback: just update registration status
          setEvents(prev => prev.map(event => 
            event.id === selectedEventForForm.id 
              ? { ...event, isRegistered: true, registrationStatus: 'registered' }
              : event
          ))
        }
      }
      
      // Close the form viewer
      setShowFormViewer(false)
      setSelectedEventForForm(null)
    } catch (error: any) {
      console.error('Form submission failed:', error)
      setError(error.response?.data?.message || 'Form submission failed. Please try again.')
    }
  }



  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const handlePayment = async (event: Event, adminId?: string | null) => {
    if (!user) return

    setPaymentProcessing(true)
    setPaymentError('')

    try {
      // Create Razorpay order
      const orderResponse = await fetch(`http://localhost:5050/api/events/${event.id}/razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          adminId: adminId || undefined
        })
      })

      const orderData = await orderResponse.json()
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order')
      }

      // Initialize Razorpay
      const options = {
        key: 'rzp_test_RVKFS8WX756Anx',
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: event.title,
        description: `Registration for ${event.title}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`http://localhost:5050/api/events/${event.id}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                adminId: adminId || undefined
              })
            })

            const verifyData = await verifyResponse.json()
            if (verifyData.success) {
              // Refresh the specific event data to get updated attendee count
              try {
                const eventResponse = await eventsAPI.getEvent(event.id)
                if (eventResponse.success) {
                  // Update local state with fresh event data
                  setEvents(prev => prev.map(e => 
                    e.id === event.id 
                      ? { 
                          ...eventResponse.event, 
                          isRegistered: true, 
                          registrationStatus: 'registered',
                          priceInfo: e.priceInfo // Preserve pricing info
                        }
                      : e
                  ))
                } else {
                  // Fallback: just update registration status
                  setEvents(prev => prev.map(e => 
                    e.id === event.id 
                      ? { ...e, isRegistered: true, registrationStatus: 'registered' }
                      : e
                  ))
                }
              } catch (refreshError) {
                console.error('Failed to refresh event data:', refreshError)
                // Fallback: just update registration status
                setEvents(prev => prev.map(e => 
                  e.id === event.id 
                    ? { ...e, isRegistered: true, registrationStatus: 'registered' }
                    : e
                ))
              }
              setShowAdminSelection(false)
              setEventForPayment(null)
              setSelectedAdminId('')
              // Show success message
              alert('Payment successful! Registration confirmed. Check your email for details.')
            } else {
              setPaymentError('Payment verification failed. Please contact support.')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            setPaymentError('Payment verification failed. Please contact support.')
          }
          setPaymentProcessing(false)
        },
        prefill: {
          name: user.fullName,
          email: user.email
        },
        theme: { color: '#f97316' }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error('Payment error:', error)
      setPaymentError(error.message || 'Payment failed. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const handleAdminSelection = async () => {
    if (!eventForPayment || !selectedAdminId) {
      setPaymentError('Please select an admin')
      return
    }

    await handlePayment(eventForPayment, selectedAdminId)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'registered':
      case 'confirmed':
        return <UserCheck className="h-5 w-5 text-green-400" />
      case 'waitlisted':
        return <Clock className="h-5 w-5 text-yellow-400" />
      case 'cancelled':
        return <UserX className="h-5 w-5 text-red-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'registered':
      case 'confirmed':
        return 'Registered'
      case 'waitlisted':
        return 'Waitlisted'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Not Registered'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'registered':
      case 'confirmed':
        return 'text-green-400'
      case 'waitlisted':
        return 'text-yellow-400'
      case 'cancelled':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const isEventPast = (date: string) => {
    return new Date(date) < new Date()
  }

  const canRegister = (event: EventWithRegistration) => {
    return !isEventPast(event.date) && !event.isRegistered && event.isActive
  }

  const addToCalendar = (event: Event) => {
    const startDate = new Date(event.date)
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // Assume 2 hour duration
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`
    
    window.open(googleCalendarUrl, '_blank')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticlesComponent className="fixed inset-0" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/20"></div>
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-gray-800/50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <Link to="/portal">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-cyan-400">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="flex flex-col items-start sm:items-start">
              {/* <span className="text-3xl sm:text-5xl font-bold font-techie tracking-tight leading-none text-white" style={{letterSpacing: '-0.04em'}}>
                DEVS
              </span> */}
              <img 
                src="/images/DEVS_White.png" 
                alt="DEVS" 
                className="h-8 sm:h-10 md:h-12 w-auto mb-2"
              />
         
            </div>
            <span className="text-sm sm:text-lg text-gray-400 ml-1 sm:ml-2">Events</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-300 hover:text-cyan-400"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Link to="/card" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors hidden sm:block">
              My Card
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative z-10 bg-red-500/10 border-b border-red-500/30 p-3"
          >
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full px-4 sm:px-6 py-2 border border-purple-500/20 mb-4 sm:mb-6">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
            <span className="text-xs sm:text-sm text-purple-300 font-medium">Community Events</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 font-techie">
            Upcoming <span className="text-gradient">Events</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Join workshops, hackathons, and community gatherings. Connect with fellow developers and expand your skills.
          </p>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-1 bg-gradient-cyber mx-auto rounded-full"
          ></motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="backdrop-glass rounded-xl p-4 sm:p-6 border border-gray-700 mb-6 sm:mb-8"
        >
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-field"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                { value: 'all', label: 'All Events' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'registered', label: 'My Events' },
                { value: 'past', label: 'Past' }
              ].map((filterOption) => (
                <Button
                  key={filterOption.value}
                  variant={filter === filterOption.value ? 'gradient' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(filterOption.value)}
                  className={filter === filterOption.value ? '' : 'text-gray-300 hover:text-cyan-400'}
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </div>
        </motion.div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="backdrop-glass rounded-2xl p-8 border border-gray-700">
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No events found</h3>
            <p className="text-gray-500">
              {searchTerm ? `No events match "${searchTerm}"` : 'No events available at the moment'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="relative group"
              >
                <div className={`card-gradient rounded-2xl p-4 sm:p-6 lg:p-8 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${
                  event.isRegistered ? 'border-2 border-green-400/30' : ''
                }`}>
                  {/* Registration status badge - moved to top of card content */}
                  {event.isRegistered && (
                    <div className="absolute top-4 right-4 z-20 bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1 flex items-center gap-1 backdrop-blur-sm">
                      <UserCheck className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400 font-medium">Registered</span>
                    </div>
                  )}

                  {/* Past event overlay */}
                  {isEventPast(event.date) && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-30">
                      <div className="text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 font-medium">Event Ended</p>
                      </div>
                    </div>
                  )}

                  {/* Background decoration */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-cyan-400/10 to-transparent rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                      {/* Event Photo */}
                      <div className="lg:w-1/3 mb-4 lg:mb-0">
                        <div className="relative rounded-xl overflow-hidden bg-gray-800">
                          <img
                            src={event.photoUrl || '/images/devs.jpg'}
                            alt={event.title}
                            className="w-full h-40 sm:h-48 lg:h-64 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/images/devs.jpg'
                            }}
                          />
                          {/* Event type badge */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">
                              {event.eventType === 'open-to-all' ? 'Open to All' : 'College Specific'}
                            </span>
                          </div>
                          {/* Category badge */}
                          <div className="absolute top-3 right-3 z-10">
                            <span className="bg-cyan-500/80 text-white text-xs px-2 py-1 rounded-full font-medium capitalize">
                              {event.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {/* Event header */}
                        <div className="mb-4 sm:mb-6">
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-techie mb-2">{event.title}</h3>
                          
                          {/* Event meta info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-gray-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-cyan-400" />
                              <span>{new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MapPin className="h-5 w-5 text-cyan-400" />
                              <span>{event.location}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-cyan-400" />
                              <span>
                                {event.attendees?.length || 0}
                                {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {event.priceInfo?.isPaid ? (
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-orange-400 font-medium">₹{event.priceInfo.price}</span>
                                    <span className="text-orange-400 text-xs">(Paid Event)</span>
                                  </div>
                                  {event.priceInfo.adminName && (
                                    <div className="text-xs text-gray-400">
                                      Admin: {event.priceInfo.adminName} (Batch {event.priceInfo.batchYear})
                                    </div>
                                  )}
                                </div>
                              ) : event.isPaid ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-orange-400 font-medium">₹{event.price || 0}</span>
                                  <span className="text-orange-400 text-xs">(Paid Event)</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-green-400 font-medium">Free</span>
                                </div>
                              )}
                            </div>

                            {event.registrationStatus && (
                              <div className="flex items-center gap-2">
                                {getStatusIcon(event.registrationStatus)}
                                <span className={getStatusColor(event.registrationStatus)}>
                                  {getStatusText(event.registrationStatus)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Event description */}
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                          {canRegister(event) ? (
                            <Button 
                              variant="gradient" 
                              onClick={() => handleRegister(event.id)}
                              disabled={registeringEventId === event.id}
                              className="group"
                            >
                              {registeringEventId === event.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              ) : (
                                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                              )}
                              {registeringEventId === event.id ? 'Registering...' : (event.priceInfo?.isPaid || event.isPaid) ? 'Pay & Register' : 'Register'}
                            </Button>
                          ) : event.isRegistered && !isEventPast(event.date) ? (
                            <>
                              <Link to="/card">
                                <Button 
                                  variant="cyan" 
                                  className="group"
                                >
                                  <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                  My Card
                                </Button>
                              </Link>
                            </>
                          ) : null}

                          <Button 
                            variant="outline" 
                            onClick={() => addToCalendar(event)}
                            className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/10"
                          >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Event Form Viewer */}
      {showFormViewer && selectedEventForForm && (
        <EventFormViewer
          eventId={selectedEventForForm.id}
          eventTitle={selectedEventForForm.title}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowFormViewer(false)
            setSelectedEventForForm(null)
          }}
        />
      )}



      {/* Admin Selection Modal */}
      {showAdminSelection && eventForPayment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Select Admin for {eventForPayment.title}</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowAdminSelection(false)
                    setEventForPayment(null)
                    setSelectedAdminId('')
                    setPaymentError('')
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>

              {paymentError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 mb-4">
                  {paymentError}
                </div>
              )}

              <div className="space-y-4">
                {Object.entries(adminsByCollege).map(([collegeId, collegeData]: [string, any]) => {
                  console.log('Processing college in modal:', collegeId, collegeData);
                  console.log('User data in modal:', user);
                  console.log('User collegeRef:', (user as any)?.collegeRef);
                  console.log('User college:', user?.college);
                  
                  // Filter admins for this user's college and batch year
                  const matchingAdmins = (collegeData as any).admins.filter(
                    (admin: any) => {
                      const batchMatch = Number(admin.batchYear) === Number(user?.batchYear);
                      const collegeMatch = ((collegeData as any).college?.id && (user as any)?.collegeRef && (collegeData as any).college.id === (user as any)?.collegeRef) ||
                                          ((collegeData as any).college?.name && user?.college && (collegeData as any).college.name === user?.college);
                      
                      console.log(`Admin: ${admin.fullName} Batch: ${admin.batchYear} User batch: ${user?.batchYear} Batch match: ${batchMatch}`);
                      console.log(`College ID match: ${(collegeData as any).college?.id} User collegeRef: ${(user as any)?.collegeRef} College match: ${collegeMatch}`);
                      console.log(`College name match: ${(collegeData as any).college?.name} User college: ${user?.college} Name match: ${(collegeData as any).college?.name === user?.college}`);
                      
                      return batchMatch && collegeMatch;
                    }
                  );

                  console.log('Matching admins for college', collegeId, ':', matchingAdmins);

                  if (matchingAdmins.length === 0) return null;

                  return (
                    <div key={collegeId} className="border border-gray-700 rounded-lg p-4">
                      <h3 className="font-medium text-gray-300 mb-3">
                        {(collegeData as any).college?.name || 'Unknown College'}
                      </h3>
                      <div className="space-y-2">
                        {matchingAdmins.map((admin: any) => {
                          const adminPricing = eventForPayment.adminPricing?.find(p => p.adminId === admin.id)
                          return (
                            <label key={admin.id} className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 cursor-pointer border border-gray-700">
                              <input
                                type="radio"
                                name="adminId"
                                value={admin.id}
                                checked={selectedAdminId === admin.id}
                                onChange={(e) => setSelectedAdminId(e.target.value)}
                                className="text-orange-500"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-white">{admin.fullName}</p>
                                <p className="text-sm text-gray-400">Batch: {admin.batchYear}</p>
                                <p className="text-sm text-orange-400 font-medium">₹{adminPricing?.amount || 0}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {Object.keys(adminsByCollege).length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-400">No admin options available for your college and batch year.</p>
                  <p className="text-gray-400 text-sm mt-2">Please contact support for assistance.</p>
                </div>
              )}

              {/* Debug section - show all admins if no matching ones found */}
              {Object.keys(adminsByCollege).length > 0 && Object.entries(adminsByCollege).every(([collegeId, collegeData]: [string, any]) => {
                const matchingAdmins = (collegeData as any).admins.filter(
                  (admin: any) => {
                    const batchMatch = Number(admin.batchYear) === Number(user?.batchYear);
                    const collegeMatch = ((collegeData as any).college?.id && (user as any)?.collegeRef && (collegeData as any).college.id === (user as any)?.collegeRef) ||
                                        ((collegeData as any).college?.name && user?.college && (collegeData as any).college.name === user?.college);
                    return batchMatch && collegeMatch;
                  }
                );
                return matchingAdmins.length === 0;
              }) && (
                <div className="border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/10">
                  <h3 className="text-yellow-400 font-medium mb-3">Debug: All Available Admins</h3>
                  <p className="text-yellow-300 text-sm mb-4">No admins matched your criteria. Here are all available admins:</p>
                  {Object.entries(adminsByCollege).map(([collegeId, collegeData]: [string, any]) => (
                    <div key={collegeId} className="mb-4">
                      <h4 className="text-white font-medium mb-2">
                        {(collegeData as any).college?.name || 'Unknown College'} (ID: {(collegeData as any).college?.id})
                      </h4>
                      <div className="space-y-1">
                        {(collegeData as any).admins.map((admin: any) => (
                          <div key={admin.id} className="text-sm text-gray-300">
                            • {admin.fullName} (Batch: {admin.batchYear})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="text-yellow-300 text-sm mt-3">
                    <p><strong>Your data:</strong></p>
                    <p>College: {(user as any)?.collegeRef || user?.college}</p>
                    <p>Batch Year: {user?.batchYear}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAdminSelection(false)
                    setEventForPayment(null)
                    setSelectedAdminId('')
                    setPaymentError('')
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="gradient" 
                  onClick={handleAdminSelection}
                  disabled={!selectedAdminId || paymentProcessing}
                  className="flex-1"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay & Register
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}