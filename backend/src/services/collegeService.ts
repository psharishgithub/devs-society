import { getSupabase, handleSupabaseError, Database } from '../database/supabase'

export interface ICollege {
  id: string
  name: string
  code: string
  location: string
  address: string
  contactInfo: {
    email: string
    phone: string
    website?: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
  currentTenureHeads?: Array<{
    id: string
    adminId: string
    adminName: string
    adminEmail: string
    batchYear: number
    startDate: string
    isActive: boolean
  }> | null
}

export interface CreateCollegeData {
  name: string
  code: string
  location: string
  address: string
  contactInfo: {
    email: string
    phone: string
    website?: string
  }
}

export interface UpdateCollegeData {
  name?: string
  code?: string
  location?: string
  address?: string
  contactInfo?: {
    email?: string
    phone?: string
    website?: string
  }
  isActive?: boolean
}

export interface ITenureHead {
  id: string
  collegeId: string
  adminId: string
  startDate: string
  endDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

class CollegeService {
  private supabase = getSupabase()

  // Create a new college
  async createCollege(collegeData: CreateCollegeData): Promise<ICollege> {
    try {
      const { data, error } = await this.supabase
        .from('colleges')
        .insert({
          name: collegeData.name,
          code: collegeData.code.toUpperCase(),
          location: collegeData.location,
          address: collegeData.address,
          contact_email: collegeData.contactInfo.email.toLowerCase(),
          contact_phone: collegeData.contactInfo.phone,
          website: collegeData.contactInfo.website || null,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'createCollege')
      }

      return this.mapDbCollegeToCollege(data)
    } catch (error) {
      console.error('Error creating college:', error)
      throw error
    }
  }

  // Find college by ID
  async findById(id: string): Promise<ICollege | null> {
    try {
      const { data, error } = await this.supabase
        .from('colleges')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'findById')
      }

      return this.mapDbCollegeToCollege(data)
    } catch (error) {
      console.error('Error finding college by ID:', error)
      throw error
    }
  }

  // Find college by code
  async findByCode(code: string): Promise<ICollege | null> {
    try {
      const { data, error } = await this.supabase
        .from('colleges')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'findByCode')
      }

      return this.mapDbCollegeToCollege(data)
    } catch (error) {
      console.error('Error finding college by code:', error)
      throw error
    }
  }

  // Find college by name
  async findByName(name: string): Promise<ICollege | null> {
    try {
      const { data, error } = await this.supabase
        .from('colleges')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'findByName')
      }

      return this.mapDbCollegeToCollege(data)
    } catch (error) {
      console.error('Error finding college by name:', error)
      throw error
    }
  }

  // Update college
  async updateCollege(id: string, updateData: UpdateCollegeData): Promise<ICollege | null> {
    try {
      const updateObj: any = {}

      if (updateData.name !== undefined) updateObj.name = updateData.name
      if (updateData.code !== undefined) updateObj.code = updateData.code.toUpperCase()
      if (updateData.location !== undefined) updateObj.location = updateData.location
      if (updateData.address !== undefined) updateObj.address = updateData.address
      if (updateData.isActive !== undefined) updateObj.is_active = updateData.isActive

      if (updateData.contactInfo) {
        if (updateData.contactInfo.email !== undefined) {
          updateObj.contact_email = updateData.contactInfo.email.toLowerCase()
        }
        if (updateData.contactInfo.phone !== undefined) {
          updateObj.contact_phone = updateData.contactInfo.phone
        }
        if (updateData.contactInfo.website !== undefined) {
          updateObj.website = updateData.contactInfo.website
        }
      }

      const { data, error } = await this.supabase
        .from('colleges')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'updateCollege')
      }

      return this.mapDbCollegeToCollege(data)
    } catch (error) {
      console.error('Error updating college:', error)
      throw error
    }
  }

  // Get all colleges
  async getAllColleges(activeOnly: boolean = true): Promise<ICollege[]> {
    try {
      let query = this.supabase
        .from('colleges')
        .select(`
          *,
          college_tenure_heads!left(
            id,
            admin_id,
            batch_year,
            start_date,
            is_active,
            admins(
              id,
              full_name,
              email
            )
          )
        `)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      query = query.order('name', { ascending: true })

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'getAllColleges')
      }

      return data?.map(college => this.mapDbCollegeToCollegeWithAdmin(college)) || []
    } catch (error) {
      console.error('Error getting all colleges:', error)
      throw error
    }
  }

  // Soft delete college
  async deleteCollege(id: string): Promise<boolean> {
    try {
      // First, check if college has active tenure heads
      const currentHead = await this.getCurrentTenureHead(id)
      if (currentHead) {
        throw new Error('Cannot delete college with active tenure head. Please end tenure first.')
      }

      // Check if college has any active tenure heads in the tenure_heads table
      const { data: activeTenures, error: tenureError } = await this.supabase
        .from('college_tenure_heads')
        .select('*')
        .eq('college_id', id)
        .eq('is_active', true)

      if (tenureError) {
        handleSupabaseError(tenureError, 'deleteCollege - check tenure heads')
      }

      if (activeTenures && activeTenures.length > 0) {
        throw new Error(`Cannot delete college with active tenure heads. Found ${activeTenures.length} active tenure(s).`)
      }

      // Now delete the college
      const { error } = await this.supabase
        .from('colleges')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'deleteCollege')
      }

      return true
    } catch (error) {
      console.error('Error deleting college:', error)
      throw error
    }
  }

  // Tenure Head Management

  // Set new tenure head
  async setTenureHead(collegeId: string, adminId: string, startDate?: string): Promise<ITenureHead> {
    try {
      // End current tenure head if exists
      await this.endCurrentTenureHead(collegeId, startDate)

      // Add new tenure head
      const { data, error } = await this.supabase
        .from('college_tenure_heads')
        .insert({
          college_id: collegeId,
          admin_id: adminId,
          start_date: startDate || new Date().toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'setTenureHead')
      }

      return this.mapDbTenureHeadToTenureHead(data)
    } catch (error) {
      console.error('Error setting tenure head:', error)
      throw error
    }
  }

  // Get current tenure head
  async getCurrentTenureHead(collegeId: string): Promise<ICollege | null> {
    try {
      const { data, error } = await this.supabase
        .from('colleges')
        .select(`
          *,
          college_tenure_heads!left(
            id,
            admin_id,
            start_date,
            is_active,
            admins(
              id,
              full_name,
              email
            )
          )
        `)
        .eq('id', collegeId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'getCurrentTenureHead')
      }

      return this.mapDbCollegeToCollegeWithAdmin(data)
    } catch (error) {
      console.error('Error getting current tenure head:', error)
      throw error
    }
  }

  // End current tenure head
  async endCurrentTenureHead(collegeId: string, endDate?: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('college_tenure_heads')
        .update({
          end_date: endDate || new Date().toISOString(),
          is_active: false
        })
        .eq('college_id', collegeId)
        .eq('is_active', true)

      if (error) {
        handleSupabaseError(error, 'endCurrentTenureHead')
      }

      return true
    } catch (error) {
      console.error('Error ending current tenure head:', error)
      throw error
    }
  }

  // Get tenure history for college
  async getTenureHistory(collegeId: string): Promise<ITenureHead[]> {
    try {
      const { data, error } = await this.supabase
        .from('college_tenure_heads')
        .select('*')
        .eq('college_id', collegeId)
        .order('start_date', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getTenureHistory')
      }

      return data?.map(tenure => this.mapDbTenureHeadToTenureHead(tenure)) || []
    } catch (error) {
      console.error('Error getting tenure history:', error)
      throw error
    }
  }

  // Get colleges by admin (current tenure heads)
  async getCollegesByAdmin(adminId: string): Promise<ICollege[]> {
    try {
      const { data, error } = await this.supabase
        .from('college_tenure_heads')
        .select(`
          colleges (*)
        `)
        .eq('admin_id', adminId)
        .eq('is_active', true)

      if (error) {
        handleSupabaseError(error, 'getCollegesByAdmin')
      }

      return data?.map((item: any) => this.mapDbCollegeToCollege(item.colleges)) || []
    } catch (error) {
      console.error('Error getting colleges by admin:', error)
      throw error
    }
  }

  // Search colleges
  async searchColleges(searchTerm: string, activeOnly: boolean = true): Promise<ICollege[]> {
    try {
      let query = this.supabase
        .from('colleges')
        .select('*')

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'searchColleges')
      }

      return data?.map(college => this.mapDbCollegeToCollege(college)) || []
    } catch (error) {
      console.error('Error searching colleges:', error)
      throw error
    }
  }

  // Helper method to map database college to ICollege interface
  private mapDbCollegeToCollege(dbCollege: Database['public']['Tables']['colleges']['Row']): ICollege {
    return {
      id: dbCollege.id,
      name: dbCollege.name,
      code: dbCollege.code,
      location: dbCollege.location,
      address: dbCollege.address,
      contactInfo: {
        email: dbCollege.contact_email,
        phone: dbCollege.contact_phone,
        website: dbCollege.website || undefined
      },
      isActive: dbCollege.is_active,
      createdAt: dbCollege.created_at,
      updatedAt: dbCollege.updated_at
    }
  }

  // Helper method to map database college to ICollege interface with admin information
  private mapDbCollegeToCollegeWithAdmin(dbCollege: any): ICollege {
    const baseCollege = this.mapDbCollegeToCollege(dbCollege)
    
    // Find all active tenure heads
    let currentTenureHeads = null
    if (dbCollege.college_tenure_heads && Array.isArray(dbCollege.college_tenure_heads)) {
      const activeTenures = dbCollege.college_tenure_heads.filter((tenure: any) => tenure.is_active === true)
      if (activeTenures.length > 0) {
        currentTenureHeads = activeTenures.map((tenure: any) => {
          if (tenure.admins) {
            return {
              id: tenure.id,
              adminId: tenure.admin_id,
              adminName: tenure.admins.full_name,
              adminEmail: tenure.admins.email,
              batchYear: tenure.batch_year || 2024, // Use actual batch_year from database
              startDate: tenure.start_date,
              isActive: tenure.is_active
            }
          }
          return null
        }).filter(Boolean)
      }
    }
    
    return {
      ...baseCollege,
      currentTenureHeads
    }
  }

  // Helper method to map database tenure head to ITenureHead interface
  private mapDbTenureHeadToTenureHead(dbTenureHead: Database['public']['Tables']['college_tenure_heads']['Row']): ITenureHead {
    return {
      id: dbTenureHead.id,
      collegeId: dbTenureHead.college_id,
      adminId: dbTenureHead.admin_id,
      startDate: dbTenureHead.start_date,
      endDate: dbTenureHead.end_date || undefined,
      isActive: dbTenureHead.is_active,
      createdAt: dbTenureHead.created_at,
      updatedAt: dbTenureHead.updated_at
    }
  }
}

export default new CollegeService() 