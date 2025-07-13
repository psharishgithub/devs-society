import React, { useState, useEffect } from 'react'
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/eventApi'
import { superAdminApiService } from '../services/adminApi'

interface EventRegisterProps {
  event: any
  user: any
}

const EventRegister: React.FC<EventRegisterProps> = ({ event, user }) => {
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [adminsByCollege, setAdminsByCollege] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // Fetch admins for "Open to All" events
  useEffect(() => {
    if (event.eventType === 'open-to-all' && event.isPaid) {
      const fetchAdmins = async () => {
        try {
          setLoading(true)
          const response = await superAdminApiService.getAdminsForEvents()
          if (response.success) {
            setAdminsByCollege(response.adminsByCollege)
          }
        } catch (error) {
          console.error('Error fetching admins:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchAdmins()
    }
  }, [event.eventType, event.isPaid])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setConfirmation('')

    if (event.isPaid) {
      if (event.eventType === 'open-to-all' && !selectedAdminId) {
        setError('Please select an admin')
        return
      }
      
      setIsPaying(true)
      try {
        // 1. Create Razorpay order
        const { data } = await createRazorpayOrder(event.id, selectedAdminId)
        if (!data.success) throw new Error('Order creation failed')
        const order = data.order

        // 2. Open Razorpay modal
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: event.title,
          description: `Registration for ${event.title}`,
          order_id: order.id,
          handler: async function (response: any) {
            // 3. Verify payment
            const verifyRes = await verifyRazorpayPayment(event.id, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              adminId: selectedAdminId
            })
            if (verifyRes.data.success) {
              setConfirmation('Payment successful! Registration confirmed. Check your email for details.')
            } else {
              setError('Payment verification failed. Please contact support.')
            }
            setIsPaying(false)
          },
          prefill: {
            name: user.fullName,
            email: user.email
          },
          theme: { color: '#f97316' } // Orange theme
        }
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      } catch (err: any) {
        setError('Payment failed: ' + (err.message || 'Unknown error'))
        setIsPaying(false)
      }
    } else {
      // Free event registration logic here
      setConfirmation('Registration successful! Check your email for details.')
    }
  }

  const getSelectedAdminInfo = () => {
    if (!selectedAdminId || !adminsByCollege) return null
    
    for (const college of Object.values(adminsByCollege)) {
      const admin = (college as any).admins.find((a: any) => a.id === selectedAdminId)
      if (admin) {
        return {
          admin,
          college: college as any
        }
      }
    }
    return null
  }

  const selectedAdminInfo = getSelectedAdminInfo()
  const selectedAdminPricing = event.adminPricing?.find((p: any) => p.adminId === selectedAdminId)

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {event.isPaid && event.eventType === 'open-to-all' && (
        <div>
          <label className="block font-medium mb-2 text-orange-400">
            Select Admin for Registration
            {loading && <span className="text-gray-400 ml-2">Loading admins...</span>}
          </label>
          <select
            value={selectedAdminId}
            onChange={e => setSelectedAdminId(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            required
          >
            <option value="">Select Admin</option>
            {Object.values(adminsByCollege).map((college: any) => (
              <optgroup key={college.collegeCode} label={`${college.collegeName} (${college.collegeCode})`}>
                {college.admins.map((admin: any) => {
                  const pricing = event.adminPricing?.find((p: any) => p.adminId === admin.id)
                  return (
                    <option key={admin.id} value={admin.id}>
                      {admin.fullName} (Batch {admin.batchYear}) - ₹{pricing?.amount || 0}
                    </option>
                  )
                })}
              </optgroup>
            ))}
          </select>
          
          {selectedAdminInfo && selectedAdminPricing && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="text-sm text-orange-300">
                <p><strong>Selected Admin:</strong> {selectedAdminInfo.admin.fullName}</p>
                <p><strong>College:</strong> {selectedAdminInfo.college.collegeName} ({selectedAdminInfo.college.collegeCode})</p>
                <p><strong>Batch Year:</strong> {selectedAdminInfo.admin.batchYear}</p>
                <p><strong>Amount:</strong> ₹{selectedAdminPricing.amount}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {event.isPaid && event.eventType === 'college-specific' && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="text-sm text-orange-300">
            <p><strong>Event Type:</strong> College Specific</p>
            <p><strong>Amount:</strong> ₹{event.price}</p>
          </div>
        </div>
      )}

      {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>}
      {confirmation && <div className="text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3">{confirmation}</div>}
      
      <button 
        type="submit" 
        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={isPaying}
      >
        {event.isPaid ? (isPaying ? 'Processing Payment...' : 'Pay & Register') : 'Register for Free'}
      </button>
    </form>
  )
}

export default EventRegister 