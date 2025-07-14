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
  AlertCircle,
  User,
  Building,
  Hash
} from 'lucide-react'
import { eventsAPI } from '../../services/api'
import { adminApiService } from '../../services/adminApi'
import { qrCodeAPI } from '../../services/eventFormApi'
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
  const [selectedEventForScan, setSelectedEventForScan] = useState<Event | null>(null)
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
    const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    setFilteredEvents(filtered)
  }

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        maxAttendees: parseInt(newEvent.maxAttendees) || 0
      }
      
      const response = await eventsAPI.createEvent(eventData)
      if (response.success) {
        setShowCreateForm(false)
        setNewEvent({ title: '', description: '', date: '', location: '', maxAttendees: '' })
        loadEvents()
      }
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await eventsAPI.deleteEvent(eventId)
        if (response.success) {
          loadEvents()
        }
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  const openQRScanner = (event: Event) => {
    setSelectedEventForScan(event)
    setShowQRScanner(true)
    setScannedData(null)
    setScanStatus(null)
  }

  const handleQRScan = async (qrData: string): Promise<'success' | 'invalid' | 'already_checked_in' | 'error'> => {
    if (!selectedEventForScan) return 'error'

    try {
      // First, verify the member using the unified QR verification system
      const verifyResponse = await qrCodeAPI.verifyMember(qrData, selectedEventForScan.id)
      
      if (verifyResponse.success) {
        setScannedData({
          qrCodeType: verifyResponse.qrCodeType,
          member: verifyResponse.member,
          event: verifyResponse.event,
          registration: verifyResponse.registration,
          status: verifyResponse.status
        })
        
        if (verifyResponse.qrCodeType === 'member_card') {
          // Handle member card QR code
          if (verifyResponse.status === 'registered') {
            setScanStatus('registered')
            return 'success'
          } else if (verifyResponse.status === 'not_registered') {
            setScanStatus('not_registered')
            return 'invalid'
          } else {
            setScanStatus('member_only')
            return 'success'
          }
        } else {
          // Handle event-specific QR code (fallback)
          if (verifyResponse.status === 'registered') {
            setScanStatus('registered')
            return 'success'
          } else {
            setScanStatus('not_registered')
            return 'invalid'
          }
        }
      } else {
        setScannedData(null)
        setScanStatus('invalid')
        return 'invalid'
      }
    } catch (error: any) {
      console.error('QR scan error:', error)
      setScannedData(null)
      setScanStatus('error')
      return 'error'
    }
  }

  const handleCheckIn = async () => {
    if (!selectedEventForScan || !scannedData?.member) return

    try {
      const checkInResponse = await qrCodeAPI.checkInMember(
        JSON.stringify(scannedData.member), 
        selectedEventForScan.id
      )
      
      if (checkInResponse.success) {
        setScanStatus('checked_in')
        // Update the scanned data with check-in information
        setScannedData(prev => ({
          ...prev,
          checkIn: checkInResponse.checkIn
        }))
      } else {
        alert('Check-in failed: ' + checkInResponse.message)
      }
    } catch (error: any) {
      console.error('Check-in error:', error)
      alert('Check-in failed: ' + (error.message || 'Unknown error'))
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Event Management</h1>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white"
          />
        </div>
        <Button variant="outline" className="border-gray-600 text-gray-300">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-cyan-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{event.title}</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openQRScanner(event)}
                  className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewRegistrations(event.id)}
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
                >
                  <Users className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{event.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span>{event.attendees?.length || 0} attendees</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteEvent(event.id)}
                className="border-red-500 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
            <div className="space-y-4">
              <Input
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                placeholder="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Input
                type="number"
                placeholder="Max Attendees"
                value={newEvent.maxAttendees}
                onChange={(e) => setNewEvent({...newEvent, maxAttendees: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleCreateEvent} className="flex-1">
                Create Event
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="flex-1 border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => {
          setShowQRScanner(false)
          setSelectedEventForScan(null)
        }}
        onScan={handleQRScan}
        title="Member Verification Scanner"
      />

      {/* QR Scan Result Modal */}
      {scannedData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-cyan-400" />
              Member Verification Result
            </h2>
            
            {/* QR Code Type Indicator */}
            <div className="mb-4 p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
              <p className="text-cyan-400 text-sm font-medium">
                {scannedData.qrCodeType === 'member_card' ? 'Member Card QR Code' : 'Event QR Code'}
              </p>
            </div>

            {/* Member Information */}
            {scannedData.member && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-400" />
                  <span className="text-purple-300 font-semibold">Member:</span>
                  <span className="text-white">{scannedData.member.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 font-semibold">ID:</span>
                  <span className="text-white">{scannedData.member.memberId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-green-400" />
                  <span className="text-green-300 font-semibold">College:</span>
                  <span className="text-white">{scannedData.member.college}</span>
                </div>
              </div>
            )}

            {/* Event Information */}
            {scannedData.event && (
              <div className="mb-4 space-y-2">
                <div>
                  <span className="text-cyan-300 font-semibold">Event:</span>
                  <span className="text-white ml-2">{scannedData.event.title}</span>
                </div>
                <div>
                  <span className="text-cyan-300 font-semibold">Date:</span>
                  <span className="text-white ml-2">{scannedData.event.date}</span>
                </div>
                <div>
                  <span className="text-cyan-300 font-semibold">Location:</span>
                  <span className="text-white ml-2">{scannedData.event.location}</span>
                </div>
            </div>
            )}

            {/* Status */}
            {scanStatus === 'registered' && (
              <div className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Registered for this event!
              </div>
            )}
            {scanStatus === 'not_registered' && (
              <div className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Not registered for this event.
              </div>
            )}
            {scanStatus === 'member_only' && (
              <div className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" /> Member verified (no event context).
              </div>
            )}
            {scanStatus === 'checked_in' && (
              <div className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Successfully checked in!
              </div>
            )}
            {scanStatus === 'invalid' && (
              <div className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Invalid QR code.
              </div>
            )}
            {scanStatus === 'error' && (
              <div className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Error processing QR code.
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {scanStatus === 'registered' && scannedData.member && (
                <Button 
                  onClick={handleCheckIn}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Check In
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => {
                  setScannedData(null)
                  setScanStatus(null)
                }}
                className="flex-1 border-gray-600 text-gray-300"
            >
              Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrations && selectedEventRegistrations && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              Registrations for {selectedEventRegistrations.event.title}
            </h2>
            
            <div className="mb-4">
              <select
                value={registrationFilter}
                onChange={(e) => setRegistrationFilter(e.target.value as any)}
                className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
              >
                <option value="all">All Registrations</option>
                <option value="paid">Paid Only</option>
                <option value="pending">Pending Payment</option>
              </select>
            </div>
            
            <div className="space-y-2">
                {selectedEventRegistrations.registrations
                .filter((reg: any) => {
                  if (registrationFilter === 'paid') return reg.paymentVerified
                  if (registrationFilter === 'pending') return !reg.paymentVerified
                    return true
                  })
                .map((registration: any) => (
                  <div key={registration.id} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{registration.userName}</p>
                      <p className="text-gray-400 text-sm">{registration.userEmail}</p>
                        </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {registration.paymentVerified ? (
                          <span className="text-green-400">Paid</span>
                        ) : (
                          <span className="text-yellow-400">Pending</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            
            <Button 
              onClick={() => setShowRegistrations(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 