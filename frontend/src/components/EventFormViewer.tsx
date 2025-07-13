import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Send
} from 'lucide-react'
import { eventFormAPI } from '../services/eventFormApi'
import type { EventForm, FormField } from '../services/eventFormApi'

interface EventFormViewerProps {
  eventId: string
  eventTitle: string
  onSubmit: (responses: Record<string, any>) => void
  onClose: () => void
}

export const EventFormViewer: React.FC<EventFormViewerProps> = ({
  eventId,
  eventTitle,
  onSubmit,
  onClose
}) => {
  const [form, setForm] = useState<EventForm | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasExistingSubmission, setHasExistingSubmission] = useState(false)

  useEffect(() => {
    loadForm()
    checkExistingSubmission()
  }, [eventId])

  const loadForm = async () => {
    try {
      const response = await eventFormAPI.getEventForm(eventId)
      if (response.success && response.form) {
        setForm(response.form)
        // Initialize responses with default values
        const initialResponses: Record<string, any> = {}
        response.form.fields.forEach(field => {
          if (field.type === 'checkbox') {
            initialResponses[field.id] = false
          } else {
            initialResponses[field.id] = ''
          }
        })
        setResponses(initialResponses)
      }
    } catch (error) {
      console.error('Error loading form:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkExistingSubmission = async () => {
    try {
      const response = await eventFormAPI.getUserFormSubmission(eventId)
      if (response.success && response.submission) {
        setHasExistingSubmission(true)
        setResponses(response.submission.responses)
      }
    } catch (error) {
      console.error('Error checking existing submission:', error)
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    form?.fields.forEach(field => {
      if (field.required) {
        const value = responses[field.id]
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.id] = `${field.label} is required`
        }
      }
      
      // Additional validation based on field type
      const value = responses[field.id]
      if (value && typeof value === 'string' && value.trim()) {
        if (field.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
          newErrors[field.id] = 'Please enter a valid email address'
        }
        if (field.type === 'phone' && !/^\+?[\d\s-()]+$/.test(value)) {
          newErrors[field.id] = 'Please enter a valid phone number'
        }
        if (field.validation) {
          if (field.validation.minLength && value.length < field.validation.minLength) {
            newErrors[field.id] = `Minimum ${field.validation.minLength} characters required`
          }
          if (field.validation.maxLength && value.length > field.validation.maxLength) {
            newErrors[field.id] = `Maximum ${field.validation.maxLength} characters allowed`
          }
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(responses)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = responses[field.id] || ''
    const error = errors[field.id]
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <Input
            type={field.type === 'number' ? 'number' : field.type === 'phone' ? 'tel' : field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-500' : ''}
            disabled={hasExistingSubmission}
          />
        )
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={error ? 'border-red-500' : ''}
            disabled={hasExistingSubmission}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-700'} bg-black/30 backdrop-blur-sm text-white focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 disabled:opacity-50`}
            disabled={hasExistingSubmission}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option} className="bg-gray-900">
                {option}
              </option>
            ))}
          </select>
        )
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-cyan-400 focus:ring-cyan-400"
              disabled={hasExistingSubmission}
            />
            <span className="text-sm text-gray-300">{field.placeholder || 'Check this box'}</span>
          </label>
        )
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full h-24 px-4 py-3 rounded-lg border ${error ? 'border-red-500' : 'border-gray-700'} bg-black/30 backdrop-blur-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 resize-none disabled:opacity-50`}
            disabled={hasExistingSubmission}
          />
        )
      
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading registration form...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Registration Form</h3>
          <p className="text-gray-400 mb-4">This event doesn't have a custom registration form.</p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{form.title}</h2>
              <p className="text-gray-400">{eventTitle}</p>
            </div>
          </div>
          {form.description && (
            <p className="text-gray-300 text-sm">{form.description}</p>
          )}
          {hasExistingSubmission && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Form Already Submitted</span>
              </div>
              <p className="text-sm text-green-300 mt-1">You have already submitted this form. You can view your responses below.</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-red-400 text-xs mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            {!hasExistingSubmission ? (
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Submit Registration
                  </div>
                )}
              </Button>
            ) : (
              <div className="flex-1 text-center py-3 text-green-400 font-medium">
                Form submitted successfully
              </div>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default EventFormViewer