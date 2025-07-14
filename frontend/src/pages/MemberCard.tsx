import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ParticlesComponent } from '../components/particles'
import { Code, Building, Calendar as CalendarIcon, Hash, ArrowLeft, User, LogOut, Crown, Download, Share2, Smartphone, Trophy, Sparkles, Mail, Phone, Shield, Copy, Check, Clock, MapPin, Award, GraduationCap, QrCode } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { eventsAPI } from '../services/api'
import QRCode from 'qrcode'

export function MemberCard() {
  const { user, logout } = useAuth()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [shareSupported, setShareSupported] = useState(false)
  const [copied, setCopied] = useState(false)
  const [eventRegistrations, setEventRegistrations] = useState<any[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported('share' in navigator)
  }, [])

  // Fetch user's event registrations
  const fetchEventRegistrations = async () => {
    if (!user) return
    
    setIsLoadingEvents(true)
    try {
      const response = await eventsAPI.getEventsWithPricing()
      if (response.success) {
        // Get registration status for each event
        const registrations = await Promise.all(
          response.events.map(async (event) => {
            try {
              const registrationResponse = await eventsAPI.checkRegistrationStatus(event.id)
              if (registrationResponse.success && registrationResponse.isRegistered) {
                return {
                  eventId: event.id,
                  eventTitle: event.title,
                  eventDate: event.date,
                  registrationStatus: registrationResponse.status,
                  isPaid: event.isPaid || event.priceInfo?.isPaid || false
                }
              }
              return null
            } catch (error) {
              console.error(`Failed to check registration for event ${event.id}:`, error)
              return null
            }
          })
        )
        
        // Filter out null values (events not registered for)
        const validRegistrations = registrations.filter(reg => reg !== null)
        setEventRegistrations(validRegistrations)
      }
    } catch (error) {
      console.error('Failed to fetch event registrations:', error)
    } finally {
      setIsLoadingEvents(false)
    }
  }

  useEffect(() => {
    if (!user) return

    // Fetch event registrations first, then generate QR code
    fetchEventRegistrations()
  }, [user])

  useEffect(() => {
    if (!user) return

    // Generate QR code with member information only (backend will fetch event registrations)
    // Use a minimal format for better QR code scanning
    const memberData = {
      id: user.memberId, // This should match the member_id field in the database
      memberId: user.memberId, // Include both id and memberId for compatibility
      name: user.fullName,
      email: user.email,
      role: user.role,
      college: user.college,
      batchYear: user.batchYear,
      qrType: 'member_card',
      timestamp: new Date().toISOString()
    }
    
    QRCode.toDataURL(JSON.stringify(memberData), {
      width: 300, // Increased size for better scanning
      margin: 1, // Reduced margin for more data density
      color: {
        dark: '#000000', // Black for better contrast
        light: '#FFFFFF' // White background
      },
      errorCorrectionLevel: 'L' // Lower error correction for smaller QR codes
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR Code generation error:', err))
  }, [user]) // Remove eventRegistrations dependency to avoid regeneration

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'core-member':
        return <Crown className="h-6 w-6 text-yellow-400" />
      case 'board-member':
        return <Trophy className="h-6 w-6 text-purple-400" />
      case 'special-member':
        return <Sparkles className="h-6 w-6 text-cyan-400" />
      default:
        return <User className="h-6 w-6 text-gray-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'core-member':
        return 'from-yellow-500/20 via-yellow-600/20 to-orange-500/20'
      case 'board-member':
        return 'from-purple-500/20 via-purple-600/20 to-indigo-500/20'
      case 'special-member':
        return 'from-cyan-500/20 via-cyan-600/20 to-blue-500/20'
      default:
        return 'from-gray-500/20 via-gray-600/20 to-slate-500/20'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'core-member':
        return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
      case 'board-member':
        return 'border-purple-500/50 text-purple-400 bg-purple-500/10'
      case 'special-member':
        return 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
      default:
        return 'border-gray-500/50 text-gray-400 bg-gray-500/10'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'core-member':
        return 'Core Member'
      case 'board-member':
        return 'Board Member'
      case 'special-member':
        return 'Special Member'
      case 'regular-member':
        return 'Regular Member'
      default:
        return 'Member'
    }
  }

  const downloadCard = async () => {
    if (!user || isDownloading) return

    setIsDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      canvas.width = 800
      canvas.height = 500

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(1, '#1e293b')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 24px Arial'
      ctx.fillText('DEVS SOCIETY', 50, 50)
      ctx.fillText('Digital Member Card', 50, 80)

      ctx.font = 'bold 20px Arial'
      ctx.fillText(user.fullName, 50, 120)
      ctx.fillText(`ID: ${user.memberId}`, 50, 150)

      ctx.font = '16px Arial'
      ctx.fillText(`Role: ${getRoleDisplayName(user.role)}`, 50, 180)
      ctx.fillText(`College: ${user.college}`, 50, 210)
      ctx.fillText(`Batch: ${user.batchYear}`, 50, 240)
      ctx.fillText(`Email: ${user.email}`, 50, 270)
      ctx.fillText(`Member since: ${new Date(user.createdAt).toLocaleDateString()}`, 50, 300)
          
      // Download the canvas as image
      const link = document.createElement('a')
      link.download = `${user.fullName.replace(/\s+/g, '_')}_DEVS_Card.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const shareCard = async () => {
    if (!shareSupported) {
      alert('Sharing is not supported on this device')
      return
    }

    try {
      await navigator.share({
        title: 'DEVS Member Card',
        text: `Check out my DEVS Society member card!`,
        url: window.location.href
      })
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const copyMemberId = async () => {
    if (!user) return
    
    try {
      await navigator.clipboard.writeText(user.memberId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your card...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticlesComponent />
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-gray-800/50 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <Link to="/portal">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-cyan-400">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            
            <div>
              <span className="text-xl sm:text-2xl font-bold font-techie">DEVS</span>
              <span className="text-sm sm:text-lg text-gray-400 ml-1 sm:ml-2">Member Card</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link to="/events" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors hidden sm:block">
              Events
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Logout</span>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-120px)] py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full px-4 sm:px-6 py-2 border border-purple-500/20 mb-4 sm:mb-6">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
              <span className="text-xs sm:text-sm text-purple-300 font-medium">Digital Identity</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 font-techie">
              Your <span className="text-gradient">Member Card</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Your digital identity in the DEVS community. Access events, verify membership, and connect with fellow developers.
            </p>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-1 bg-gradient-cyber mx-auto rounded-full"
            ></motion.div>
          </motion.div>

          {/* Card and QR Section */}
          <div className="flex justify-center px-4">
            <div className="w-full max-w-4xl">
              {/* Member Card */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className={`relative mx-auto bg-gradient-to-br ${getRoleColor(user.role)} p-1 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300`}>
                  {/* Card Inner Content */}
                  <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl p-8 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl"></div>
                    
                    {/* Card Header */}
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                      <div className="flex items-center gap-2 sm:gap-3">
                     
                        <div>
                          <h1 className="text-xl sm:text-2xl font-bold font-techie text-white">DEVS SOCIETY</h1>
                          <p className="text-cyan-300 text-xs sm:text-sm">Digital Member Card</p>
                        </div>
                      </div>
                      
                      <div className={`px-3 sm:px-4 py-2 rounded-full border ${getRoleBadgeColor(user.role)} text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 justify-center sm:justify-start`}>
                        {getRoleIcon(user.role)}
                        <span className="hidden sm:inline">{getRoleDisplayName(user.role)}</span>
                        <span className="sm:hidden">{user.role.replace('-', ' ').toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Member Information Grid */}
                    <div className="relative z-10 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
                      {/* Left Side - Member Details */}
                      <div className="space-y-6">
                        {/* Profile Photo */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Photo
                          </h3>
                          
                          <div className="flex justify-center">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gradient-cyber bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
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
                                <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Member Information
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                <span className="font-medium text-sm sm:text-base">Member ID:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0">{user.memberId}</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                <span className="font-medium text-sm sm:text-base">Full Name:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0">{user.fullName}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                <span className="font-medium text-sm sm:text-base">Email:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0 break-all">{user.email}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                                <span className="font-medium text-sm sm:text-base">Phone:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0">{user.phone || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Academic Info */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Academic Information
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                                <span className="font-medium text-sm sm:text-base">College:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0">{user.college}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                                <span className="font-medium text-sm sm:text-base">Batch Year:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0">{user.batchYear}</span>
                            </div>
                          </div>
                        </div>

                        {/* Membership Info */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Membership Details
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                <span className="font-medium text-sm sm:text-base">Member Since:</span>
                              </div>
                              <span className="text-white text-sm sm:text-base ml-6 sm:ml-0">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-300">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                <span className="font-medium text-sm sm:text-base">Status:</span>
                              </div>
                              <span className="text-green-400 text-sm sm:text-base ml-6 sm:ml-0">Active Member</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Additional Details & QR Info */}
                      <div className="space-y-6">
                        {/* QR Code Display */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Verification QR Code
                          </h3>
                          
                          <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                            <div className="text-center">
                              <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                                {isLoadingEvents ? (
                                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 flex items-center justify-center">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                ) : qrCodeUrl ? (
                                  <img 
                                    src={qrCodeUrl} 
                                    alt="Member QR Code" 
                                    className="w-32 h-32 sm:w-40 sm:h-40"
                                  />
                                ) : (
                                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 flex items-center justify-center">
                                    <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-cyan-300 text-sm font-medium mb-2">Primary Verification QR</p>
                              <p className="text-gray-400 text-xs">
                                {isLoadingEvents 
                                  ? 'Loading event registrations...' 
                                  : `Contains member info and ${eventRegistrations.length} event registration${eventRegistrations.length !== 1 ? 's' : ''}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Quick Actions
                          </h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Link to="/events">
                              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                View Events
                              </Button>
                            </Link>
                            
                            <Link to="/portal">
                              <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20 text-sm">
                                <User className="h-4 w-4 mr-2" />
                                Dashboard
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="relative z-10 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs text-gray-400">
                      <div className="text-center sm:text-left">
                        <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p>DEVS Technical Society</p>
                        <p className="text-xs">portal.devs-society.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Always Available Section - Moved to bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 sm:mt-12"
          >
            <div className="backdrop-glass rounded-xl p-4 sm:p-6 max-w-md mx-auto border border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium text-sm sm:text-base">Always Available</span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed text-center sm:text-left">
                Your digital member card is always accessible on your device. 
                The QR code serves as your primary verification method for all events and activities.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 