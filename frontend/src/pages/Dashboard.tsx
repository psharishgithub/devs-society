import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ParticlesComponent } from '../components/particles'
import { Code, CreditCard, Calendar, LogOut, User, Crown, Sparkles, ArrowRight, Bell, Settings, Activity, Users, Trophy, Clock, Plus, RefreshCw, X, Menu } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI, usersAPI } from '../services/api'
import type { Event, UserStats } from '../services/api'

interface DashboardStats {
  eventsAttended: number
  upcomingEvents: number
  memberSince: string
  points: number
  totalEvents: number
  registeredEvents: number
}

export function Dashboard() {
  const { user, logout, refreshUser, error, clearError } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    eventsAttended: 0,
    upcomingEvents: 0,
    memberSince: '',
    points: 0,
    totalEvents: 0,
    registeredEvents: 0
  })
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to DEVS Portal!', type: 'info', unread: true },
    { id: 2, message: 'New event: React Workshop next week', type: 'event', unread: true }
  ])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setIsLoadingEvents(true)
      setIsLoadingStats(true)
      
      // Load events and stats in parallel
      const [eventsResponse, statsResponse] = await Promise.all([
        eventsAPI.getUpcomingEvents(),
        usersAPI.getUserStats()
      ])
      
      if (eventsResponse.success) {
        setEvents(eventsResponse.events.slice(0, 3)) // Show only next 3 events
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.stats)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoadingEvents(false)
      setIsLoadingStats(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUser()
      await loadDashboardData()
      clearError()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedPhoto(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditProfile = async (updatedData: any) => {
    if (!user) {
      alert('User not found. Please try logging in again.')
      return
    }

    try {
      setIsUploading(true)
      
      // Update profile with photo file
      const response = await usersAPI.updateProfileWithPhoto(updatedData, selectedPhoto || undefined)
      
      if (response.success) {
        // Refresh user data
        await refreshUser()
        setShowEditProfile(false)
        setSelectedPhoto(null)
        setPhotoPreview(null)
        alert('Profile updated successfully!')
      } else {
        alert(`Failed to update profile: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const markNotificationRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'core-member':
        return <Crown className="h-5 w-5 text-yellow-400" />
      case 'board-member':
        return <Trophy className="h-5 w-5 text-purple-400" />
      case 'special-member':
        return <Sparkles className="h-5 w-5 text-cyan-400" />
      default:
        return <User className="h-5 w-5 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'core-member':
        return 'text-yellow-400'
      case 'board-member':
        return 'text-purple-400'
      case 'special-member':
        return 'text-cyan-400'
      default:
        return 'text-gray-400'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticlesComponent className="fixed inset-0" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/20"></div>
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-gray-800/50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="p-1 sm:p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse-glow">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-techie">DEVS</span>
              <span className="text-sm sm:text-lg text-gray-400 ml-1 sm:ml-2">Portal</span>
            </div>
          </motion.div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-300 hover:text-cyan-400"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Desktop Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex items-center gap-4"
          >
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                )}
              </Button>
            </div>

            {/* Refresh Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-300 hover:text-cyan-400"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Link to="/portal" className="text-sm text-purple-400 font-medium px-4 py-2 rounded-lg border border-purple-400/30 bg-purple-950/20">
              Dashboard
            </Link>
            <Link to="/events" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">
              Events
            </Link>
            <Link to="/card" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">
              My Card
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </motion.div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 border-t border-gray-800/50 pt-4"
            >
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-4 w-4" />
                      {notifications.some(n => n.unread) && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="text-gray-300 hover:text-cyan-400"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link to="/portal" className="text-sm text-purple-400 font-medium px-4 py-2 rounded-lg border border-purple-400/30 bg-purple-950/20 text-center">
                    Dashboard
                  </Link>
                  <Link to="/events" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors px-4 py-2 text-center">
                    Events
                  </Link>
                  <Link to="/card" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors px-4 py-2 text-center">
                    My Card
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative z-10 bg-red-500/10 border-b border-red-500/30 p-3"
          >
            <div className="container mx-auto flex items-center justify-between">
              <p className="text-red-400 text-sm">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError} className="text-red-400 hover:text-red-300">
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-120px)] py-12">
        <div className="container mx-auto px-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Profile Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gradient-cyber bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${user.photoUrl ? 'hidden' : ''}`}>
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              </div>
            </motion.div>

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full px-6 py-2 border border-purple-500/20 mb-6">
              {getRoleIcon(user.role)}
              <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                {user.role.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 font-techie">
              Welcome, <span className="text-gradient glitch-text">{user.fullName.split(' ')[0]}</span>!
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-8 px-4">
              Your digital workspace awaits. Manage your membership, explore events, and connect with the DEVS community.
            </p>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-gradient-cyber mx-auto rounded-full"
            ></motion.div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 max-w-4xl mx-auto px-4"
          >
            <div className="backdrop-glass rounded-xl p-6 border border-cyan-400/30 text-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-1">{user.memberId}</h3>
              <p className="text-gray-400 text-sm">Member ID</p>
            </div>
            
            <div className="backdrop-glass rounded-xl p-6 border border-purple-400/30 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-400 mb-1">{stats.eventsAttended}</h3>
              <p className="text-gray-400 text-sm">Events Attended</p>
            </div>
            
            <div className="backdrop-glass rounded-xl p-6 border border-green-400/30 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-1">{stats.upcomingEvents}</h3>
              <p className="text-gray-400 text-sm">Upcoming Events</p>
            </div>

            {/* Points feature commented out for now
            <div className="backdrop-glass rounded-xl p-6 border border-yellow-400/30 text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-1">{stats.points}</h3>
              <p className="text-gray-400 text-sm">Points</p>
            </div>
            */}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 px-4">
            {/* Left Column - Action Cards */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Digital Card */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="group relative"
                >
                  <Link to="/card" className="block">
                    <div className="card-gradient rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-2xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <CreditCard className="h-6 w-6 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Digital Card</h3>
                            <p className="text-cyan-300 text-xs">ID: {user.memberId}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                          Access your digital membership card with QR code for event check-ins.
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-cyan-400">
                            <Sparkles className="h-3 w-3" />
                            <span className="text-xs font-medium">Always Available</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-cyan-400 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* Events */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="group relative"
                >
                  <Link to="/events" className="block">
                    <div className="card-gradient rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Calendar className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Events</h3>
                            <p className="text-purple-300 text-xs">{stats.upcomingEvents} upcoming</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                          Discover workshops, hackathons, and community events.
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-purple-400">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs font-medium">Stay Updated</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-purple-400 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="backdrop-glass rounded-2xl p-6 border border-gradient-cyber"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                  <Link to="/events">
                    <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                      View All
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                {isLoadingEvents ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-400/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                                                             <div className="flex items-center gap-1">
                                 <Clock className="h-3 w-3" />
                                 {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </div>
                            </div>
                          </div>
                          <Link to={`/events/`}>
                            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                              View
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No upcoming events</p>
                    <p className="text-gray-500 text-sm">Check back later for new events</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - User Info & Activity */}
            <div className="space-y-8">
              {/* User Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="backdrop-glass rounded-2xl p-6 border border-gradient-cyber"
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{user.fullName}</h3>
                  <p className="text-gray-400 text-sm mb-2">{user.email}</p>
                  <div className="inline-flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 text-xs">
                    {getRoleIcon(user.role)}
                    <span className={getRoleColor(user.role)}>
                      {user.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-gray-400 text-xs">Member Since</p>
                        <p className="text-white font-semibold">{stats.memberSince}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">College</p>
                        <p className="text-white font-semibold text-xs">{user.college}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Batch Year</p>
                        <p className="text-white font-semibold text-xs">{user.batchYear || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Phone</p>
                        <p className="text-white font-semibold text-xs">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="backdrop-glass rounded-2xl p-6 border border-gradient-cyber"
              >
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/card" className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-cyan-400">
                      <CreditCard className="h-4 w-4 mr-2" />
                      My Card
                    </Button>
                  </Link>
                  <Link to="/events" className="block">
                    <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-green-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Events
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-300 hover:text-purple-400"
                    onClick={() => setShowEditProfile(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@devs-society.com" className="text-cyan-400 hover:text-cyan-300 underline">
                support@devs-society.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border border-gray-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const updatedData = {
                fullName: formData.get('fullName') as string,
                phone: formData.get('phone') as string,
                college: formData.get('college') as string,
                batchYear: formData.get('batchYear') as string,
              }
              handleEditProfile(updatedData)
            }} className="space-y-4">
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      {selectedPhoto ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    {selectedPhoto && (
                      <p className="text-xs text-gray-400 mt-1">
                        Selected: {selectedPhoto.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={user.fullName}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={user.phone}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">College</label>
                <input
                  type="text"
                  name="college"
                  defaultValue={user.college}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Batch Year</label>
                <input
                  type="text"
                  name="batchYear"
                  defaultValue={user.batchYear}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
} 