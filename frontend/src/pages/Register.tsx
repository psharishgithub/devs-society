import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { ParticlesComponent } from '../components/particles'
import { Code, Upload, User, Mail, Phone, Building, Calendar, Crown, ArrowRight, UserPlus, Sparkles, AlertCircle, CheckCircle, Camera, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI, publicAPI } from '../services/api'
import type { RegisterData } from '../services/api'

export function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    batchYear: '',
    role: '',
    photo: null as File | null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [colleges, setColleges] = useState<Array<{ value: string; label: string; batchYears: Array<{ value: string; label: string }> }>>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { login } = useAuth()
  const navigate = useNavigate()
  const totalSteps = 3

  const roleOptions = [
    { value: 'regular-member', label: 'Regular Member', description: 'Standard membership with access to events and resources' },
    { value: 'special-member', label: 'Special Member', description: 'Enhanced membership with additional privileges' },
    { value: 'board-member', label: 'Board Member', description: 'Leadership role with administrative responsibilities' },
    { value: 'core-member', label: 'Core Member', description: 'Senior leadership with full access and permissions' }
  ]

  useEffect(() => {
    // Load colleges with their available batch years
    const loadColleges = async () => {
      try {
        console.log('Loading colleges...')
        
        // Try to fetch colleges directly from the backend
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api'
        const response = await fetch(`${API_BASE}/public/colleges`)
        const data = await response.json()
        
        console.log('API Response:', data)
        
        if (data.success && data.colleges) {
          const collegeOptions = data.colleges.map((college: any) => ({
            value: college.id,
            label: college.name,
            batchYears: college.currentTenureHeads?.map((tenure: any) => ({
              value: tenure.batchYear.toString(),
              label: `Batch ${tenure.batchYear} (${tenure.adminName})`
            })) || []
          }))
          setColleges(collegeOptions)
          console.log('Colleges loaded successfully:', collegeOptions)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.error('Error loading colleges:', error)
        // Fallback to default options if API fails
        console.log('Using fallback college options')
        setColleges([
          { value: 'rajalakshmi-engineering', label: 'Rajalakshmi Engineering College', batchYears: [
            { value: '2024', label: 'Batch 2024 (Hursun)' },
            { value: '2025', label: 'Batch 2025 (Gokul)' }
          ]},
          { value: 'rajalakshmi-institute', label: 'Rajalakshmi Institute of Technology', batchYears: [
            { value: '2024', label: 'Batch 2024' }
          ]},
          { value: 'other', label: 'Other College', batchYears: [
            { value: '2024', label: 'Batch 2024' }
          ]}
        ])
      }
    }
    
    loadColleges()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Reset batch year when college changes
    if (name === 'college') {
      setFormData(prev => ({
        ...prev,
        batchYear: ''
      }))
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    // Clear general error
    if (error) setError('')
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({ ...prev, photo: 'Photo must be less than 5MB' }))
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ ...prev, photo: 'Please select a valid image file' }))
        return
      }
      
      setFormData(prev => ({ ...prev, photo: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Clear photo error
      if (validationErrors.photo) {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.photo
          return newErrors
        })
      }
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }))
    setPhotoPreview(null)
    // Reset file input
    const fileInput = document.getElementById('photo') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) errors.fullName = 'Full name is required'
        if (!formData.email.trim()) errors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Please enter a valid email'
        if (!formData.phone.trim()) errors.phone = 'Phone number is required'
        else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) errors.phone = 'Please enter a valid phone number'
        break
      case 2:
        if (!formData.college) errors.college = 'Please select your college'
        if (!formData.batchYear) errors.batchYear = 'Please select your batch year'
        break
      case 3:
        if (!formData.role) errors.role = 'Please select your role'
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const registerData: RegisterData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        college: formData.college,
        batchYear: formData.batchYear,
        role: formData.role,
        photo: formData.photo || undefined
      }
      
      const response = await authAPI.register(registerData)
      
      if (response.success) {
        setSuccess(true)
        login(response.user, response.token)
        
        // Show success message briefly, then redirect
        setTimeout(() => {
          navigate('/portal')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.status === 409) {
        setError('An account with this email already exists. Please use a different email or login.')
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data
        const errorMessage = errorData?.message || 'Please check your information and try again.'
        
        // Handle specific field errors
        if (errorData?.field === 'batchYear') {
          setValidationErrors(prev => ({
            ...prev,
            batchYear: errorMessage
          }))
          // Go back to step 2 to show the error
          setCurrentStep(2)
        } else if (errorData?.field === 'college') {
          setValidationErrors(prev => ({
            ...prev,
            college: errorMessage
          }))
          // Go back to step 2 to show the error
          setCurrentStep(2)
        } else {
          setError(errorMessage)
        }
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <User className="h-5 w-5" />
      case 2:
        return <Building className="h-5 w-5" />
      case 3:
        return <Crown className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return 'Personal Information'
      case 2:
        return 'College & Batch'
      case 3:
        return 'Role & Photo'
      default:
        return 'Personal Information'
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
        <ParticlesComponent className="fixed inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/20 via-black to-cyan-950/20"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center"
        >
          <div className="backdrop-glass rounded-2xl p-12 border border-green-400/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-400" />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-green-400 mb-4">Welcome to DEVS!</h1>
            <p className="text-gray-300 mb-6">
              Your registration was successful. Redirecting to your portal...
            </p>
            
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <ParticlesComponent className="fixed inset-0" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-cyan-950/20"></div>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse-glow">
              <Code className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold font-techie">DEVS</span>
              <span className="text-lg text-gray-400 ml-2">Portal</span>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <Link to="/login" className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">
              Login
            </Link>
            <Link to="/register">
              <Button variant="gradient" size="sm">
                <UserPlus className="h-4 w-4" />
                Register
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="w-full max-w-2xl"
        >
          <div className="backdrop-glass rounded-2xl p-8 border border-gradient-cyber shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-cyber"></div>
            <div className="absolute -top-px -left-px w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-xl"></div>
            <div className="absolute -bottom-px -right-px w-32 h-32 bg-gradient-to-tl from-cyan-400/20 to-transparent rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full px-6 py-2 border border-purple-500/20 mb-6">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-purple-300 font-medium">Join the Community</span>
                </div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-4xl font-bold mb-3 font-techie"
                >
                  <span className="text-gradient">Join DEVS</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-gray-300 text-lg"
                >
                  {getStepTitle(currentStep)} - Step {currentStep} of {totalSteps}
                </motion.p>
                
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="h-1 bg-gradient-cyber mx-auto mt-4 rounded-full"
                ></motion.div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      step <= currentStep 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 border-transparent text-white' 
                        : 'border-gray-600 text-gray-400'
                    }`}>
                      {step < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        getStepIcon(step)
                      )}
                    </div>
                    {step < totalSteps && (
                      <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                        step < currentStep ? 'bg-gradient-cyber' : 'bg-gray-600'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>

              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
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
                
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="pl-14 form-field"
                          />
                        </div>
                        {validationErrors.fullName && (
                          <p className="text-red-400 text-xs mt-1">{validationErrors.fullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="pl-14 form-field"
                          />
                        </div>
                        {validationErrors.email && (
                          <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="pl-14 form-field"
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: College & Batch */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label htmlFor="college" className="block text-sm font-medium text-gray-300 mb-2">
                        College *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="college"
                          name="college"
                          value={formData.college}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all"
                          style={{ borderRadius: '0.5rem' }}
                        >
                          <option value="">Select your college</option>
                          {colleges.map((college) => (
                            <option key={college.value} value={college.value}>
                              {college.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.college && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.college}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="batchYear" className="block text-sm font-medium text-gray-300 mb-2">
                        Batch Year *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="batchYear"
                          name="batchYear"
                          value={formData.batchYear}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.college || !colleges.find(college => college.value === formData.college)?.batchYears.length}
                          className="w-full pl-14 pr-4 py-3 rounded-lg border border-gray-700 bg-black/30 backdrop-blur-sm text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderRadius: '0.5rem' }}
                        >
                          <option value="">
                            {!formData.college 
                              ? 'Select your batch' 
                              : !colleges.find(college => college.value === formData.college)?.batchYears.length
                              ? 'No batch years available for this college'
                              : 'Select your batch'
                            }
                          </option>
                          {colleges.find(college => college.value === formData.college)?.batchYears.map((batch) => (
                            <option key={batch.value} value={batch.value}>
                              {batch.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {validationErrors.batchYear && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.batchYear}
                        </p>
                      )}
                      {formData.college && !colleges.find(college => college.value === formData.college)?.batchYears.length && (
                        <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          This college doesn't have any active admins. Please contact the super admin.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Role & Photo */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                        Role *
                      </label>
                      <div className="space-y-3">
                        {roleOptions.map((role) => (
                          <div
                            key={role.value}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              formData.role === role.value
                                ? 'border-cyan-400 bg-cyan-500/10'
                                : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                            }`}
                            onClick={() => handleInputChange({ target: { name: 'role', value: role.value } } as any)}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name="role"
                                value={role.value}
                                checked={formData.role === role.value}
                                onChange={handleInputChange}
                                className="text-cyan-400 focus:ring-cyan-400"
                              />
                              <div className="ml-3">
                                <div className="text-white font-medium">{role.label}</div>
                                <div className="text-gray-400 text-sm">{role.description}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {validationErrors.role && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.role}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="photo" className="block text-sm font-medium text-gray-300 mb-2">
                        Profile Photo (Optional)
                      </label>
                      
                      {!photoPreview ? (
                        <div className="relative">
                          <input
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="photo"
                            className="flex items-center justify-center w-full p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors"
                          >
                            <div className="text-center">
                              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-300 text-sm">Click to upload a photo</p>
                              <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 5MB</p>
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-32 h-32 rounded-lg overflow-hidden mx-auto border border-gray-600">
                            <img 
                              src={photoPreview} 
                              alt="Profile preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="text-center mt-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById('photo')?.click()}
                              className="text-cyan-400 text-sm hover:text-cyan-300 underline"
                            >
                              Change photo
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {validationErrors.photo && (
                        <p className="text-red-400 text-xs mt-1">{validationErrors.photo}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between pt-6">
                  {currentStep > 1 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Previous
                    </Button>
                  ) : <div></div>}
                  
                  {currentStep < totalSteps ? (
                    <Button 
                      type="button" 
                      variant="gradient" 
                      onClick={nextStep}
                      className="ml-auto group"
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      variant="gradient" 
                      className="ml-auto h-12 px-8 font-medium group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Create Account
                          <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </div>
                      )}
                    </Button>
                  )}
                </div>
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
                    <span className="px-4 bg-black/50 text-gray-400">Already a member?</span>
                  </div>
                </div>
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1 mt-4">
                  Sign In
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{ y: [-8, 8, -8], rotate: [0, 3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -left-4 w-10 h-10 bg-purple-400/20 rounded-full blur-sm"
          ></motion.div>
          <motion.div
            animate={{ y: [8, -8, 8], rotate: [0, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-4 -right-4 w-8 h-8 bg-cyan-400/20 rounded-full blur-sm"
          ></motion.div>
        </motion.div>
      </div>
    </div>
  )
} 