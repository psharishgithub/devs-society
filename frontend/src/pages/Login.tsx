import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ParticlesComponent } from '../components/particles'
import { Code, Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'

export function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '' // For future password implementation
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await authAPI.login(formData.email)
      
      if (response.success) {
        setSuccess('Login successful! Redirecting...')
        login(response.user, response.token)
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberEmail', formData.email)
        } else {
          localStorage.removeItem('rememberEmail')
        }
        
        // Small delay to show success message
        setTimeout(() => {
          navigate('/portal')
        }, 1500)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.status === 404) {
        setError('No account found with this email address. Please register first.')
      } else if (error.response?.status === 401) {
        setError('Invalid credentials. Please check your email and try again.')
      } else if (error.response?.status === 403) {
        setError('Your account has been suspended. Please contact support.')
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load remembered email on component mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail')
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  })

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticlesComponent className="fixed inset-0" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-black to-purple-950/20"></div>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <div className="flex flex-col items-start sm:items-start">
            <img 
              src="/images/DEVS_White.png" 
              alt="DEVS" 
              className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto mb-1 sm:mb-2"
            />
            
            </div>
            <span className="text-sm sm:text-lg text-gray-400 ml-1 sm:ml-2">Portal</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link to="/login" className="text-xs sm:text-sm text-cyan-400 font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-cyan-400/30 bg-cyan-950/20">
              Login
            </Link>
            <Link to="/register">
              <Button variant="gradient" size="sm" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                Register
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="w-full max-w-lg"
        >
          <div className="backdrop-glass rounded-2xl p-4 sm:p-6 md:p-8 border border-gradient-cyber shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cyber"></div>
            <div className="absolute -top-px -left-px w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-full blur-xl"></div>
            <div className="absolute -bottom-px -right-px w-20 h-20 bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="flex flex-col items-center justify-center mb-8">
                  <img 
                    src="/images/devslogo.png" 
                    alt="DEVS" 
                    className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-32 w-auto mb-2 sm:mb-4"
                  />
                  {/* <span className="text-xs sm:text-base font-techie tracking-widest text-gray-300 mt-1" style={{letterSpacing: '0.2em'}}>
                    CODE. COFFEE. REPEAT ...
                  </span> */}
                </div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 font-techie"
                >
                  <span className="text-gradient">Welcome Back</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-gray-300 text-sm sm:text-base md:text-lg"
                >
                  Sign in to access your DEVS portal
                </motion.p>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 60 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-1 bg-gradient-cyber mx-auto mt-4 rounded-full"
                ></motion.div>
              </div>

              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onSubmit={handleSubmit} 
                className="space-y-4 sm:space-y-6"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400"
                  >
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{success}</span>
                  </motion.div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      className="pl-10 py-3 rounded-lg border border-gray-600 bg-black/30 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                    />
                  </div>
                </div>

                {/* Remember me checkbox */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-cyan-400 bg-black border-gray-600 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember my email
                  </label>
                </div>

                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Access Portal
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </motion.form>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/50 text-gray-400">New to DEVS?</span>
                  </div>
                </div>
                <p className="text-gray-400 mt-4 text-sm">
                  Join our tech community and get your digital membership
                </p>
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1 mt-2">
                  Create Account
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>

              {/* Support link */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="mt-6 text-center"
              >
                <p className="text-xs text-gray-500">
                  Having trouble? Contact{' '}
                  <a href="mailto:contact@devs-society.com" className="text-cyan-400 hover:text-cyan-300 underline">
                    contact@devs-society.com
                  </a>
                </p>
              </motion.div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [-8, 8, -8], rotate: [0, 3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -left-4 w-10 h-10 bg-cyan-400/20 rounded-full blur-sm"
          ></motion.div>
          <motion.div
            animate={{ y: [8, -8, 8], rotate: [0, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -right-4 w-8 h-8 bg-purple-400/20 rounded-full blur-sm"
          ></motion.div>
          <motion.div
            animate={{ x: [-6, 6, -6], rotate: [0, -2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 -right-6 w-6 h-6 bg-green-400/20 rounded-full blur-sm"
          ></motion.div>
        </motion.div>
      </div>
    </div>
  )
} 