import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Define database types based on our schema
export interface Database {
  public: {
    Tables: {
      colleges: {
        Row: {
          id: string
          name: string
          code: string
          location: string
          address: string
          contact_email: string
          contact_phone: string
          website: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          location: string
          address: string
          contact_email: string
          contact_phone: string
          website?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          location?: string
          address?: string
          contact_email?: string
          contact_phone?: string
          website?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          username: string
          email: string
          password_hash: string
          full_name: string
          role: 'super-admin' | 'admin'
          assigned_college_id: string | null
          batch_year: number | null
          permissions: string[]
          tenure_start_date: string | null
          tenure_end_date: string | null
          tenure_is_active: boolean
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          password_hash: string
          full_name: string
          role?: 'super-admin' | 'admin'
          assigned_college_id?: string | null
          batch_year?: number | null
          permissions?: string[]
          tenure_start_date?: string | null
          tenure_end_date?: string | null
          tenure_is_active?: boolean
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password_hash?: string
          full_name?: string
          role?: 'super-admin' | 'admin'
          assigned_college_id?: string | null
          batch_year?: number | null
          permissions?: string[]
          tenure_start_date?: string | null
          tenure_end_date?: string | null
          tenure_is_active?: boolean
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          college: string
          college_ref_id: string | null
          batch_year: string
          role: 'core-member' | 'board-member' | 'special-member' | 'other'
          photo_url: string | null
          member_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          college: string
          college_ref_id?: string | null
          batch_year: string
          role?: 'core-member' | 'board-member' | 'special-member' | 'other'
          photo_url?: string | null
          member_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          college?: string
          college_ref_id?: string | null
          batch_year?: string
          role?: 'core-member' | 'board-member' | 'special-member' | 'other'
          photo_url?: string | null
          member_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_date: string
          event_time: string
          location: string
          event_type: 'college-specific' | 'open-to-all'
          target_college_id: string | null
          max_attendees: number
          category: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other'
          organizer_admin_id: string
          organizer_name: string
          organizer_contact: string
          requirements: string[]
          prizes: string[]
          registration_deadline: string
          is_paid: boolean
          price: number
          admin_pricing: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_date: string
          event_time: string
          location: string
          event_type?: 'college-specific' | 'open-to-all'
          target_college_id?: string | null
          max_attendees: number
          category?: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other'
          organizer_admin_id: string
          organizer_name: string
          organizer_contact: string
          requirements?: string[]
          prizes?: string[]
          registration_deadline: string
          is_paid?: boolean
          price?: number
          admin_pricing?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_date?: string
          event_time?: string
          location?: string
          event_type?: 'college-specific' | 'open-to-all'
          target_college_id?: string | null
          max_attendees?: number
          category?: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other'
          organizer_admin_id?: string
          organizer_name?: string
          organizer_contact?: string
          requirements?: string[]
          prizes?: string[]
          registration_deadline?: string
          is_paid?: boolean
          price?: number
          admin_pricing?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registered_at: string
          status: 'confirmed' | 'waitlisted' | 'cancelled'
          created_at: string
          updated_at: string
          qr_code_data: any
          check_in_code: string | null
          qr_code_url: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          payment_verified: boolean | null
          payment_id: string | null
          payment_amount: number | null
          payment_currency: string | null
          payment_timestamp: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registered_at?: string
          status?: 'confirmed' | 'waitlisted' | 'cancelled'
          created_at?: string
          updated_at?: string
          qr_code_data?: any
          check_in_code?: string | null
          qr_code_url?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          payment_verified?: boolean | null
          payment_id?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_timestamp?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registered_at?: string
          status?: 'confirmed' | 'waitlisted' | 'cancelled'
          created_at?: string
          updated_at?: string
          qr_code_data?: any
          check_in_code?: string | null
          qr_code_url?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          payment_verified?: boolean | null
          payment_id?: string | null
          payment_amount?: number | null
          payment_currency?: string | null
          payment_timestamp?: string | null
        }
      }
      college_tenure_heads: {
        Row: {
          id: string
          college_id: string
          admin_id: string
          batch_year: number | null
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          college_id: string
          admin_id: string
          batch_year?: number | null
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          college_id?: string
          admin_id?: string
          batch_year?: number | null
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_forms: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string | null
          fields: any
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description?: string | null
          fields?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string | null
          fields?: any
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_form_responses: {
        Row: {
          id: string
          form_id: string
          user_id: string
          responses: any
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          user_id: string
          responses?: any
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          user_id?: string
          responses?: any
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'core-member' | 'board-member' | 'special-member' | 'other'
      admin_role: 'super-admin' | 'admin'
      event_type: 'college-specific' | 'open-to-all'
      event_category: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other'
      registration_status: 'confirmed' | 'waitlisted' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

let supabase: SupabaseClient<Database> | null = null

export const initializeSupabase = (): SupabaseClient<Database> => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY')
    }

    console.log('🔗 Initializing Supabase connection...')
    console.log('📡 Supabase URL:', supabaseUrl)
    console.log('🔑 Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'NOT SET')

    supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false // Disable session persistence for server-side usage
      },
      global: {
        headers: {
          'User-Agent': 'DEVS-Society-Backend/1.0'
        }
      }
    })
  }

  return supabase
}

export const getSupabase = (): SupabaseClient<Database> => {
  if (!supabase) {
    // Auto-initialize if not already done
    return initializeSupabase()
  }
  return supabase
}

// Helper function for error handling
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`❌ Supabase error during ${operation}:`, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    stack: error.stack
  })
  
  // Check if it's a network error
  if (error.message?.includes('fetch failed') || error.message?.includes('network')) {
    console.error('🌐 Network connectivity issue detected. This might be due to:')
    console.error('   - Internet connection problems')
    console.error('   - Firewall blocking the connection')
    console.error('   - Supabase service being down')
    console.error('   - ngrok tunnel issues')
  }
  
  throw new Error(`Database operation failed: ${operation}`)
}

// Connection test function with retry logic
export const testConnection = async (retries: number = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Testing Supabase connection (attempt ${attempt}/${retries})...`)
      
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('colleges')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error(`❌ Supabase connection test failed (attempt ${attempt}):`, error)
        if (attempt < retries) {
          console.log(`⏳ Retrying in 2 seconds...`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }
        return false
      }
      
      console.log('✅ Supabase connection successful!')
      return true
    } catch (error) {
      console.error(`❌ Supabase connection test error (attempt ${attempt}):`, error)
      if (attempt < retries) {
        console.log(`⏳ Retrying in 2 seconds...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        continue
      }
      return false
    }
  }
  
  return false
}

// Enhanced connection test for debugging
export const debugConnection = async (): Promise<void> => {
  console.log('🔧 Debugging Supabase connection...')
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  console.log('📋 Environment check:')
  console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('   SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables')
    return
  }
  
  try {
    const isConnected = await testConnection(1)
    if (isConnected) {
      console.log('✅ Connection test passed')
    } else {
      console.log('❌ Connection test failed')
    }
  } catch (error) {
    console.error('❌ Connection test error:', error)
  }
}

export default getSupabase 