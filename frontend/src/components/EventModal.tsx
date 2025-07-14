import React, { useState, useEffect } from 'react'

interface EventModalProps {
  event: any | null
  open: boolean
  mode: 'view' | 'edit' | 'create'
  onClose: () => void
  onSave: (eventData: any) => void
  onDelete?: (eventId: string) => void
  colleges?: any[] // Optional, for targetCollege select
}

const eventTypes = [
  { value: 'open-to-all', label: 'Open to All' },
  { value: 'college-specific', label: 'College Specific' }
]

const EventModal: React.FC<EventModalProps> = ({ event, open, mode, onClose, onSave, onDelete, colleges = [] }) => {
  const [form, setForm] = useState<any>(event || {})
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    setForm(event || {})
    setSelectedPhoto(null)
    setPhotoPreview(event?.photoUrl || null)
  }, [event, open, mode])

  if (!open) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave({ ...form, photo: selectedPhoto })
  }

  const isReadOnly = mode === 'view'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-white mb-4">
          {mode === 'create' ? 'Create Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
        </h2>
        <div className="space-y-4">
          {/* Event Thumbnail Upload */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Event Thumbnail (optional)</label>
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={isReadOnly} />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded object-cover border border-gray-700" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Event Title</label>
            <input name="title" value={form.title || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly} required />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Date</label>
              <input name="date" type="date" value={form.date ? form.date.slice(0,10) : ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly} required />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Time</label>
              <input name="time" type="time" value={form.time || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly} required />
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Location</label>
            <input name="location" value={form.location || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Max Attendees</label>
              <input name="maxAttendees" type="number" min="1" value={form.maxAttendees || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly} />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Event Type</label>
              <select name="eventType" value={form.eventType || 'open-to-all'} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly}>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          {form.eventType === 'college-specific' && (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Target College</label>
              <select name="targetCollege" value={form.targetCollege || ''} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" disabled={isReadOnly}>
                <option value="">Select college</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>{college.name} ({college.code})</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          {isReadOnly ? (
            <>
              <button className="bg-purple-600 px-4 py-2 rounded text-white" onClick={onClose}>Close</button>
              {onDelete && <button className="bg-red-600 px-4 py-2 rounded text-white" onClick={() => onDelete(event.id)}>Delete</button>}
              <button className="bg-gray-700 px-4 py-2 rounded text-white" onClick={() => onSave({ ...form, mode: 'edit' })}>Edit</button>
            </>
          ) : (
            <>
              <button className="bg-purple-600 px-4 py-2 rounded text-white" onClick={handleSave}>{mode === 'create' ? 'Create' : 'Save'}</button>
              <button className="bg-gray-700 px-4 py-2 rounded text-white" onClick={onClose}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventModal 