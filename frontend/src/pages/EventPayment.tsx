import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI } from '../services/api'
import { superAdminApiService } from '../services/adminApi'
import type { Event } from '../services/api'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function EventPayment() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user, isLoading: userLoading } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [adminsByCollege, setAdminsByCollege] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!eventId) {
      navigate('/events');
      return;
    }
    
    // Only redirect to login if we're sure the user is not authenticated
    // Wait for userLoading to complete before making any decisions
    if (userLoading) {
      return; // Still loading, wait
    }
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // User is authenticated, load event data
    loadEventData();
  }, [eventId, user, userLoading, navigate]);

  const loadEventData = async () => {
    try {
      setLoading(true)
      setError('')

      // Load event details
      const eventResponse = await eventsAPI.getEvent(eventId!)
      if (!eventResponse.success) {
        setError('Event not found')
        return
      }

      const eventData = eventResponse.event
      setEvent(eventData)

      // For "Open to All" paid events, load admin options
      if (eventData.isPaid && eventData.eventType === 'open-to-all') {
        try {
          // Test without auth first
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'
          const testResponse = await fetch(`${API_BASE}/events/admins-for-events`);
          const testData = await testResponse.json();
          console.log('Test response without auth:', testData);
          console.log('Available colleges:', Object.keys(testData.adminsByCollege));
          console.log('College IDs:', Object.keys(testData.adminsByCollege).map(key => testData.adminsByCollege[key].college.id));
          
          const adminsResponse = await eventsAPI.getAdminsForEvents();
          console.log('Admins response:', adminsResponse);
          if (adminsResponse.success) {
            console.log('Admins by college:', adminsResponse.adminsByCollege);
            setAdminsByCollege(adminsResponse.adminsByCollege)
          }
        } catch (error) {
          console.error('Error loading admins:', error)
        }
      }
    } catch (error: any) {
      console.error('Error loading event data:', error)
      setError('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  // Determine if the user is an admin in the list
  const isUserAdmin = Object.values(adminsByCollege).some((collegeData: any) =>
    collegeData.admins.some((admin: any) => admin.fullName?.toLowerCase() === user?.fullName?.toLowerCase())
  );

  // Filter admins to only those matching the user's batch year AND college
  const filteredAdminsByCollege = Object.entries(adminsByCollege).reduce((acc, [collegeId, collegeData]) => {
    // Type guard for collegeData
    if (!collegeData || typeof collegeData !== 'object' || !('admins' in collegeData) || !('college' in collegeData)) return acc;
    
    console.log('Processing college:', collegeId, collegeData);
    console.log('User data:', user);
    console.log('User collegeRef:', (user as any)?.collegeRef);
    console.log('User college:', user?.college);
    
    const matchingAdmins = (collegeData as any).admins.filter(
      (admin: any) => {
        const batchMatch = Number(admin.batchYear) === Number(user?.batchYear);
        const collegeMatch = ((collegeData as any).college?.id && (user as any)?.collegeRef && (collegeData as any).college.id === (user as any).collegeRef) ||
                            ((collegeData as any).college?.name && user?.college && (collegeData as any).college.name === user.college);
        
        console.log(`Admin: ${admin.fullName} Batch: ${admin.batchYear} User batch: ${user?.batchYear} Batch match: ${batchMatch}`);
        console.log(`College ID match: ${(collegeData as any).college?.id} User collegeRef: ${(user as any)?.collegeRef} College match: ${collegeMatch}`);
        console.log(`College name match: ${(collegeData as any).college?.name} User college: ${user?.college} Name match: ${(collegeData as any).college?.name === user?.college}`);
        
        return batchMatch && collegeMatch;
      }
    );
    
    console.log('Matching admins for college', collegeId, ':', matchingAdmins);
    
    if (matchingAdmins.length > 0) {
      acc[collegeId] = {
        ...collegeData,
        admins: matchingAdmins
      };
    }
    
    return acc;
  }, {} as typeof adminsByCollege);

  // If only one admin is available, auto-select it
  useEffect(() => {
    const allMatchingAdmins = Object.values(filteredAdminsByCollege).flatMap((college: any) => college.admins);
    if (allMatchingAdmins.length === 1) {
      setSelectedAdminId(allMatchingAdmins[0].id);
    }
  }, [JSON.stringify(filteredAdminsByCollege)]);

  const handlePayment = async () => {
    if (!event || !user) return

    if (event.eventType === 'open-to-all' && !selectedAdminId) {
      setError('Please select an admin')
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Create Razorpay order
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'
      const orderResponse = await fetch(`${API_BASE}/events/${eventId}/razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          adminId: selectedAdminId
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
            const verifyResponse = await fetch(`${API_BASE}/events/${eventId}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                adminId: selectedAdminId
              })
            })

            const verifyData = await verifyResponse.json()
            if (verifyData.success) {
              setSuccess('Payment successful! Registration confirmed. Check your email for details.')
              setTimeout(() => {
                navigate('/events')
              }, 3000)
            } else {
              setError('Payment verification failed. Please contact support.')
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            setError('Payment verification failed. Please contact support.')
          }
          setProcessing(false)
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
      setError(error.message || 'Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  const getAmount = () => {
    if (!event) return 0
    
    if (event.eventType === 'open-to-all' && selectedAdminId) {
      const adminPricing = event.adminPricing?.find(p => p.adminId === selectedAdminId)
      return adminPricing?.amount || event.price || 0
    }
    
    return event.price || 0
  }

  const getSelectedAdminInfo = () => {
    if (!selectedAdminId || !adminsByCollege) return null
    
    for (const college of Object.values(adminsByCollege) as any[]) {
      const admin = college?.admins?.find((a: any) => a.id === selectedAdminId)
      if (admin && college?.college) {
        return { admin, college: college.college }
      }
    }
    return null
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-400" />
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
          <p className="text-gray-400">Event not found</p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  if (!event.isPaid) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-4 text-green-400" />
          <p className="text-gray-400">This is a free event</p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/events')}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <h1 className="text-2xl font-bold">Event Payment</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Event Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold mb-4">{event.title}</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Event Type:</strong> {event.eventType === 'open-to-all' ? 'Open to All' : 'College Specific'}</p>
              <p><strong>Amount:</strong> ₹{getAmount()}</p>
            </div>
          </motion.div>

          {/* Admin Selection for Open to All Events */}
          {event.eventType === 'open-to-all' && (
            <>
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-4">Loading Admin Options...</h3>
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                  </div>
                </motion.div>
              ) : Object.keys(filteredAdminsByCollege).length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold mb-4">Select Admin</h3>
              <div className="space-y-4">
                {Object.entries(filteredAdminsByCollege).map(([collegeId, collegeData]: [string, any]) => (
                  <div key={collegeId} className="border border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-2">
                      {collegeData?.college?.collegeName || 'Unknown College'}
                    </h4>
                    <div className="space-y-2">
                      {collegeData?.admins?.map((admin: any) => {
                        const adminPricing = event.adminPricing?.find(p => p.adminId === admin.id)
                        return (
                          <label key={admin.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                            <input
                              type="radio"
                              name="adminId"
                              value={admin.id}
                              checked={selectedAdminId === admin.id}
                              onChange={(e) => setSelectedAdminId(e.target.value)}
                              className="text-orange-500"
                              disabled={Object.values(filteredAdminsByCollege).flatMap((c: any) => c.admins).length === 1}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{admin.fullName}</p>
                              <p className="text-sm text-gray-400">Batch: {admin.batchYear}</p>
                              <p className="text-sm text-orange-400">₹{adminPricing?.amount || 0}</p>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-4">No Admin Options Available</h3>
                  <p className="text-gray-400">No admin found for your batch year. Please contact support.</p>
                </motion.div>
              )}
            </>
          )}

          {/* Selected Admin Info */}
          {selectedAdminId && getSelectedAdminInfo() && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6"
            >
              <h3 className="font-semibold text-orange-400 mb-2">Selected Admin</h3>
              <div className="text-sm text-orange-300">
                <p><strong>Name:</strong> {getSelectedAdminInfo()?.admin.fullName}</p>
                <p><strong>College:</strong> {getSelectedAdminInfo()?.college.collegeName}</p>
                <p><strong>Batch:</strong> {getSelectedAdminInfo()?.admin.batchYear}</p>
                <p><strong>Amount:</strong> ₹{getAmount()}</p>
              </div>
            </motion.div>
          )}

          {/* Payment Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400">
                {success}
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={processing || (event.eventType === 'open-to-all' && !selectedAdminId)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹{getAmount()} & Register
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-400">
              You will be redirected to Razorpay for secure payment
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 