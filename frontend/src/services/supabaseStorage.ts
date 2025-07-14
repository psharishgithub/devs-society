import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export const storageAPI = {
  // Upload profile photo to Supabase storage
  uploadProfilePhoto: async (file: File, userId: string): Promise<UploadResult> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'File must be an image'
        }
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size must be less than 5MB'
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `profile-${userId}-${Date.now()}.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
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

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

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
  updateProfilePhoto: async (file: File, userId: string, oldPhotoUrl?: string): Promise<UploadResult> => {
    try {
      // Delete old photo if it exists
      if (oldPhotoUrl) {
        await storageAPI.deleteProfilePhoto(oldPhotoUrl)
      }

      // Upload new photo
      return await storageAPI.uploadProfilePhoto(file, userId)
    } catch (error) {
      console.error('Profile photo update error:', error)
      return {
        success: false,
        error: 'Failed to update profile photo'
      }
    }
  }
}

export default storageAPI 