import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Download,
  Eye,
  Building,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { superAdminApiService } from '../../services/adminApi'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  eventType: string
  isPaid: boolean
  price: number
  maxAttendees: number
  registrationCount: number
  targetCollege?: string
  collegeName?: string
}

interface Registration {
  id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  userCollege: string
  status: string
  registeredAt: string
  paymentVerified?: boolean
  paymentId?: string
  paymentAmount?: number
  paymentCurrency?: string
  paymentTimestamp?: string
}

export function Participation() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCollege, setFilterCollege] = useState('all')
  const [filterEventType, setFilterEventType] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [colleges, setColleges] = useState<string[]>([])

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const response = await superAdminApiService.getAllEvents()
      if (response.success) {
        const eventsWithStats = response.events.map((event: any) => ({
          ...event,
          collegeName: event.targetCollege ? event.college?.name || 'Unknown College' : 'Open to All'
        }))
        setEvents(eventsWithStats)
        
        // Extract unique colleges for filter
        const uniqueColleges = [...new Set(eventsWithStats.map((e: any) => e.collegeName).filter(Boolean))] as string[]
        setColleges(uniqueColleges)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRegistrations = async (event: Event) => {
    try {
      setSelectedEvent(event)
      const response = await superAdminApiService.getEventRegistrations(event.id)
      if (response.success) {
        setRegistrations(response.registrations || [])
        setShowRegistrations(true)
      }
    } catch (error) {
      console.error('Failed to load registrations:', error)
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCollege = filterCollege === 'all' || event.collegeName === filterCollege
    const matchesEventType = filterEventType === 'all' || event.eventType === filterEventType
    
    return matchesSearch && matchesCollege && matchesEventType
  })

  const getPaymentStatusCounts = (eventRegistrations: Registration[]) => {
    const paid = eventRegistrations.filter(r => r.paymentVerified).length
    // const pending = eventRegistrations.filter(r => !r.paymentVerified && event?.isPaid).length
    return { paid }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'waitlisted': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getPaymentStatusIcon = (paymentVerified: boolean) => {
    return paymentVerified ? 
      <CreditCard className="w-4 h-4 text-blue-500" /> : 
      <Clock className="w-4 h-4 text-orange-500" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRegistrations = registrations.filter(registration => {
    if (filterPaymentStatus === 'all') return true
    if (filterPaymentStatus === 'paid') return registration.paymentVerified
    if (filterPaymentStatus === 'pending') return !registration.paymentVerified
    return true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-white">Loading participation data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-techie text-gradient mb-2">Event Participation</h1>
          <p className="text-gray-400">Comprehensive view of all event registrations across colleges</p>
        </div>

        {/* Filters */}
        <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Colleges</option>
              {colleges.map(college => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
            
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Event Types</option>
              <option value="college-specific">College Specific</option>
              <option value="open-to-all">Open to All</option>
            </select>
            
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-sm text-gray-400">Total Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {events.reduce((total, event) => total + event.registrationCount, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Registrations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {events.filter(e => e.isPaid).length}
              </div>
              <div className="text-sm text-gray-400">Paid Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {colleges.length}
              </div>
              <div className="text-sm text-gray-400">Colleges</div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="backdrop-glass rounded-xl p-6 border border-gradient-cyber hover:shadow-xl transition-all duration-300"
            >
              {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white mb-1">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.isPaid && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                      Paid Event
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.eventType === 'college-specific' ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {event.eventType === 'college-specific' ? 'College Specific' : 'Open to All'}
                  </span>
                </div>
              </div>

              {/* Event Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

              {/* College Info */}
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">{event.collegeName}</span>
              </div>

              {/* Event Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Users className="h-4 w-4" />
                    {event.registrationCount} / {event.maxAttendees}
                  </div>
                  {event.isPaid && (
                    <div className="text-sm text-blue-400">
                      ₹{event.price}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Registration Progress</span>
                  <span>{Math.round((event.registrationCount / event.maxAttendees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((event.registrationCount / event.maxAttendees) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleViewRegistrations(event)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Registrations
              </button>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No events found</div>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>

      {/* Registrations Modal */}
      {showRegistrations && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-black font-semibold">
                  Registrations for {selectedEvent.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedEvent.collegeName} • {selectedEvent.eventType}
                </p>
              </div>
              <button
                onClick={() => setShowRegistrations(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">
                Total Registrations: {registrations.length}
                {selectedEvent.isPaid && (
                  <span className="ml-4 text-blue-600">
                    • Paid Event: {registrations.filter(r => r.paymentVerified).length} paid / {registrations.filter(r => !r.paymentVerified).length} pending
                  </span>
                )}
              </p>
              
              {/* Payment Filter */}
              {selectedEvent.isPaid && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setFilterPaymentStatus('all')}
                    className={`px-3 py-1 text-xs rounded ${
                      filterPaymentStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus('paid')}
                    className={`px-3 py-1 text-xs rounded ${
                      filterPaymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Paid Only
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus('pending')}
                    className={`px-3 py-1 text-xs rounded ${
                      filterPaymentStatus === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Pending Payment
                  </button>
                </div>
              )}
            </div>
            
            {filteredRegistrations.length > 0 ? (
              <div className="grid gap-4">
                {filteredRegistrations.map((registration, index) => (
                  <div key={registration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">{registration.userName}</h4>
                        <p className="text-sm text-gray-600">{registration.userEmail}</p>
                        <p className="text-sm text-gray-600">College: {registration.userCollege}</p>
                        <p className="text-sm text-gray-600">
                          Registered: {formatDate(registration.registeredAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                            registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            registration.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusIcon(registration.status)}
                            {registration.status}
                          </span>
                          
                          {/* Payment Status */}
                          {selectedEvent.isPaid && (
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              registration.paymentVerified ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {getPaymentStatusIcon(registration.paymentVerified || false)}
                              {registration.paymentVerified ? 'Paid' : 'Pending Payment'}
                            </span>
                          )}
                        </div>
                        
                        {/* Payment Details */}
                        {selectedEvent.isPaid && registration.paymentVerified && (
                          <div className="mt-2 p-4 bg-white border-l-4 border-green-500 rounded shadow flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CreditCard className="w-4 h-4 text-green-500" />
                              <span className="font-bold text-green-700">Payment Details</span>
                            </div>
                            <div className="text-sm text-gray-900 font-semibold">
                              <span className="mr-2">Payment ID:</span>
                              <span className="font-mono">{registration.paymentId || 'N/A'}</span>
                            </div>
                            <div className="text-sm text-gray-900 font-semibold">
                              <span className="mr-2">Amount:</span>
                              <span className="text-green-700 font-bold">₹{registration.paymentAmount || 0} {registration.paymentCurrency || 'INR'}</span>
                            </div>
                            <div className="text-sm text-gray-900 font-semibold">
                              <span className="mr-2">Payment Date:</span>
                              <span>{registration.paymentTimestamp ? formatDate(registration.paymentTimestamp) : 'N/A'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No registrations found for this event</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 