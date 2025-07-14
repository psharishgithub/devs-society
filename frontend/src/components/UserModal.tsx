import React, { useState, useEffect } from 'react'

interface UserModalProps {
  user: any
  open: boolean
  onClose: () => void
  onSave: (updatedUser: any) => void
  onDelete?: (userId: string) => void
}

const UserModal: React.FC<UserModalProps> = ({ user, open, onClose, onSave, onDelete }) => {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<any>(user || {})

  useEffect(() => {
    setForm(user || {})
    setEditMode(false)
  }, [user, open])

  if (!open) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    onSave(form)
    setEditMode(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold text-white mb-4">{editMode ? 'Edit User' : 'User Details'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            {editMode ? (
              <input 
                name="fullName" 
                value={form.fullName || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none" 
              />
            ) : (
              <div className="text-white bg-white/5 p-3 rounded-lg">{user.fullName}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            {editMode ? (
              <input 
                name="email" 
                value={form.email || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none" 
              />
            ) : (
              <div className="text-white bg-white/5 p-3 rounded-lg">{user.email}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            {editMode ? (
              <select 
                name="role" 
                value={form.role || ''} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="core-member" className="bg-black">Core Member</option>
                <option value="board-member" className="bg-black">Board Member</option>
                <option value="special-member" className="bg-black">Special Member</option>
                <option value="other" className="bg-black">Other</option>
              </select>
            ) : (
              <div className="text-white bg-white/5 p-3 rounded-lg">
                {form.role === 'core-member' ? 'Core Member' :
                 form.role === 'board-member' ? 'Board Member' :
                 form.role === 'special-member' ? 'Special Member' :
                 form.role === 'other' ? 'Other' : form.role}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          {editMode ? (
            <>
              <button 
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" 
                onClick={handleSave}
              >
                Save
              </button>
              <button 
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/20 transition-colors" 
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors" 
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
              {onDelete && (
                <button 
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" 
                  onClick={() => onDelete(user.id)}
                >
                  Delete
                </button>
              )}
              <button 
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/20 transition-colors" 
                onClick={onClose}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserModal 