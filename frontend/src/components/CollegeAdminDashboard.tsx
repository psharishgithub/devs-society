import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap, Users, Calendar, Settings, BarChart3, LogOut,
  Menu, X, User, Mail, Phone, Clock, Shield,
  Plus, Edit, Trash2, Eye, Search, Filter, Bell, TrendingUp,
  ChevronRight, Activity, UserCheck, MapPin, Building,
  CheckCircle, XCircle, AlertTriangle, Award
} from 'lucide-react'
import { 
  collegeAdminApiService, 
  type Admin
} from '../services/adminApi'

interface CollegeAnalytics {
  overview: {
    totalUsers: number
    activeUsers: number
    totalEvents: number
    upcomingEvents: number
  }
  usersByRole: Record<string, number>
  eventsByCategory: Record<string, number>
  recentRegistrations: Array<{
    eventTitle: string
    userName: string
    registeredAt: Date
    status: string
  }>
  college: {
    name: string
    code: string
  }
}

const CollegeAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [analytics, setAnalytics] = useState<CollegeAnalytics | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  // Load data on component mount
  useEffect(() => {
    loadCollegeAdminData()
  }, [])

  // Load tab-specific data
  useEffect(() => {
    switch (activeTab) {
      case 'users':
        loadUsers()
        break
      case 'events':
        loadEvents()
        break
    }
  }, [activeTab])

  const loadCollegeAdminData = async () => {
    try {
      const response = await collegeAdminApiService.getAnalytics()

      if (response.success) {
        setAnalytics(response.analytics)
      }

      // Get admin info from localStorage
      const adminData = localStorage.getItem('adminUser')
      if (adminData) {
        setAdmin(JSON.parse(adminData))
      }
    } catch (error) {
      console.error('Error loading college admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await collegeAdminApiService.getUsers()
      if (response.success) {
        setUsers(response.users || [])
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadEvents = async () => {
    try {
      const response = await collegeAdminApiService.getEvents()
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

  const sidebarItems = [
    { id: 'overview', icon: BarChart3, label: 'Overview', color: 'purple' },
    { id: 'users', icon: Users, label: 'Users', color: 'cyan' },
    { id: 'events', icon: Calendar, label: 'Events', color: 'green' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', color: 'blue' },
    { id: 'settings', icon: Settings, label: 'Settings', color: 'gray' },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* College Info Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{analytics?.college.name}</h2>
            <p className="text-purple-300 text-lg">{analytics?.college.code}</p>
            <div className="flex items-center gap-2 mt-2">
              <Award className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-gold-300">Tenure Head</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-300">{admin?.fullName}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-green-300 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Active Tenure</span>
            </div>
            <div className="text-xs text-gray-400">
              {admin?.tenure?.startDate ? 
                `Since ${new Date(admin.tenure.startDate).toLocaleDateString()}` : 
                'No tenure info'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white">{analytics?.overview.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-cyan-600/20 to-cyan-800/20 border border-cyan-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300 text-sm">Active Members</p>
              <p className="text-3xl font-bold text-white">{analytics?.overview.activeUsers || 0}</p>
            </div>
            <UserCheck className="w-8 h-8 text-cyan-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Total Events</p>
              <p className="text-3xl font-bold text-white">{analytics?.overview.totalEvents || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 border border-orange-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm">Upcoming Events</p>
              <p className="text-3xl font-bold text-white">{analytics?.overview.upcomingEvents || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
      </div>

      {/* User Roles Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Users by Role</h3>
          <div className="space-y-4">
            {Object.entries(analytics?.usersByRole || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    role === 'core-member' ? 'bg-purple-400' :
                    role === 'board-member' ? 'bg-cyan-400' :
                    role === 'special-member' ? 'bg-green-400' :
                    'bg-gray-400'
                  }`}></div>
                  <span className="text-gray-300">
                    {role === 'core-member' ? 'Core Member' :
                     role === 'board-member' ? 'Board Member' :
                     role === 'special-member' ? 'Special Member' :
                     role === 'other' ? 'Other' : role.replace('-', ' ')}
                  </span>
                </div>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Events by Category</h3>
          <div className="space-y-4">
            {Object.entries(analytics?.eventsByCategory || {}).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    category === 'workshop' ? 'bg-blue-400' :
                    category === 'seminar' ? 'bg-green-400' :
                    category === 'hackathon' ? 'bg-red-400' :
                    category === 'competition' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`}></div>
                  <span className="text-gray-300 capitalize">{category}</span>
                </div>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Event Registrations</h3>
          <button
            onClick={() => setActiveTab('events')}
            className="text-cyan-300 hover:text-cyan-200 text-sm flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {analytics?.recentRegistrations?.slice(0, 5).map((registration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex-1">
                <div className="text-white font-medium">{registration.userName}</div>
                <div className="text-sm text-gray-400">registered for {registration.eventTitle}</div>
                {/* Payment Status for Paid Events */}
                {registration.eventIsPaid && (
                  <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    registration.paymentVerified ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    {registration.paymentVerified ? 'Paid' : 'Pending Payment'}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`text-xs px-2 py-1 rounded-full ${
                  registration.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                  registration.status === 'waitlisted' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {registration.status}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(registration.registeredAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('users')}
          className="bg-gradient-to-r from-cyan-600/20 to-cyan-800/20 border border-cyan-500/20 rounded-xl p-6 text-left group"
        >
          <Users className="w-8 h-8 text-cyan-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Manage Users</h3>
          <p className="text-gray-400 text-sm mb-4">View and manage users from your college</p>
          <div className="flex items-center text-cyan-300 group-hover:text-cyan-200">
            <span className="text-sm">Go to users</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('events')}
          className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/20 rounded-xl p-6 text-left group"
        >
          <Calendar className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Manage Events</h3>
          <p className="text-gray-400 text-sm mb-4">Create and manage college-specific events</p>
          <div className="flex items-center text-green-300 group-hover:text-green-200">
            <span className="text-sm">Go to events</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </motion.button>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage users from {analytics?.college.name}</p>
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
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
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
            <thead className="bg-white/5 border-b border-gray-600">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">User</th>
                <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                <th className="text-left p-4 text-gray-300 font-medium">Member ID</th>
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
                .map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-700 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'core-member' ? 'bg-purple-500/20 text-purple-300' :
                        user.role === 'board-member' ? 'bg-cyan-500/20 text-cyan-300' :
                        user.role === 'special-member' ? 'bg-green-500/20 text-green-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {user.role === 'core-member' ? 'Core Member' :
                         user.role === 'board-member' ? 'Board Member' :
                         user.role === 'special-member' ? 'Special Member' :
                         user.role === 'other' ? 'Other' : user.role?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{user.memberId}</td>
                    <td className="p-4">
                      {user.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors">
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

  const renderEvents = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Event Management</h2>
          <p className="text-gray-400">Manage events for {analytics?.college.name}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
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
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
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
              className="bg-white/5 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <p className="text-sm text-gray-400">{event.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {event.location}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {event.registrationCount || 0} / {event.maxAttendees}
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'users':
        return renderUsers()
      case 'events':
        return renderEvents()
      case 'analytics':
        return <div className="text-white">Detailed analytics coming soon...</div>
      case 'settings':
        return <div className="text-white">Settings coming soon...</div>
      default:
        return renderOverview()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-white">Loading college admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-30 h-screen w-64 transition-all duration-300`}>
          <div className="w-full h-full bg-white/5 border-r border-gray-700 backdrop-blur-xl overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white">College Admin</h2>
                  <p className="text-sm text-gray-400">DEVS Society</p>
                </div>
              </div>
            </div>

            {/* Admin Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{admin?.fullName}</p>
                  <p className="text-xs text-cyan-400 font-medium">College Administrator</p>
                </div>
              </div>
              {analytics?.college && (
                <div className="mt-2 p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-gray-400">Assigned to</div>
                  <div className="text-sm text-white font-medium">{analytics.college.name}</div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          activeTab === item.id
                            ? `bg-${item.color}-600 text-white`
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
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
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-white/5 border-b border-gray-700 p-4 lg:p-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white capitalize flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-cyan-400" />
                    {activeTab.replace('-', ' ')}
                  </h1>
                  <p className="text-gray-400">
                    {activeTab === 'overview' && 'College administration dashboard and overview'}
                    {activeTab === 'users' && 'Manage users from your assigned college'}
                    {activeTab === 'events' && 'Create and manage college-specific events'}
                    {activeTab === 'analytics' && 'Detailed analytics for your college'}
                    {activeTab === 'settings' && 'College administration settings'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Bell className="w-6 h-6" />
                </button>
                <div className="text-sm text-gray-400">
                  Last login: {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 lg:p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CollegeAdminDashboard 