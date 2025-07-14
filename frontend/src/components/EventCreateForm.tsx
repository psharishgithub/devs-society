import React, { useState, useEffect } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { superAdminApiService } from '../services/adminApi'

type AdminPricing = { adminType: string; amount: string; adminId?: string }
interface EventCreateFormProps {
  onSubmit: (form: any) => void
}

const EventCreateForm: React.FC<EventCreateFormProps> = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    eventType: 'open-to-all',
    targetCollege: '',
    isPaid: false,
    adminPricing: [{ adminType: '', amount: '' } as AdminPricing],
    collegeAmount: '',
    photo: null as File | null,
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [adminsByCollege, setAdminsByCollege] = useState<any>({})
  const [colleges, setColleges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let checked = false
    if (type === 'checkbox' || type === 'radio') {
      checked = (e.target as HTMLInputElement).checked
    }
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : type === 'radio' ? value === 'true' : value
    }))
  }

  const handleAdminPricingChange = (idx: number, field: keyof AdminPricing, value: string) => {
    const newPricing = [...form.adminPricing]
    newPricing[idx][field] = value
    setForm(f => ({ ...f, adminPricing: newPricing }))
  }

  const addAdminPricing = () => setForm(f => ({ ...f, adminPricing: [...f.adminPricing, { adminType: '', amount: '' }] }))
  const removeAdminPricing = (idx: number) => setForm(f => ({ ...f, adminPricing: f.adminPricing.filter((_, i) => i !== idx) }))

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      setForm(f => ({ ...f, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const removePhoto = () => {
    setForm(f => ({ ...f, photo: null }))
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
      setPhotoPreview(null)
    }
  }

  // Fetch admins and colleges when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [adminsResponse, collegesResponse] = await Promise.all([
          superAdminApiService.getAdminsForEvents(),
          superAdminApiService.getColleges()
        ])
        
        if (adminsResponse.success) {
          setAdminsByCollege(adminsResponse.adminsByCollege)
        }
        
        if (collegesResponse.success) {
          setColleges(collegesResponse.colleges)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Auto-populate admin pricing when event type changes to open-to-all and is paid
  useEffect(() => {
    if (form.eventType === 'open-to-all' && form.isPaid && Object.keys(adminsByCollege).length > 0) {
      const allAdmins: AdminPricing[] = []
      Object.values(adminsByCollege).forEach((college: any) => {
        college.admins.forEach((admin: any) => {
          allAdmins.push({
            adminType: `${admin.fullName} (${college.collegeCode} - ${admin.batchYear})`,
            amount: '',
            adminId: admin.id
          })
        })
      })
      setForm(f => ({ ...f, adminPricing: allAdmins }))
    }
  }, [form.eventType, form.isPaid, adminsByCollege])

  // Cleanup photo preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.isPaid) {
      if (form.eventType === 'open-to-all' && form.adminPricing.some(p => !p.adminType || !p.amount)) {
        setError('Please fill all admin type pricing fields')
        return
      }
      if (form.eventType === 'college-specific') {
        if (!form.targetCollege) {
          setError('Please select a target college for this college-specific event')
          return
        }
        if (form.isPaid && !form.collegeAmount) {
          setError('Please enter the amount for this college-specific event')
          return
        }
      }
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none" required />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none" required />
      </div>
      
      {/* Event Photo Upload */}
      <div>
        <label className="block font-medium mb-1">Event Photo (Optional)</label>
        <div className="space-y-3">
          {/* Photo Preview */}
          {photoPreview && (
            <div className="relative">
              <img 
                src={photoPreview} 
                alt="Event preview" 
                className="w-full h-48 object-cover rounded-lg border border-gray-600"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Upload Button */}
          {!photoPreview && (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-400">Click to upload event photo</p>
                <p className="text-gray-500 text-sm mt-1">JPG, PNG, GIF up to 5MB</p>
              </label>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block font-medium mb-1">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Time</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" required />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Location</label>
        <input name="location" value={form.location} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none" required />
      </div>
      <div>
        <label className="block font-medium mb-1">Max Attendees</label>
        <input type="number" name="maxAttendees" value={form.maxAttendees} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none" min="1" required />
      </div>
      <div>
        <label className="block font-medium mb-1">Event Type</label>
        <select name="eventType" value={form.eventType} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" required>
          <option value="open-to-all">Open to All</option>
          <option value="college-specific">College Specific</option>
        </select>
      </div>
      {form.eventType === 'college-specific' && (
        <div>
          <label className="block font-medium mb-1">Target College</label>
          <select name="targetCollege" value={form.targetCollege} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none" required>
            <option value="">Select a college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name} ({college.code})
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block font-medium mb-1">Is this event Free or Paid?</label>
        <div className="flex gap-4">
          <label className="text-white">
            <input type="radio" name="isPaid" value="false" checked={!form.isPaid} onChange={handleChange} className="accent-orange-500 mr-1" /> Free
          </label>
          <label className="text-white">
            <input type="radio" name="isPaid" value="true" checked={form.isPaid} onChange={handleChange} className="accent-orange-500 mr-1" /> Paid
          </label>
        </div>
      </div>
      {form.isPaid && form.eventType === 'open-to-all' && (
        <div className="bg-white/5 border border-orange-500/30 rounded-lg p-4">
          <label className="block font-medium mb-2 text-orange-400">
            Admin Pricing (for Open to All events)
            {loading && <span className="text-gray-400 ml-2">Loading admins...</span>}
          </label>
          {form.adminPricing.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Admin Type (e.g. Hursun, Teenture)"
                  value={item.adminType}
                  onChange={e => handleAdminPricingChange(idx, 'adminType', e.target.value)}
                  className={`px-2 py-1 rounded border text-white placeholder-gray-400 focus:outline-none w-full ${
                    item.adminId 
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-200' 
                      : 'bg-white/10 border-gray-600 focus:border-orange-500'
                  }`}
                  required
                  readOnly={!!item.adminId}
                />
                {item.adminId && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1 rounded-full">
                    Auto
                  </div>
                )}
              </div>
              <input
                type="number"
                min="0"
                placeholder="Amount (₹)"
                value={item.amount}
                onChange={e => handleAdminPricingChange(idx, 'amount', e.target.value)}
                className="px-2 py-1 rounded bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none w-24"
                required
              />
              {form.adminPricing.length > 1 && !item.adminId && (
                <button type="button" onClick={() => removeAdminPricing(idx)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAdminPricing} className="text-orange-400 hover:text-orange-500 mt-2 font-medium">+ Add Custom Admin Type</button>
          
          {/* Summary of included colleges */}
          {Object.keys(adminsByCollege).length > 0 && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Included Colleges:</p>
              <div className="flex flex-wrap gap-2">
                {Object.values(adminsByCollege).map((college: any) => (
                  <span key={college.collegeCode} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                    {college.collegeName} ({college.admins.length} admin{college.admins.length !== 1 ? 's' : ''})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {form.isPaid && form.eventType === 'college-specific' && (
        <div className="bg-white/5 border border-orange-500/30 rounded-lg p-4">
          <label className="block font-medium mb-2 text-orange-400">Amount for this College Specific Event (₹)</label>
          <input
            type="number"
            min="0"
            placeholder="Amount (₹)"
            name="collegeAmount"
            value={form.collegeAmount}
            onChange={handleChange}
            className="px-2 py-1 rounded bg-white/10 border border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none w-32"
            required
          />
        </div>
      )}
      {error && <div className="text-red-400 text-sm">{error}</div>}
      <button type="submit" className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-bold">Create Event</button>
    </form>
  )
}

export default EventCreateForm 