import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Crown, Building, Users, Calendar, Settings, BarChart3, LogOut,
  Menu, X, User, Mail, Phone, GraduationCap, Clock, Shield,
  Plus, Edit, Trash2, Eye, Search, Filter, Bell, TrendingUp,
  ChevronRight, Activity, UserCheck, MapPin, Archive,
  RotateCcw, UserX, AlertTriangle, CheckCircle, XCircle, QrCode, AlertCircle, BookOpen
} from 'lucide-react'
import { 
  superAdminApiService, 
  type Admin, 
  type College, 
  type SuperAdminStats 
} from '../services/adminApi'
import UserModal from './UserModal'
import QRScanner from './QRScanner'
import EventCreateForm from './EventCreateForm'
import { qrCodeAPI } from '../services/eventFormApi'

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [colleges, setColleges] = useState<College[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [createType, setCreateType] = useState<'college' | 'admin' | 'event'>('college')
  const [modalEntityType, setModalEntityType] = useState<'college' | 'admin' | 'event' | 'user' | 'event-registrations'>('college')
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const navigate = useNavigate()
  // Add state for user modal
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [scannedData, setScannedData] = useState<any>(null)
  const [scanStatus, setScanStatus] = useState<string | null>(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null)
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)

  // Load data on component mount
  useEffect(() => {
    loadSuperAdminData()
  }, [])

  // Load tab-specific data
  useEffect(() => {
    switch (activeTab) {
      case 'colleges':
        loadColleges()
        break
      case 'admins':
        loadAdmins()
        break
      case 'users':
        loadUsers()
        break
      case 'events':
        loadEvents()
        break
    }
  }, [activeTab])

  const loadSuperAdminData = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Loading SuperAdmin data...')
      
      // Check authentication first
      const adminToken = localStorage.getItem('adminToken')
      const adminUser = localStorage.getItem('adminUser')
      
      if (!adminToken || !adminUser) {
        console.error('❌ No authentication token found')
        return
      }
      
      console.log('✅ Authentication token found')
      
      const [profileResponse, statsResponse] = await Promise.all([
        superAdminApiService.getDashboardStats(),
        superAdminApiService.getAnalytics()
      ])

      console.log('📊 Dashboard response:', profileResponse)
      console.log('📈 Analytics response:', statsResponse)

      if (profileResponse.success) {
        setStats(profileResponse.stats)
        console.log('✅ Dashboard stats loaded:', profileResponse.stats)
      } else {
        console.error('❌ Failed to load dashboard stats:', profileResponse.message)
      }

      if (statsResponse.success) {
        setAnalytics(statsResponse.analytics)
        console.log('✅ Analytics loaded successfully:', statsResponse.analytics)
      } else {
        console.error('❌ Failed to load analytics:', statsResponse.message)
      }

      // Get admin info from localStorage
      if (adminUser) {
        try {
          const adminData = JSON.parse(adminUser)
          setAdmin(adminData)
          console.log('✅ Admin data loaded:', adminData.fullName)
    } catch (error) {
          console.error('❌ Error parsing admin data:', error)
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading super admin data:', error)
      console.error('Error details:', error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadColleges = async () => {
    try {
      const response = await superAdminApiService.getColleges()
      if (response.success) {
        setColleges(response.colleges || [])
      }
    } catch (error) {
      console.error('Error loading colleges:', error)
    }
  }

  const loadAdmins = async () => {
    try {
      const response = await superAdminApiService.getAdmins()
      if (response.success) {
        setAdmins(response.admins || [])
      }
    } catch (error) {
      console.error('Error loading admins:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await superAdminApiService.getAllUsers()
      if (response.success) {
        setUsers(response.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await superAdminApiService.getAllEvents()
      if (response.success) {
        setEvents(response.events || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/admin/login')
  }

  // Form submission handlers
  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const name = formData.get('name') as string
      const code = formData.get('code') as string
      const location = formData.get('location') as string
      const address = formData.get('address') as string
      const email = formData.get('contactEmail') as string
      const phone = formData.get('contactPhone') as string

      // Validate required fields
      if (!name || !code || !location || !address) {
        alert('Please fill in all required fields (name, code, location, address)')
        return
      }

      const collegeData = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        location: location.trim(),
        address: address.trim(),
        contactInfo: {
          email: email?.trim() || '',
          phone: phone?.trim() || '',
        }
      }

      const response = await superAdminApiService.createCollege(collegeData)
      if (response.success) {
        await loadColleges() // Reload colleges
        setShowCreateModal(false)
        setFormData({})
        // Show success notification
        alert('College created successfully!')
      } else {
        alert('Failed to create college: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error creating college:', error)
      alert('Failed to create college: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const assignedCollege = formData.get('assignedCollege') as string
      const batchYear = parseInt(formData.get('batchYear') as string)
      
      if (!assignedCollege) {
        alert('Please select a college for admin assignment')
        setIsSubmitting(false)
        return
      }

      if (!batchYear || isNaN(batchYear) || batchYear < 2000 || batchYear > 2030) {
        alert('Please enter a valid batch year between 2000 and 2030')
        setIsSubmitting(false)
        return
      }

      // Check if this batch year already has an admin for this college
      const college = colleges.find(c => c.id === assignedCollege)
      if (college?.currentTenureHeads?.some(tenure => tenure.batchYear === batchYear)) {
        alert(`Batch year ${batchYear} already has an admin assigned to ${college.name}`)
        setIsSubmitting(false)
        return
      }

      const adminData = {
        fullName: formData.get('fullName') as string,
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        assignedCollege: assignedCollege,
        batchYear: batchYear
      }

      const response = await superAdminApiService.createAdmin(adminData)
      if (response.success) {
        await loadAdmins()
        setShowCreateModal(false)
        setFormData({})
        alert('Admin created successfully!')
      } else {
        alert('Failed to create admin: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error creating admin:', error)
      alert('Failed to create admin: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateEventForm = async (form: any) => {
    setIsSubmitting(true)
    try {
      // Process admin pricing data
      const eventData = {
        ...form,
        adminPricing: form.adminPricing?.map((pricing: any) => ({
          adminType: pricing.adminType,
          amount: parseFloat(pricing.amount) || 0,
          adminId: pricing.adminId
        })).filter((pricing: any) => pricing.adminType && pricing.amount > 0) || []
      }

      // Use createEventWithPhoto if photo is provided, otherwise use regular createEvent
      let response
      if (form.photo) {
        // Import the event API for photo upload
        const { createEventWithPhoto } = await import('../services/eventApi')
        response = await createEventWithPhoto(eventData)
      } else {
        response = await superAdminApiService.createEvent(eventData)
      }

      if (response.success) {
        await loadEvents()
        setShowCreateModal(false)
        setFormData({})
        alert('Event created successfully!')
      } else {
        alert('Failed to create event: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        const errorDetails = validationErrors.map((err: any) => `${err.path}: ${err.msg}`).join('\n')
        alert(`Validation failed:\n${errorDetails}`)
      } else {
        alert('Failed to create event: ' + errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Action handlers
  const handleDeleteCollege = async (collegeId: string, collegeName: string) => {
    if (window.confirm(`Are you sure you want to delete "${collegeName}"? This action cannot be undone.`)) {
      try {
        const response = await superAdminApiService.deleteCollege(collegeId)
        if (response.success) {
          await loadColleges()
          alert('College deleted successfully!')
        } else {
          alert('Failed to delete college: ' + (response.message || 'Unknown error'))
        }
      } catch (error: any) {
        console.error('Error deleting college:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        
        // Check if it's the active tenure heads error
        if (errorMessage.includes('active tenure heads')) {
          const shouldEndTenure = window.confirm(
            `Cannot delete "${collegeName}" because it has active tenure heads.\n\nWould you like to end their tenure and then delete the college?`
          )
          
          if (shouldEndTenure) {
            try {
              // Find active admin for this college
              const activeAdmin = admins.find(admin => 
                admin.assignedCollege?.id === collegeId && admin.tenureInfo?.isActive
              )
              
              if (activeAdmin) {
                // End the admin's tenure using the existing API
                const tenureResponse = await superAdminApiService.endTenure({
                  adminId: activeAdmin.id,
                  reason: `College deletion: ${collegeName}`
                })
                
                if (tenureResponse.success) {
                  // Now try to delete the college again
                  const deleteResponse = await superAdminApiService.deleteCollege(collegeId)
                  if (deleteResponse.success) {
                    await Promise.all([loadColleges(), loadAdmins()])
                    alert(`Admin tenure ended and college "${collegeName}" deleted successfully!`)
                  } else {
                    alert('Failed to delete college after ending tenure: ' + (deleteResponse.message || 'Unknown error'))
                  }
                } else {
                  alert('Failed to end admin tenure: ' + (tenureResponse.message || 'Unknown error'))
                }
              } else {
                alert('Could not find active admin for this college. Please try manually ending the tenure first.')
              }
            } catch (tenureError: any) {
              console.error('Error ending tenure:', tenureError)
              alert('Failed to end admin tenure. Please try manually ending the tenure first.')
            }
          }
        } else {
          alert('Failed to delete college: ' + errorMessage)
        }
      }
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (window.confirm(`Are you sure you want to remove admin "${adminName}"? This action cannot be undone.`)) {
      try {
        const response = await superAdminApiService.deleteAdmin(adminId)
        if (response.success) {
          await loadAdmins()
          alert('Admin removed successfully!')
        } else {
          alert('Failed to remove admin: ' + (response.message || 'Unknown error'))
        }
      } catch (error: any) {
        console.error('Error removing admin:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        
        // Check if it's a constraint error
        if (errorMessage.includes('constraint') || errorMessage.includes('admin_college_check')) {
          alert('Cannot remove admin due to database constraints. Please try ending their tenure first.')
        } else {
          alert('Failed to remove admin: ' + errorMessage)
        }
      }
    }
  }

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (window.confirm(`Are you sure you want to delete event "${eventTitle}"? This action cannot be undone.`)) {
      try {
        const response = await superAdminApiService.deleteEvent(eventId)
        if (response.success) {
          await loadEvents()
          alert('Event deleted successfully!')
        } else {
          alert('Failed to delete event: ' + (response.message || 'Unknown error'))
        }
      } catch (error: any) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const handleTransferTenure = async (adminId: string, adminName: string) => {
    // Show available colleges for transfer
    const availableColleges = colleges.filter(college => {
      // Find the admin we're transferring
      const admin = admins.find(a => a.id === adminId)
      // Don't show the college they're currently assigned to
      return college.id !== admin?.assignedCollege?.id
    })

    if (availableColleges.length === 0) {
      alert('No other colleges available for transfer.')
      return
    }

    const collegeOptions = availableColleges.map((college, index) => 
      `${index + 1}. ${college.name} (${college.code}) - ${college.location}`
    ).join('\n')

    const selectedCollegeIndex = window.prompt(
      `Select a college to transfer ${adminName} to:\n\n${collegeOptions}\n\nEnter the number (1-${availableColleges.length}):`
    )

    if (selectedCollegeIndex) {
      const index = parseInt(selectedCollegeIndex) - 1
      if (index >= 0 && index < availableColleges.length) {
        const selectedCollege = availableColleges[index]
        const reason = window.prompt('Enter reason for tenure transfer:') || `Transfer to ${selectedCollege.name}`
        
        // Get the admin's current batch year or prompt for a new one
        const admin = admins.find(a => a.id === adminId)
        let batchYear = admin?.batchYear
        
        if (!batchYear) {
          const batchYearInput = window.prompt(
            `Enter the batch year for ${adminName} at ${selectedCollege.name} (e.g., 2024, 2025):`
          )
          if (!batchYearInput) {
            alert('Batch year is required for transfer')
            return
          }
          batchYear = parseInt(batchYearInput)
          if (isNaN(batchYear) || batchYear < 2000 || batchYear > 2030) {
            alert('Please enter a valid batch year between 2000 and 2030')
            return
          }
        }
        
        if (window.confirm(`Transfer ${adminName} to ${selectedCollege.name}?`)) {
          try {
            const response = await superAdminApiService.transferTenure({
              toAdminId: adminId,
              collegeId: selectedCollege.id,
              batchYear: batchYear,
              transferReason: reason
            })
            if (response.success) {
              await Promise.all([loadAdmins(), loadColleges()])
              alert('Tenure transferred successfully!')
            } else {
              alert('Failed to transfer tenure: ' + (response.message || 'Unknown error'))
            }
          } catch (error: any) {
            console.error('Error transferring tenure:', error)
            alert('Failed to transfer tenure: ' + (error.message || 'Unknown error'))
          }
        }
      } else {
        alert('Invalid selection. Please try again.')
      }
    }
  }

  const handleEndTenure = async (adminId: string, adminName: string) => {
    const reason = window.prompt(`Enter reason for ending ${adminName}'s tenure:`)
    if (reason) {
      if (window.confirm(`Are you sure you want to end ${adminName}'s tenure? This action cannot be undone.`)) {
        try {
          const response = await superAdminApiService.endTenure({
            adminId: adminId,
            reason: reason
          })
          if (response.success) {
            await Promise.all([loadAdmins(), loadColleges()])
            alert('Tenure ended successfully!')
          } else {
            alert('Failed to end tenure: ' + (response.message || 'Unknown error'))
          }
        } catch (error: any) {
          console.error('Error ending tenure:', error)
          alert('Failed to end tenure: ' + (error.message || 'Unknown error'))
        }
      }
    }
  }

  const handleAssignAdmin = async (collegeId: string, collegeName: string) => {
    // Get all admins (both unassigned and assigned to other colleges)
    const availableAdmins = admins.filter(admin => admin.role === 'admin')

    if (availableAdmins.length === 0) {
      alert('No admins found. Please create a new admin first.')
      return
    }

    // Create options for the admin selection with current assignment info
    const adminOptions = availableAdmins.map((admin, index) => {
      const currentAssignment = admin.assignedCollege 
        ? ` (Currently at: ${admin.assignedCollege.name} - Batch ${admin.batchYear || 'N/A'})`
        : ' (Unassigned)'
      return `${index + 1}. ${admin.fullName} (${admin.username}) - ${admin.email}${currentAssignment}`
    }).join('\n')

    const selectedAdminIndex = window.prompt(
      `Select an admin to assign to ${collegeName}:\n\n${adminOptions}\n\nEnter the number (1-${availableAdmins.length}):`
    )

    if (selectedAdminIndex) {
      const index = parseInt(selectedAdminIndex) - 1
      if (index >= 0 && index < availableAdmins.length) {
        const selectedAdmin = availableAdmins[index]
        
        // Check if admin is already assigned to this college
        if (selectedAdmin.assignedCollege?.id === collegeId) {
          alert(`${selectedAdmin.fullName} is already assigned to ${collegeName}`)
          return
        }

        // Prompt for batch year
        const batchYearInput = window.prompt(
          `Enter the batch year for ${selectedAdmin.fullName} at ${collegeName} (e.g., 2024, 2025):`
        )
        
        if (!batchYearInput) {
          alert('Batch year is required')
          return
        }
        
        const batchYear = parseInt(batchYearInput)
        if (isNaN(batchYear) || batchYear < 2000 || batchYear > 2030) {
          alert('Please enter a valid batch year between 2000 and 2030')
          return
        }

        // Check if this batch year already has an admin for this college
        const college = colleges.find(c => c.id === collegeId)
        if (college?.currentTenureHeads?.some(tenure => tenure.batchYear === batchYear)) {
          alert(`Batch year ${batchYear} already has an admin assigned to ${collegeName}`)
          return
        }

        // Confirm if admin is being transferred from another college
        let confirmMessage = `Assign ${selectedAdmin.fullName} to ${collegeName} for batch ${batchYear}?`
        if (selectedAdmin.assignedCollege) {
          confirmMessage = `Transfer ${selectedAdmin.fullName} from ${selectedAdmin.assignedCollege.name} to ${collegeName} for batch ${batchYear}? This will end their current tenure.`
        }

        if (window.confirm(confirmMessage)) {
          try {
            const response = await superAdminApiService.transferTenure({
              toAdminId: selectedAdmin.id,
              collegeId: collegeId,
              batchYear: batchYear,
              transferReason: selectedAdmin.assignedCollege 
                ? `Transfer from ${selectedAdmin.assignedCollege.name} to ${collegeName} for batch ${batchYear}`
                : `Initial assignment to ${collegeName} for batch ${batchYear}`
            })
            if (response.success) {
              await Promise.all([loadAdmins(), loadColleges()])
              alert(`${selectedAdmin.fullName} has been successfully assigned to ${collegeName} for batch ${batchYear}!`)
            } else {
              alert('Failed to assign admin: ' + (response.message || 'Unknown error'))
            }
          } catch (error: any) {
            console.error('Error assigning admin:', error)
            alert('Failed to assign admin: ' + (error.message || 'Unknown error'))
          }
        }
      } else {
        alert('Invalid selection. Please try again.')
      }
    }
  }

  // View handlers
  const handleViewCollege = async (collegeId: string) => {
    try {
      const college = colleges.find(c => c.id === collegeId)
      if (college) {
        setSelectedEntity(college)
        setModalEntityType('college')
        setShowViewModal(true)
      }
    } catch (error: any) {
      console.error('Error viewing college:', error)
      alert('Failed to load college details')
    }
  }

  const handleViewAdmin = async (adminId: string) => {
    try {
      const admin = admins.find(a => a.id === adminId)
      if (admin) {
        setSelectedEntity(admin)
        setModalEntityType('admin')
        setShowViewModal(true)
      }
    } catch (error: any) {
      console.error('Error viewing admin:', error)
      alert('Failed to load admin details')
    }
  }

  const handleViewEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (event) {
        setSelectedEntity(event)
        setModalEntityType('event')
        setShowViewModal(true)
      }
    } catch (error: any) {
      console.error('Error viewing event:', error)
      alert('Failed to load event details')
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (user) {
        setSelectedEntity(user)
        setModalEntityType('user')
        setShowViewModal(true)
      }
    } catch (error: any) {
      console.error('Error viewing user:', error)
      alert('Failed to load user details')
    }
  }

  // Edit handlers
  const handleEditCollege = async (collegeId: string) => {
    try {
      const college = colleges.find(c => c.id === collegeId)
      if (college) {
        setSelectedEntity(college)
        setModalEntityType('college')
        setFormData(college)
        setShowEditModal(true)
      }
    } catch (error: any) {
      console.error('Error editing college:', error)
      alert('Failed to load college for editing')
    }
  }

  const handleEditEvent = async (eventId: string) => {
    try {
      const event = events.find(e => e.id === eventId)
      if (event) {
        setSelectedEntity(event)
        setModalEntityType('event')
        setFormData(event)
        setShowEditModal(true)
        // Set photo preview if event has a photo
        if (event.photoUrl) {
          setEditPhotoPreview(event.photoUrl)
        } else {
          setEditPhotoPreview(null)
        }
        setEditPhotoFile(null)
      }
    } catch (error: any) {
      console.error('Error editing event:', error)
      alert('Failed to load event for editing')
    }
  }

  // Photo handling functions for edit modal
  const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      setEditPhotoFile(file)
      setEditPhotoPreview(URL.createObjectURL(file))
    }
  }

  const removeEditPhoto = () => {
    setEditPhotoFile(null)
    if (editPhotoPreview && editPhotoPreview !== selectedEntity?.photoUrl) {
      URL.revokeObjectURL(editPhotoPreview)
    }
    setEditPhotoPreview(null)
  }

  // Edit submission handlers
  const handleUpdateCollege = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const updateData = {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        location: formData.get('location') as string,
        address: formData.get('address') as string,
        contactInfo: {
          email: formData.get('contactEmail') as string,
          phone: formData.get('contactPhone') as string,
        }
      }

      const response = await superAdminApiService.updateCollege(selectedEntity.id, updateData)
      if (response.success) {
        await loadColleges()
        setShowEditModal(false)
        setSelectedEntity(null)
        setFormData({})
        alert('College updated successfully!')
      } else {
        alert('Failed to update college: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error updating college:', error)
      alert('Failed to update college: ' + (error.message || 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      const eventType = formData.get('eventType') as string
      
      const eventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        date: date,
        time: time,
        location: formData.get('location') as string,
        maxAttendees: formData.get('maxAttendees') ? parseInt(formData.get('maxAttendees') as string) : undefined,
        eventType: eventType,
        targetCollege: eventType === 'college-specific' ? formData.get('targetCollege') as string || undefined : undefined,
      }

      // Use updateEventWithPhoto if photo is provided, otherwise use regular updateEvent
      let response
      if (editPhotoFile) {
        // Import the event API for photo upload
        const { updateEventWithPhoto } = await import('../services/eventApi')
        response = await updateEventWithPhoto(selectedEntity.id, { ...eventData, photo: editPhotoFile })
      } else {
        response = await superAdminApiService.updateEvent(selectedEntity.id, eventData)
      }

      if (response.success) {
        await loadEvents()
        setShowEditModal(false)
        setSelectedEntity(null)
        setFormData({})
        // Clean up photo preview
        if (editPhotoPreview && editPhotoPreview !== selectedEntity?.photoUrl) {
          URL.revokeObjectURL(editPhotoPreview)
        }
        setEditPhotoPreview(null)
        setEditPhotoFile(null)
        alert('Event updated successfully!')
      } else {
        alert('Failed to update event: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error updating event:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      alert('Failed to update event: ' + errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewEventRegistrations = async (eventId: string) => {
    try {
      const response = await superAdminApiService.getEventRegistrations(eventId)
      if (response.success) {
        setSelectedEntity({ ...response.event, registrations: response.registrations })
        setModalEntityType('event-registrations')
        setShowViewModal(true)
      } else {
        alert('Failed to load event registrations: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error loading event registrations:', error)
      alert('Failed to load event registrations: ' + (error.message || 'Unknown error'))
    }
  }

  // Add edit handler for user
  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
      setUserModalOpen(true)
    }
  }

  // Add save handler for user
  const handleSaveUser = async (updatedUser: any) => {
    try {
      const response = await superAdminApiService.updateUser(updatedUser.id, updatedUser)
      if (response.success) {
        setUserModalOpen(false)
        setSelectedUser(null)
        await loadUsers()
        alert('User updated successfully!')
      } else {
        alert('Failed to update user: ' + (response.message || 'Unknown error'))
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleQRScan = async (qrData: string): Promise<'success' | 'invalid' | 'already_checked_in' | 'error'> => {
    try {
      // Use the new unified QR verification system
      const verifyResponse = await qrCodeAPI.verifyMember(qrData)
      
      if (verifyResponse.success) {
        setScannedData({
          qrCodeType: verifyResponse.qrCodeType,
          member: verifyResponse.member ?? null,
          eventRegistrations: Array.isArray(verifyResponse.eventRegistrations) ? verifyResponse.eventRegistrations : [],
          currentEvent: verifyResponse.currentEvent ?? null,
          currentRegistration: verifyResponse.currentRegistration ?? null,
          status: verifyResponse.status ?? 'member_only'
        })
        
        if (verifyResponse.qrCodeType === 'member_card') {
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

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview', color: 'purple' },
    { id: 'colleges', icon: Building, label: 'Colleges', color: 'cyan' },
    { id: 'admins', icon: Shield, label: 'Admins', color: 'green' },
    { id: 'users', icon: Users, label: 'Users', color: 'blue' },
    { id: 'events', icon: Calendar, label: 'Events', color: 'orange' },
    { id: 'attendance', icon: Calendar, label: 'Attendance', color: 'yellow' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: 'pink' },
    { id: 'participation', icon: Users, label: 'Participation', color: 'indigo' },
    { id: 'internal-booking', icon: BookOpen, label: 'Internal Booking', color: 'orange' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'gray' },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {admin?.fullName || 'Super Admin'}! 👋
            </h2>
            <p className="text-gray-300">
              Here's what's happening across all colleges in the DEVS Society portal
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Last updated</p>
            <p className="text-sm text-white">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-cyan-600/20 to-cyan-800/20 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-400/50 transition-colors cursor-pointer"
          onClick={() => setActiveTab('colleges')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 text-sm font-medium">Total Colleges</p>
              <p className="text-3xl font-bold text-white">{stats?.totalColleges || 0}</p>
              <p className="text-xs text-cyan-200 mt-1">Active institutions</p>
            </div>
            <Building className="w-8 h-8 text-cyan-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 rounded-xl p-6 hover:border-green-400/50 transition-colors cursor-pointer"
          onClick={() => setActiveTab('admins')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Total Admins</p>
              <p className="text-3xl font-bold text-white">{stats?.totalAdmins || 0}</p>
              <p className="text-xs text-green-200 mt-1">Active administrators</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 transition-colors cursor-pointer"
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-purple-200 mt-1">Registered members</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/20 rounded-xl p-6 hover:border-orange-400/50 transition-colors cursor-pointer"
          onClick={() => setActiveTab('events')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-white">{stats?.totalEvents || 0}</p>
              <p className="text-xs text-orange-200 mt-1">Active events</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* College-wise Overview */}
      <div className="bg-white/5 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
          <h3 className="text-xl font-bold text-white">College Overview</h3>
            <p className="text-gray-400 text-sm">Real-time data from all registered colleges</p>
          </div>
          <button
            onClick={() => {
              setCreateType('college')
              setShowCreateModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-300 rounded-lg hover:bg-cyan-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add College
          </button>
        </div>
        
        {stats?.collegeWiseData && stats.collegeWiseData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stats.collegeWiseData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{item.college.name}</h4>
                  <p className="text-sm text-gray-400">{item.college.code}</p>
                </div>
                <div className="text-right">
                    <div className={`text-sm ${item.admin ? 'text-green-300' : 'text-yellow-300'}`}>
                      {item.admin ? 'Active Admin' : 'No Admin'}
                    </div>
                  {item.admin && <div className="text-xs text-gray-400">{item.admin}</div>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{item.users}</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{item.events}</div>
                  <div className="text-xs text-gray-400">Events</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <div className="text-center py-8">
            <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400 mb-2">No college data available</p>
            <p className="text-sm text-gray-500">Add your first college to get started</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          <button
            onClick={loadSuperAdminData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('colleges')}
            className="bg-gradient-to-r from-cyan-600/20 to-cyan-800/20 border border-cyan-500/20 rounded-xl p-6 text-left group hover:border-cyan-400/50 transition-colors"
        >
          <Building className="w-8 h-8 text-cyan-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Manage Colleges</h3>
          <p className="text-gray-400 text-sm mb-4">Add, edit, and manage college information</p>
          <div className="flex items-center text-cyan-300 group-hover:text-cyan-200">
            <span className="text-sm">Go to colleges</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('admins')}
            className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 rounded-xl p-6 text-left group hover:border-green-400/50 transition-colors"
        >
          <Shield className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Manage Admins</h3>
          <p className="text-gray-400 text-sm mb-4">Create admins and manage tenure assignments</p>
          <div className="flex items-center text-green-300 group-hover:text-green-200">
            <span className="text-sm">Go to admins</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('analytics')}
            className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/20 rounded-xl p-6 text-left group hover:border-purple-400/50 transition-colors"
        >
          <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
          <p className="text-gray-400 text-sm mb-4">Detailed insights and reporting</p>
          <div className="flex items-center text-purple-300 group-hover:text-purple-200">
            <span className="text-sm">View analytics</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/superadmin/internal-booking')}
            className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/20 rounded-xl p-6 text-left group hover:border-orange-400/50 transition-colors"
          >
            <BookOpen className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Internal Booking</h3>
            <p className="text-gray-400 text-sm mb-4">Register users for events internally</p>
            <div className="flex items-center text-orange-300 group-hover:text-orange-200">
              <span className="text-sm">Go to booking</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  )

  const renderColleges = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">College Management</h2>
          <p className="text-gray-400">Manage all college information and tenure assignments</p>
        </div>
        <button
          onClick={() => {
            setCreateType('college')
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add College
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {colleges
          .filter(college => 
            college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            college.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            college.location.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{college.name}</h3>
                    <p className="text-sm text-gray-400">{college.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewCollege(college.id)}
                    className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditCollege(college.id)}
                    className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                    title="Edit College"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCollege(college.id, college.name)}
                    className="p-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Delete College"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {college.location}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {college.currentTenureHeads && college.currentTenureHeads.length > 0 ? 
                        `${college.currentTenureHeads.length} Active Admin${college.currentTenureHeads.length > 1 ? 's' : ''}` : 
                        'No Admin'
                      }
                    </span>
                  </div>
                  {college.currentTenureHeads && college.currentTenureHeads.length > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>

                {/* Display active admins with batch years */}
                {college.currentTenureHeads && college.currentTenureHeads.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {college.currentTenureHeads.map((tenure, index) => (
                      <div key={tenure.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">
                          {tenure.adminName} ({tenure.batchYear})
                        </span>
                        <span className="text-green-400">●</span>
                      </div>
                    ))}
                  </div>
                )}

                <button 
                  onClick={() => handleAssignAdmin(college.id, college.name)}
                  className="w-full mt-4 px-4 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Assign Admin
                </button>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  )

  const renderAdmins = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Admin Management</h2>
          <p className="text-gray-400">Manage admin accounts and tenure assignments</p>
        </div>
        <button
          onClick={() => {
            setCreateType('admin')
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Admin
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search admins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {admins
          .filter(admin => 
            admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.username?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((admin, index) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{admin.fullName}</h3>
                    <p className="text-sm text-gray-400">@{admin.username}</p>
                  </div>
                </div>
                                                 <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewAdmin(admin.id)}
                    className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {(admin as any).tenureInfo?.isActive && (
                    <>
                      <button 
                        onClick={() => handleTransferTenure(admin.id, admin.fullName)}
                        className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                        title="Transfer Tenure"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEndTenure(admin.id, admin.fullName)}
                        className="p-2 bg-yellow-600/20 text-yellow-300 rounded-lg hover:bg-yellow-600/30 transition-colors"
                        title="End Tenure"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteAdmin(admin.id, admin.fullName)}
                    className="p-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Remove Admin"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {admin.email}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Building className="w-4 h-4 text-gray-400" />
                  {(admin.assignedCollege as any)?.name || 'No college assigned'}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {(admin as any).tenureInfo?.startDate ? new Date((admin as any).tenureInfo.startDate).toLocaleDateString() : 'No tenure'}
                    </span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    (admin as any).tenureInfo?.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {(admin as any).tenureInfo?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  )

  const renderEvents = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Management</h2>
          <p className="text-gray-400">Manage all events across colleges</p>
       </div>{/*
        Failed to create event: Server error       */} <div className="flex gap-2">
          <button
            onClick={() => setShowQRScanner(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Scanner
          </button>
          <button
            onClick={() => {
              setCreateType('event')
              setShowCreateModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events
          .filter(event => 
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <p className="text-sm text-gray-400">{event.eventType}</p>
                  </div>
                </div>
                                 <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewEvent(event.id)}
                    className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="View Event Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleViewEventRegistrations(event.id)}
                    className="p-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-colors"
                    title="View Registrations"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEditEvent(event.id)}
                    className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                    title="Edit Event"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id, event.title)}
                    className="p-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(event.date).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location || 'Location TBD'}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {event.registrationCount || 0} / {event.maxAttendees || '∞'}
                    </span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    new Date(event.date) > new Date() ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Analytics & Reporting</h2>
          <p className="text-sm sm:text-base text-gray-400">Comprehensive insights across the DEVS Society platform</p>
        </div>
        <button 
          onClick={loadSuperAdminData}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm sm:text-base"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Refresh Analytics</span>
          <span className="sm:hidden">Refresh</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/20 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-blue-300 text-xs sm:text-sm">User Growth</p>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {analytics?.growth?.userGrowthRate ? `+${analytics.growth.userGrowthRate}%` : '0%'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {analytics?.growth?.newUsersThisMonth || 0} new users this month
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-green-300 text-xs sm:text-sm">Active Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {analytics?.engagement?.activeUsers || Math.floor((stats?.totalUsers || 0) * 0.75)}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {analytics?.engagement?.totalRegistrations || 0} total registrations
              </p>
            </div>
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/20 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-purple-300 text-xs sm:text-sm">Participation Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {analytics?.engagement?.averageParticipationRate || '0'}%
              </p>
              <p className="text-xs text-gray-400 truncate">average across events</p>
            </div>
            <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/20 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-orange-300 text-xs sm:text-sm">Platform Health</p>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {analytics?.engagement?.platformHealth || 95}%
              </p>
              <p className="text-xs text-gray-400 truncate">system uptime</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0 ml-2" />
          </div>
        </motion.div>
      </div>

      {/* College Performance */}
      <div className="bg-white/5 border border-gray-700 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">College Performance Metrics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {stats?.collegeWiseData?.map((item, index) => (
            <div key={index} className="bg-white/5 border border-gray-600 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm sm:text-base truncate">{item.college.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-400">{item.college.code}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-xs sm:text-sm text-cyan-300">{item.admin ? 'Managed' : 'Unmanaged'}</div>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs sm:text-sm">Users</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((item.users / Math.max(...(stats?.collegeWiseData?.map(d => d.users) || [1]))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-6 sm:w-8 text-xs sm:text-sm">{item.users}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs sm:text-sm">Events</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((item.events / Math.max(...(stats?.collegeWiseData?.map(d => d.events) || [1]))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium w-6 sm:w-8 text-xs sm:text-sm">{item.events}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs sm:text-sm">Engagement</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cyan-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(((item.users + item.events) / 20) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-cyan-300 text-xs sm:text-sm">{Math.min(Math.round(((item.users + item.events) / 20) * 100), 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Events */}
      {analytics?.topEvents && analytics.topEvents.length > 0 && (
        <div className="bg-white/5 border border-gray-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Top Performing Events</h3>
          <div className="space-y-3 sm:space-y-4">
            {analytics.topEvents.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-gray-600 rounded-lg p-3 sm:p-4 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-400 font-bold text-xs sm:text-sm">{index + 1}</span>
              </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm sm:text-base truncate">{event.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">
                        {event.registrations} registrations • {event.participationRate}% participation
                      </p>
              </div>
            </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-base sm:text-lg font-bold text-orange-400">{event.registrations}</div>
                    <div className="text-xs text-gray-400">registrations</div>
              </div>
              </div>
              </motion.div>
            ))}
            </div>
        </div>
      )}

      {/* Event Type Distribution */}
      {analytics?.eventTypeDistribution && Object.keys(analytics.eventTypeDistribution).length > 0 && (
        <div className="bg-white/5 border border-gray-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Event Type Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(analytics.eventTypeDistribution).map(([type, count]: [string, any], index: number) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-gray-600 rounded-lg p-3 sm:p-4 text-center"
              >
                <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-1 sm:mb-2">{count}</div>
                <div className="text-xs sm:text-sm text-gray-300 capitalize truncate">{type.replace('-', ' ')}</div>
                <div className="text-xs text-gray-400 mt-1">events</div>
              </motion.div>
            ))}
              </div>
              </div>
      )}

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white/5 border border-gray-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4">
            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 ${activity.iconBg || 'bg-blue-600/20'} rounded-full flex items-center justify-center mt-1 flex-shrink-0`}>
                    {activity.icon === 'UserCheck' && <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />}
                    {activity.icon === 'Calendar' && <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />}
                    {activity.icon === 'Building' && <Building className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />}
                    {activity.icon === 'Users' && <Users className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />}
                    {activity.icon === 'Shield' && <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />}
                    {!activity.icon && <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />}
              </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm sm:text-base truncate">{activity.title}</p>
                    <p className="text-xs sm:text-sm text-gray-400 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-400 mb-1 sm:mb-2 text-sm sm:text-base">No recent activity</p>
                <p className="text-xs sm:text-sm text-gray-500">Activity will appear here as users interact with the platform</p>
            </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-gray-700 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">System Health</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-xs sm:text-sm">Database Performance</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (analytics?.systemHealth?.databasePerformance || 95) >= 90 ? 'bg-green-500' :
                      (analytics?.systemHealth?.databasePerformance || 95) >= 70 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics?.systemHealth?.databasePerformance || 95}%` }}
                  ></div>
                </div>
                <span className={`text-xs sm:text-sm ${
                  (analytics?.systemHealth?.databasePerformance || 95) >= 90 ? 'text-green-300' :
                  (analytics?.systemHealth?.databasePerformance || 95) >= 70 ? 'text-orange-300' : 'text-red-300'
                }`}>
                  {analytics?.systemHealth?.databasePerformance || 95}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-xs sm:text-sm">API Response Time</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (analytics?.systemHealth?.apiResponseTime || 92) >= 90 ? 'bg-green-500' :
                      (analytics?.systemHealth?.apiResponseTime || 92) >= 70 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics?.systemHealth?.apiResponseTime || 92}%` }}
                  ></div>
                </div>
                <span className={`text-xs sm:text-sm ${
                  (analytics?.systemHealth?.apiResponseTime || 92) >= 90 ? 'text-green-300' :
                  (analytics?.systemHealth?.apiResponseTime || 92) >= 70 ? 'text-orange-300' : 'text-red-300'
                }`}>
                  {analytics?.systemHealth?.apiResponseTime || 92}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-xs sm:text-sm">Server Load</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (analytics?.systemHealth?.serverLoad || 68) <= 50 ? 'bg-green-500' :
                      (analytics?.systemHealth?.serverLoad || 68) <= 80 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics?.systemHealth?.serverLoad || 68}%` }}
                  ></div>
                </div>
                <span className={`text-xs sm:text-sm ${
                  (analytics?.systemHealth?.serverLoad || 68) <= 50 ? 'text-green-300' :
                  (analytics?.systemHealth?.serverLoad || 68) <= 80 ? 'text-orange-300' : 'text-red-300'
                }`}>
                  {analytics?.systemHealth?.serverLoad || 68}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-xs sm:text-sm">Storage Usage</span>
              <div className="flex items-center gap-2">
                <div className="w-16 sm:w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (analytics?.systemHealth?.storageUsage || 45) <= 60 ? 'bg-green-500' :
                      (analytics?.systemHealth?.storageUsage || 45) <= 85 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analytics?.systemHealth?.storageUsage || 45}%` }}
                  ></div>
                </div>
                <span className={`text-xs sm:text-sm ${
                  (analytics?.systemHealth?.storageUsage || 45) <= 60 ? 'text-green-300' :
                  (analytics?.systemHealth?.storageUsage || 45) <= 85 ? 'text-orange-300' : 'text-red-300'
                }`}>
                  {analytics?.systemHealth?.storageUsage || 45}%
                </span>
              </div>
            </div>

            <div className={`mt-4 sm:mt-6 p-3 sm:p-4 ${
              analytics?.systemHealth?.overallStatus === 'operational' ? 'bg-green-500/10 border-green-500/20' :
              analytics?.systemHealth?.overallStatus === 'warning' ? 'bg-orange-500/10 border-orange-500/20' :
              'bg-red-500/10 border-red-500/20'
            } border rounded-lg`}>
              <div className="flex items-center gap-2">
                {analytics?.systemHealth?.overallStatus === 'operational' ? (
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                ) : analytics?.systemHealth?.overallStatus === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                ) : (
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                )}
                <span className={`font-medium text-xs sm:text-sm ${
                  analytics?.systemHealth?.overallStatus === 'operational' ? 'text-green-300' :
                  analytics?.systemHealth?.overallStatus === 'warning' ? 'text-orange-300' : 'text-red-300'
                }`}>
                  {analytics?.systemHealth?.statusMessage || 'All systems operational'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {analytics?.systemHealth?.statusDescription || 'No critical issues detected'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics */}
      <div className="bg-white/5 border border-gray-700 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Advanced Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1 sm:mb-2">
              {Math.round(((stats?.totalUsers || 0) / (stats?.totalColleges || 1)) * 10) / 10}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Average Users per College</div>
          </div>

          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">
              {Math.round(((stats?.totalEvents || 0) / (stats?.totalColleges || 1)) * 10) / 10}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">Average Events per College</div>
          </div>

          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">
              {Math.round(((stats?.totalAdmins || 0) / (stats?.totalColleges || 1)) * 100)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-400">College Management Coverage</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage all users across colleges</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">User</th>
                <th className="text-left p-4 text-gray-300 font-medium">College</th>
                <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                <th className="text-left p-4 text-gray-300 font-medium">Joined</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(user => 
                  user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .slice(0, 10)
                .map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-700/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.fullName}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{user.college || 'No college'}</div>
                      {/*<div className="text-sm text-gray-400">{user.collegeRef || 'No college ID'}</div>*/}
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'core-member' ? 'bg-purple-500/20 text-purple-300' :
                        user.role === 'board-member' ? 'bg-blue-500/20 text-blue-300' :
                        user.role === 'special-member' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {user.role === 'core-member' ? 'Core Member' :
                         user.role === 'board-member' ? 'Board Member' :
                         user.role === 'special-member' ? 'Special Member' :
                         user.role === 'other' ? 'Other' : user.role?.replace('-', ' ') || 'Member'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewUser(user.id)}
                          className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
                          title="View User Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditUser(user.id)}
                          className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'colleges':
        return renderColleges()
      case 'admins':
        return renderAdmins()
      case 'users':
        return renderUsers()
      case 'events':
        return renderEvents()
      case 'analytics':
        return renderAnalytics()
      case 'settings':
        return <div className="text-white">Settings interface coming soon...</div>
      default:
        return renderOverview()
    }
  }

  const renderCreateModal = () => {
    if (!showCreateModal) return null
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              Create {createType === 'college' ? 'College' : createType === 'admin' ? 'Admin' : 'Event'}
            </h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {createType === 'event' ? (
            <EventCreateForm onSubmit={handleCreateEventForm} />
          ) : createType === 'college' ? (
            <form className="space-y-4" onSubmit={handleCreateCollege}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter college name"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g., RIT, PES"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea
                  name="address"
                  placeholder="Enter full address"
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="college@example.com"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  placeholder="+91 12345 67890"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign College *</label>
                <select 
                  name="assignedCollege"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select college (required)</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id} className="bg-black">
                      {college.name} ({college.code}) - {college.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Batch Year *</label>
                <input
                  type="number"
                  name="batchYear"
                  placeholder="e.g., 2024, 2025"
                  required
                  min="2000"
                  max="2030"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Year of the batch this admin will represent</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create College'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleCreateAdmin}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter secure password"
                  required
                  minLength={8}
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign College *</label>
                <select 
                  name="assignedCollege"
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                >
                  <option value="">Select college (required)</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id} className="bg-black">
                      {college.name} ({college.code}) - {college.location}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Batch Year *</label>
                <input
                  type="number"
                  name="batchYear"
                  placeholder="e.g., 2024, 2025"
                  required
                  min="2000"
                  max="2030"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Year of the batch this admin will represent</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    )
  }

  const renderViewModal = () => {
    if (!showViewModal || !selectedEntity) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {modalEntityType === 'college' ? 'College Details' :
               modalEntityType === 'admin' ? 'Admin Details' :
               modalEntityType === 'event' ? 'Event Details' :
               'User Details'}
            </h3>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {modalEntityType === 'college' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College Name</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Code</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.code}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.location}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.contactInfo?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.contactInfo?.phone || 'N/A'}</div>
                  </div>
                </div>
              </>
            )}

            {modalEntityType === 'admin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.fullName}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.email}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Assigned College</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">
                    {(selectedEntity.assignedCollege as any)?.name || 'No college assigned'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tenure Status</label>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                    (selectedEntity as any).tenureInfo?.isActive 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {(selectedEntity as any).tenureInfo?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </>
            )}

            {modalEntityType === 'event' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Event Title</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.title}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.description}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">
                      {selectedEntity.date ? new Date(selectedEntity.date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Max Attendees</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.maxAttendees || 'Unlimited'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.eventType}</div>
                  </div>
                </div>
              </>
            )}

            {modalEntityType === 'user' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.fullName}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.phone}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">College</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.collegeRef?.name || selectedEntity.college}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">
                      {selectedEntity.role === 'core-member' ? 'Core Member' :
                       selectedEntity.role === 'board-member' ? 'Board Member' :
                       selectedEntity.role === 'special-member' ? 'Special Member' :
                       selectedEntity.role === 'other' ? 'Other' : selectedEntity.role}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Member ID</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.memberId}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Batch Year</label>
                    <div className="text-white bg-white/5 p-3 rounded-lg">{selectedEntity.batchYear}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const renderEditModal = () => {
    if (!showEditModal || !selectedEntity) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              Edit {modalEntityType === 'college' ? 'College' : 'Event'}
            </h3>
            <button
              onClick={() => {
                setShowEditModal(false)
                setSelectedEntity(null)
                setFormData({})
                // Clean up photo preview
                if (editPhotoPreview && editPhotoPreview !== selectedEntity?.photoUrl) {
                  URL.revokeObjectURL(editPhotoPreview)
                }
                setEditPhotoPreview(null)
                setEditPhotoFile(null)
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {modalEntityType === 'college' && (
            <form className="space-y-4" onSubmit={handleUpdateCollege}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedEntity.name}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College Code</label>
                <input
                  type="text"
                  name="code"
                  defaultValue={selectedEntity.code}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={selectedEntity.location}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea
                  name="address"
                  defaultValue={selectedEntity.address}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    defaultValue={selectedEntity.contactInfo?.email}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    defaultValue={selectedEntity.contactInfo?.phone}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedEntity(null)
                    setFormData({})
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update College'}
                </button>
              </div>
            </form>
          )}

          {modalEntityType === 'event' && (
            <form className="space-y-4" onSubmit={handleUpdateEvent}>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={selectedEntity.title}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedEntity.description}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                  rows={3}
                />
              </div>
              
              {/* Event Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Photo (Optional)</label>
                <div className="space-y-3">
                  {/* Photo Preview */}
                  {editPhotoPreview && (
                    <div className="relative">
                      <img 
                        src={editPhotoPreview} 
                        alt="Event preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeEditPhoto}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  {!editPhotoPreview && (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditPhotoChange}
                        className="hidden"
                        id="edit-photo-upload"
                      />
                      <label htmlFor="edit-photo-upload" className="cursor-pointer">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={selectedEntity.date ? new Date(selectedEntity.date).toISOString().split('T')[0] : ''}
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={selectedEntity.date ? new Date(selectedEntity.date).toTimeString().slice(0, 5) : ''}
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  defaultValue={selectedEntity.location}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Attendees</label>
                  <input
                    type="number"
                    name="maxAttendees"
                    defaultValue={selectedEntity.maxAttendees}
                    min="1"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
                  <select 
                    name="eventType"
                    defaultValue={selectedEntity.eventType}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="open-to-all" className="bg-black">Open to All</option>
                    <option value="college-specific" className="bg-black">College Specific</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target College (if specific)</label>
                <select 
                  name="targetCollege"
                  defaultValue={selectedEntity.targetCollege}
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="">All colleges</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id} className="bg-black">
                      {college.name} ({college.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedEntity(null)
                    setFormData({})
                    // Clean up photo preview
                    if (editPhotoPreview && editPhotoPreview !== selectedEntity?.photoUrl) {
                      URL.revokeObjectURL(editPhotoPreview)
                    }
                    setEditPhotoPreview(null)
                    setEditPhotoFile(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    )
  }

  // QR Scanner Modal
  const renderQRScannerModal = () => {
    return (
      <>
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
          title="Member Verification Scanner"
        />
        {/* QR Scan Result Modal */}
        {scannedData && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-cyan-900/90 to-purple-900/90 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-cyan-500/30">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <QrCode className="h-6 w-6 text-cyan-400" />
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
                    <span className="text-purple-300 font-semibold">Member:</span>
                    <span className="text-white">{scannedData.member.fullName}</span>
                </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 font-semibold">ID:</span>
                    <span className="text-white">{scannedData.member.memberId}</span>
                </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-300 font-semibold">College:</span>
                    <span className="text-white">{scannedData.member.college}</span>
                </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-300 font-semibold">Role:</span>
                    <span className="text-white">{scannedData.member.role}</span>
              </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-300 font-semibold">Batch:</span>
                    <span className="text-white">{scannedData.member.batchYear}</span>
                  </div>
                </div>
              )}

              {/* Event Registrations Information */}
              {scannedData.eventRegistrations && scannedData.eventRegistrations.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-300 font-semibold">Event Registrations ({scannedData.eventRegistrations.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {scannedData.eventRegistrations.map((reg: any, index: number) => (
                      <div key={reg.id} className="p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                        <div className="text-white text-sm font-medium">{reg.eventTitle}</div>
                        <div className="text-cyan-300 text-xs">
                          {reg.eventDate ? new Date(reg.eventDate).toLocaleDateString() : 'Date not set'} • {reg.eventLocation || 'Location not set'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1 py-0.5 rounded ${
                            reg.status === 'confirmed' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {reg.status}
                          </span>
                          {reg.paymentVerified && (
                            <span className="text-xs px-1 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Event Information (if scanning for specific event) */}
              {scannedData.currentEvent && (
              <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-300 font-semibold">Current Event Context</span>
                  </div>
                <div>
                    <span className="text-orange-300 font-semibold">Event:</span>
                    <span className="text-white ml-2">{scannedData.currentEvent.title}</span>
                </div>
                <div>
                    <span className="text-orange-300 font-semibold">Date:</span>
                    <span className="text-white ml-2">{scannedData.currentEvent.date}</span>
                </div>
                <div>
                    <span className="text-orange-300 font-semibold">Location:</span>
                    <span className="text-white ml-2">{scannedData.currentEvent.location}</span>
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
                  <span className="text-yellow-400">👤</span> 
                  {scannedData.eventRegistrations && scannedData.eventRegistrations.length > 0 
                    ? `Member verified with ${scannedData.eventRegistrations.length} event registration(s).`
                    : 'Member verified (no event registrations).'
                  }
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
              
              <button
                className="mt-2 w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition"
                onClick={() => { setScannedData(null); setScanStatus(null); }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  // Event Registrations Modal
  const renderEventRegistrationsModal = () => {
    if (!showViewModal || modalEntityType !== 'event-registrations' || !selectedEntity) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Event Registrations: {selectedEntity.title}
            </h3>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">
              Total Registrations: {selectedEntity.registrations?.length || 0}
              {selectedEntity.event?.isPaid && (
                <span className="ml-4 text-blue-600">
                  • Paid Event: {selectedEntity.registrations?.filter((r: any) => r.paymentVerified).length || 0} paid / {selectedEntity.registrations?.filter((r: any) => !r.paymentVerified).length || 0} pending
                </span>
              )}
            </p>
            {/* Debug Event Info */}
            <div className="p-2 bg-blue-50 rounded text-xs mb-2">
              <p className="text-gray-600">
                <strong>Event Debug:</strong> isPaid: {selectedEntity.event?.isPaid ? 'true' : 'false'}, 
                Price: {selectedEntity.event?.price || 'null'},
                Title: {selectedEntity.event?.title}
              </p>
            </div>
          </div>
          
                        {selectedEntity.registrations && selectedEntity.registrations.length > 0 ? (
            <div className="grid gap-4">
              {selectedEntity.registrations.map((registration: any, index: number) => (
                <div key={registration.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{registration.userName}</h4>
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
                        {selectedEntity.event?.isPaid && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            registration.paymentVerified ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {registration.paymentVerified ? 'Paid' : 'Pending Payment'}
                          </span>
                        )}
                      </div>
                      
                      {/* Payment Details */}
                      {selectedEntity.event?.isPaid && registration.paymentVerified && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <p className="text-gray-600">
                            <strong>Payment ID:</strong> {registration.paymentId || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Amount:</strong> ₹{registration.paymentAmount || 0} {registration.paymentCurrency || 'INR'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Payment Date:</strong> {registration.paymentTimestamp ? new Date(registration.paymentTimestamp).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      )}
                      
                      {/* Debug Information */}
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                        <p className="text-gray-600">
                          <strong>Debug:</strong> Event isPaid: {selectedEntity.event?.isPaid ? 'true' : 'false'}, 
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
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-white">Loading super admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {renderCreateModal()}
      {renderViewModal()}
      {renderEditModal()}
      {userModalOpen && selectedUser && (
        <UserModal
          user={selectedUser}
          open={userModalOpen}
          onClose={() => { setUserModalOpen(false); setSelectedUser(null) }}
          onSave={handleSaveUser}
          onDelete={(userId: string) => {
            // Handle user deletion if needed
            console.log('Delete user:', userId)
          }}
        />
      )}
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky lg:top-0 z-30 h-screen w-64 transition-all duration-300`}>
          <div className="w-full h-full bg-white/5 border-r border-gray-700 backdrop-blur-xl flex flex-col">
            {/* Header - Fixed at top */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white text-sm sm:text-base truncate">Super Admin</h2>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">DEVS Society</p>
                </div>
              </div>
            </div>

            {/* Admin Info - Fixed below header */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{admin?.fullName}</p>
                  <p className="text-xs text-gold-400 font-medium truncate">Super Administrator</p>
                </div>
              </div>
            </div>

            {/* Navigation - Scrollable */}
            <nav className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <ul className="space-y-1 sm:space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (item.id === 'attendance') {
                            navigate('/admin/events/attendance')
                          } else if (item.id === 'participation') {
                            navigate('/superadmin/participation')
                          } else if (item.id === 'internal-booking') {
                            navigate('/superadmin/internal-booking')
                          } else {
                            setActiveTab(item.id)
                          }
                        }}
                        className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all text-sm sm:text-base ${
                          activeTab === item.id
                            ? `bg-${item.color}-600 text-white shadow-lg`
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Logout - Fixed at bottom */}
            <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2 text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-h-screen lg:ml-0">
          {/* Header */}
          <header className="bg-white/5 border-b border-gray-700 p-4 lg:p-6 sticky top-0 z-10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-white capitalize flex items-center gap-2">
                    <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-gold-400 flex-shrink-0" />
                    <span className="truncate">{activeTab.replace('-', ' ')}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                    {activeTab === 'overview' && 'Super Admin dashboard overview and global statistics'}
                    {activeTab === 'colleges' && 'Manage all colleges and their information'}
                    {activeTab === 'admins' && 'Manage admin accounts and tenure assignments'}
                    {activeTab === 'users' && 'Global user management across all colleges'}
                    {activeTab === 'events' && 'Global event management and oversight'}
                    {activeTab === 'analytics' && 'Advanced analytics and reporting'}
                    {activeTab === 'participation' && 'Comprehensive event participation tracking'}
                    {activeTab === 'internal-booking' && 'Register users for events internally'}
                    {activeTab === 'settings' && 'System settings and configuration'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <div className="hidden sm:block text-xs sm:text-sm text-gray-400">
                  Last login: {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-2 sm:p-4 lg:p-6 overflow-x-hidden">
            {renderContent()}
          </main>
        </div>
      </div>
      {renderQRScannerModal()}
      {renderEventRegistrationsModal()}
    </div>
  )
}

export default SuperAdminDashboard 