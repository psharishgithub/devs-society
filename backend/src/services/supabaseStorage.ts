import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export const storageService = {
  // Upload profile photo to Supabase storage
  uploadProfilePhoto: async (fileBuffer: Buffer, fileName: string, userId: string): Promise<UploadResult> => {
    try {
      console.log('Starting upload for user:', userId)
      console.log('File name:', fileName)
      console.log('File buffer size:', fileBuffer.length, 'bytes')
      
      // Validate file type by checking file extension
      const fileExt = fileName.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      
      console.log('File extension:', fileExt)
      console.log('Allowed extensions:', allowedExtensions)
      
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        console.error('Invalid file type:', fileExt)
        return {
          success: false,
          error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'
        }
      }

      // Validate file size (max 5MB)
      if (fileBuffer.length > 5 * 1024 * 1024) {
        console.error('File too large:', fileBuffer.length, 'bytes')
        return {
          success: false,
          error: 'File size must be less than 5MB'
        }
      }

      // Generate unique filename
      const uniqueFileName = `profile-${userId}-${Date.now()}.${fileExt}`
      console.log('Generated filename:', uniqueFileName)

      console.log('Supabase URL:', supabaseUrl)
      console.log('Service role key configured:', !!supabaseServiceKey)

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(uniqueFileName, fileBuffer, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        return {
          success: false,
          error: error.message || 'Failed to upload image'
        }
      }

      console.log('Upload successful, data:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(uniqueFileName)

      console.log('Public URL data:', urlData)

      return {
        success: true,
        url: urlData.publicUrl
      }
    } catch (error) {
      console.error('Profile photo upload error:', error)
      return {
        success: false,
        error: 'Failed to upload profile photo'
      }
    }
  },

  // Delete profile photo from Supabase storage
  deleteProfilePhoto: async (photoUrl: string): Promise<UploadResult> => {
    try {
      // Extract filename from URL
      const urlParts = photoUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([fileName])

      if (error) {
        console.error('Supabase delete error:', error)
        return {
          success: false,
          error: error.message || 'Failed to delete image'
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Profile photo delete error:', error)
      return {
        success: false,
        error: 'Failed to delete profile photo'
      }
    }
  },

  // Update profile photo (delete old one and upload new one)
  updateProfilePhoto: async (fileBuffer: Buffer, fileName: string, userId: string, oldPhotoUrl?: string): Promise<UploadResult> => {
    try {
      // Delete old photo if it exists
      if (oldPhotoUrl) {
        await storageService.deleteProfilePhoto(oldPhotoUrl)
      }

      // Upload new photo
      return await storageService.uploadProfilePhoto(fileBuffer, fileName, userId)
    } catch (error) {
      console.error('Profile photo update error:', error)
      return {
        success: false,
        error: 'Failed to update profile photo'
      }
    }
  }
}

export default storageService 