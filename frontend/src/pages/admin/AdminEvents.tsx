import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
  AlertCircle
} from 'lucide-react'
import { eventsAPI } from '../../services/api'
import { adminApiService } from '../../services/adminApi'
import QRScanner from '../../components/QRScanner'
import type { Event } from '../../services/api'
import { useNavigate } from 'react-router-dom';

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scannedData, setScannedData] = useState<any>(null)
  const [scanStatus, setScanStatus] = useState<string | null>(null)
  const [showRegistrations, setShowRegistrations] = useState(false)
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState<any>(null)
  const [registrationFilter, setRegistrationFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxAttendees: ''
  })
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm])

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getEvents()
      if (response.success) {
        setEvents(response.events || [])
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await eventsAPI.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        maxAttendees: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined
      })

      if (response.success) {
        setEvents([...events, response.event])
        setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: '' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
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

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const handleQRScan = async (qrData: string): Promise<'success' | 'invalid' | 'already_checked_in' | 'error'> => {
    try {
      const response = await adminApiService.scanQRCode(qrData)
      if (response.success) {
        setScannedData(response.data)
        if (response.data.registration && response.data.registration.status === 'already_checked_in') {
          setScanStatus('already_checked_in')
        } else {
          setScanStatus(response.status) // 'registered' or 'not_registered'
        }
        setShowQRScanner(false)
        // Map backend status to allowed QRScanner return values
        if (response.data.registration && response.data.registration.status === 'already_checked_in') {
          return 'already_checked_in'
        }
        return response.status === 'registered' ? 'success' : 'invalid'
      } else {
        setScannedData(null)
        setScanStatus('invalid')
        return 'invalid'
      }
    } catch (error: any) {
      setScannedData(null)
      setScanStatus('error')
      return 'error'
    }
  }

  const handleViewRegistrations = async (eventId: string) => {
    try {
      const response = await adminApiService.getEventRegistrations(eventId)
      if (response.success) {
        setSelectedEventRegistrations({ 
          eventId, 
          event: response.event,
          registrations: response.registrations 
        })
        setRegistrationFilter('all') // Reset filter
        setShowRegistrations(true)
      } else {
        alert('Failed to load registrations: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error loading registrations:', error)
      alert('Failed to load registrations: ' + (error.message || 'Unknown error'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading events...</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-techie text-gradient mb-2">Event Management</h1>
          <p className="text-gray-400">Create and manage DEVS community events</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="gradient" 
            className="w-fit"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="h-4 w-4" />
            QR Scanner
          </Button>
        <Button 
          variant="gradient" 
          className="w-fit"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="h-4 w-4" />
          Create New Event
        </Button>
        </div>
      </div>

      {/* Create Event Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="backdrop-glass rounded-xl p-6 border border-gradient-cyber"
        >
          <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <Input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
              <Input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                required
              />
              <Input
                type="number"
                placeholder="Max Attendees (optional)"
                value={newEvent.maxAttendees}
                onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: e.target.value })}
              />
            </div>
            <textarea
              placeholder="Event Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full h-24 px-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 resize-none"
              required
            />
            <div className="flex gap-2">
              <Button type="submit" variant="gradient">
                Create Event
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search events by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
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
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isUpcoming(event.date)
                  ? 'text-green-400 bg-green-500/20'
                  : 'text-gray-400 bg-gray-500/20'
              }`}>
                {isUpcoming(event.date) ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {isUpcoming(event.date) ? 'Upcoming' : 'Past'}
              </div>
            </div>

            {/* Event Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

            {/* Event Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Users className="h-4 w-4" />
                  {event.attendees?.length || 0}
                  {event.maxAttendees && ` / ${event.maxAttendees}`}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.isActive
                    ? 'text-green-400 bg-green-500/20'
                    : 'text-red-400 bg-red-500/20'
                }`}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            {/* Progress Bar (if max attendees is set) */}
            {event.maxAttendees && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Registration Progress</span>
                  <span>{Math.round(((event.attendees?.length || 0) / event.maxAttendees) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(((event.attendees?.length || 0) / event.maxAttendees) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4" />
                View Details
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => handleViewRegistrations(event.id)}
              >
                <Users className="h-4 w-4" />
                Registrations
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/admin/events/${event.id}/attendance`)}
              >
                <Calendar className="h-4 w-4" />
                View Attendance
              </Button>
              <Button variant="cyan" size="sm" className="flex-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No events found</div>
          <p className="text-gray-500">Create your first event to get started</p>
        </div>
      )}

      {/* Stats */}
      <div className="backdrop-glass rounded-xl p-6 border border-gradient-cyber">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-sm text-gray-400">Total Events</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {events.filter(e => isUpcoming(e.date)).length}
            </div>
            <div className="text-sm text-gray-400">Upcoming</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {events.reduce((total, event) => total + (event.attendees?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-400">Total Attendees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {events.filter(e => e.isActive).length}
            </div>
            <div className="text-sm text-gray-400">Active Events</div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        title="Event Registration Scanner"
      />

      {/* QR Scan Result Modal */}
      {scannedData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Event & Student Details</h2>
            <div className="mb-2">
              <strong>Event:</strong> {scannedData.event?.title} <br />
              <strong>Date:</strong> {scannedData.event?.date} <br />
              <strong>Location:</strong> {scannedData.event?.location}
            </div>
            <div className="mb-2">
              <strong>Student:</strong> {scannedData.user?.fullName} <br />
              <strong>Email:</strong> {scannedData.user?.email} <br />
              <strong>College:</strong> {scannedData.user?.college}
            </div>
            {scanStatus === 'registered' && (
              <div className="text-green-600 font-semibold mb-2">
                <CheckCircle className="inline h-5 w-5 mr-1" /> Registered for this event!
              </div>
            )}
            {scanStatus === 'not_registered' && (
              <div className="text-red-600 font-semibold mb-2">
                <AlertCircle className="inline h-5 w-5 mr-1" /> Not registered for this event.
              </div>
            )}
            {scanStatus === 'invalid' && (
              <div className="text-red-600 font-semibold mb-2">
                <AlertCircle className="inline h-5 w-5 mr-1" /> Invalid QR code.
              </div>
            )}
            {scanStatus === 'error' && (
              <div className="text-red-600 font-semibold mb-2">
                <AlertCircle className="inline h-5 w-5 mr-1" /> Error processing QR code.
              </div>
            )}
            {scanStatus === 'already_checked_in' && (
              <div className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Already checked in{scannedData.registration?.checkedInAt ? ` at ${new Date(scannedData.registration.checkedInAt).toLocaleString()}` : ''}.
              </div>
            )}
            <button
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
              onClick={() => { setScannedData(null); setScanStatus(null); }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Event Registrations Modal */}
      {showRegistrations && selectedEventRegistrations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Event Registrations
              </h3>
              <button
                onClick={() => setShowRegistrations(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">
                Total Registrations: {selectedEventRegistrations.registrations?.length || 0}
                {selectedEventRegistrations.event?.isPaid && (
                  <span className="ml-4 text-blue-600">
                    • Paid Event: {selectedEventRegistrations.registrations?.filter((r: any) => r.paymentVerified).length || 0} paid / {selectedEventRegistrations.registrations?.filter((r: any) => !r.paymentVerified).length || 0} pending
                  </span>
                )}
              </p>
              {/* Debug Event Info */}
              <div className="p-2 bg-blue-50 rounded text-xs mb-2">
                <p className="text-gray-600">
                  <strong>Event Debug:</strong> isPaid: {selectedEventRegistrations.event?.isPaid ? 'true' : 'false'}, 
                  Price: {selectedEventRegistrations.event?.price || 'null'},
                  Title: {selectedEventRegistrations.event?.title}
                </p>
              </div>
              {selectedEventRegistrations.event?.isPaid && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setRegistrationFilter('all')}
                    className={`px-3 py-1 text-xs rounded ${
                      registrationFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setRegistrationFilter('paid')}
                    className={`px-3 py-1 text-xs rounded ${
                      registrationFilter === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Paid Only
                  </button>
                  <button
                    onClick={() => setRegistrationFilter('pending')}
                    className={`px-3 py-1 text-xs rounded ${
                      registrationFilter === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Pending Payment
                  </button>
                </div>
              )}
            </div>
            
            {selectedEventRegistrations.registrations && selectedEventRegistrations.registrations.length > 0 ? (
              <div className="grid gap-4">
                {selectedEventRegistrations.registrations
                  .filter((registration: any) => {
                    if (registrationFilter === 'all') return true
                    if (registrationFilter === 'paid') return registration.paymentVerified
                    if (registrationFilter === 'pending') return !registration.paymentVerified
                    return true
                  })
                  .map((registration: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{registration.userName || 'Unknown User'}</h4>
                        <p className="text-sm text-gray-600">ID: {registration.userId}</p>
                        <p className="text-sm text-gray-600">
                          Registered: {new Date(registration.registeredAt).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            registration.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            registration.status === 'waitlisted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {registration.status}
                          </span>
                          
                          {/* Payment Status */}
                          {selectedEventRegistrations.event?.isPaid && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              registration.paymentVerified ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {registration.paymentVerified ? 'Paid' : 'Pending Payment'}
                            </span>
                          )}
                        </div>
                        
                        {/* Payment Details */}
                        {selectedEventRegistrations.event?.isPaid && registration.paymentVerified && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <p className="text-gray-600">
                              <strong>Payment ID:</strong> {registration.paymentId || 'N/A'}
                            </p>
                            <p className="text-gray-600">
                              <strong>Amount:</strong> ₹{registration.paymentAmount || 0} {registration.paymentCurrency || 'INR'}
                            </p>
                            <p className="text-gray-600">
                              <strong>Payment Date:</strong> {registration.paymentTimestamp ? new Date(registration.paymentTimestamp).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        )}
                        
                        {/* Debug Information */}
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                          <p className="text-gray-600">
                            <strong>Debug:</strong> Event isPaid: {selectedEventRegistrations.event?.isPaid ? 'true' : 'false'}, 
                            Payment Verified: {registration.paymentVerified ? 'true' : 'false'},
                            Payment ID: {registration.paymentId || 'null'},
                            Amount: {registration.paymentAmount || 'null'}
                          </p>
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        {registration.qrCode && (
                          <div>
                            <img 
                              src={registration.qrCode} 
                              alt="QR Code" 
                              className="w-16 h-16 mx-auto mb-2"
                            />
                            <p className="text-xs text-gray-500">QR Code</p>
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
    </motion.div>
  )
} 