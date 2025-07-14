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
    if (!user || !shareSupported) return

    try {
      await navigator.share({
        title: `${user.fullName} - DEVS Society Member`,
        text: `Check out my DEVS Society membership card!`,
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
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={copyMemberId}
              variant="outline" 
              size="sm" 
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </>
              )}
            </Button>
            
            <Button 
              onClick={downloadCard}
              disabled={isDownloading}
              variant="outline"
              size="sm"
              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            
            {shareSupported && (
              <Button
                onClick={shareCard}
                variant="outline"
                size="sm"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -10 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="perspective-1000"
          >
            <div className={`relative mx-auto max-w-4xl bg-gradient-to-br ${getRoleColor(user.role)} p-1 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300`}>
              {/* Card Inner Content */}
              <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl"></div>
                
                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
                      <Code className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold font-techie text-white">DEVS SOCIETY</h1>
                      <p className="text-cyan-300 text-sm">Digital Member Card</p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full border ${getRoleBadgeColor(user.role)} text-sm font-medium flex items-center gap-2`}>
                    {getRoleIcon(user.role)}
                    {getRoleDisplayName(user.role)}
                  </div>
                </div>

                {/* Member Information Grid */}
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side - Member Details */}
                  <div className="space-y-6">
                    {/* Profile Photo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Photo
                      </h3>
                      
                      <div className="flex justify-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-cyber bg-gradient-to-br from-purple-500/20 to-cyan-500/20">
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
                            <User className="h-16 w-16 text-gray-400" />
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
                      <div className="flex items-center gap-3 text-gray-300">
                        <Hash className="h-5 w-5 text-cyan-400" />
                          <span className="font-medium">Member ID:</span>
                          <span className="text-white">{user.memberId}</span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-gray-300">
                          <User className="h-5 w-5 text-cyan-400" />
                          <span className="font-medium">Full Name:</span>
                          <span className="text-white">{user.fullName}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                        <Mail className="h-5 w-5 text-cyan-400" />
                          <span className="font-medium">Email:</span>
                          <span className="text-white">{user.email}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="h-5 w-5 text-cyan-400" />
                          <span className="font-medium">Phone:</span>
                          <span className="text-white">{user.phone || 'Not provided'}</span>
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
                      <div className="flex items-center gap-3 text-gray-300">
                          <Building className="h-5 w-5 text-purple-400" />
                          <span className="font-medium">College:</span>
                          <span className="text-white">{user.college}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                          <CalendarIcon className="h-5 w-5 text-purple-400" />
                          <span className="font-medium">Batch Year:</span>
                          <span className="text-white">{user.batchYear}</span>
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
                        <div className="flex items-center gap-3 text-gray-300">
                          <Clock className="h-5 w-5 text-green-400" />
                          <span className="font-medium">Member Since:</span>
                          <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-300">
                          <Shield className="h-5 w-5 text-green-400" />
                          <span className="font-medium">Status:</span>
                          <span className="text-green-400">Active Member</span>
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
                               <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                                 <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                               </div>
                             ) : qrCodeUrl ? (
                        <img 
                          src={qrCodeUrl} 
                          alt="Member QR Code" 
                          className="w-40 h-40"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-gray-200 flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-gray-400" />
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
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Link to="/events">
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            View Events
                          </Button>
                        </Link>
                        
                        <Link to="/portal">
                          <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20">
                            <User className="h-4 w-4 mr-2" />
                            Dashboard
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 mt-8 pt-6 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
                  <div>
                    <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p>DEVS Technical Society</p>
                    <p>portal.devs-society.com</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-12"
          >
            <div className="backdrop-glass rounded-xl p-6 max-w-md mx-auto border border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Smartphone className="h-5 w-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Always Available</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
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