import { getSupabase, handleSupabaseError, Database } from '../database/supabase'
import CollegeService from './collegeService'

export interface IUser {
  id: string
  fullName: string
  email: string
  phone: string
  college: string // This will now contain the college name
  collegeRef?: string // Reference to College ID
  batchYear: string
  role: 'core-member' | 'board-member' | 'special-member' | 'regular-member' | 'other'
  photoUrl?: string
  memberId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  fullName: string
  email: string
  phone: string
  college: string
  collegeRef?: string
  batchYear: string
  role?: 'core-member' | 'board-member' | 'special-member' | 'regular-member' | 'other'
  photoUrl?: string
}

export interface UpdateUserData {
  fullName?: string
  email?: string
  phone?: string
  college?: string
  collegeRef?: string
  batchYear?: string
  role?: 'core-member' | 'board-member' | 'special-member' | 'regular-member' | 'other'
  photoUrl?: string
  isActive?: boolean
}

class UserService {
  private get supabase() {
    return getSupabase()
  }

  // Generate unique member ID
  private async generateMemberId(): Promise<string> {
    const { count, error } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (error) {
      handleSupabaseError(error, 'generateMemberId')
      throw new Error('Failed to generate member ID')
    }

    const userCount = count || 0
    const newMemberId = `MEM${(userCount + 1).toString().padStart(4, '0')}`

    return newMemberId
  }

  // Validate batch year assignment for a college
  async validateBatchYearAssignment(collegeId: string, batchYear: string): Promise<{ valid: boolean; adminName?: string; error?: string }> {
    try {
      // Import AdminService here to avoid circular dependency
      const AdminService = require('./adminService').default
      
      // Get all active admins for the college
      const admins = await AdminService.getAdminsByCollege(collegeId, true)
      
      // Find admin with matching batch year
      const admin = admins.find((a: any) => a.batchYear?.toString() === batchYear)
      
      if (!admin) {
        return {
          valid: false,
          error: `No active admin found for batch year ${batchYear} at this college`
        }
      }
      
      return {
        valid: true,
        adminName: admin.fullName
      }
    } catch (error) {
      console.error('Error validating batch year assignment:', error)
      return {
        valid: false,
        error: 'Failed to validate batch year assignment'
      }
    }
  }

  // Get available batch years for a college
  async getAvailableBatchYears(collegeId: string): Promise<Array<{ year: string; adminName: string }>> {
    try {
      // Import AdminService here to avoid circular dependency
      const AdminService = require('./adminService').default
      
      // Get all active admins for the college
      const admins = await AdminService.getAdminsByCollege(collegeId, true)
      
      // Return available batch years with admin names
      return admins.map((admin: any) => ({
        year: admin.batchYear?.toString() || '',
        adminName: admin.fullName
      })).filter((batch: { year: string; adminName: string }) => batch.year)
    } catch (error) {
      console.error('Error getting available batch years:', error)
      return []
    }
  }

  // Create a new user with batch year validation
  async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      // Validate batch year assignment if collegeRef is provided
      if (userData.collegeRef) {
        const validation = await this.validateBatchYearAssignment(userData.collegeRef, userData.batchYear)
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid batch year assignment')
        }
      }

      const memberId = await this.generateMemberId()
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          full_name: userData.fullName,
          email: userData.email.toLowerCase(),
          phone: userData.phone,
          college: userData.college,
          college_ref_id: userData.collegeRef || null,
          batch_year: userData.batchYear,
          role: userData.role || 'other',
          photo_url: userData.photoUrl || null,
          is_active: true,
          member_id: memberId
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'createUser')
      }

      return await this.mapDbUserToUser(data)
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user not found
          return null
        }
        handleSupabaseError(error, 'findByEmail')
      }

      return await this.mapDbUserToUser(data)
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  }

  // Find user by ID
  async findById(id: string): Promise<IUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
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

      return await this.mapDbUserToUser(data)
    } catch (error) {
      console.error('Error finding user by ID:', error)
      throw error
    }
  }

  // Find user by member ID
  async findByMemberId(memberId: string): Promise<IUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('member_id', memberId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'findByMemberId')
      }

      return await this.mapDbUserToUser(data)
    } catch (error) {
      console.error('Error finding user by member ID:', error)
      throw error
    }
  }

  // Update user
  async updateUser(id: string, updateData: UpdateUserData): Promise<IUser | null> {
    try {
      const updateObj: any = {}

      if (updateData.fullName !== undefined) updateObj.full_name = updateData.fullName
      if (updateData.email !== undefined) updateObj.email = updateData.email.toLowerCase()
      if (updateData.phone !== undefined) updateObj.phone = updateData.phone
      if (updateData.college !== undefined) updateObj.college = updateData.college
      if (updateData.collegeRef !== undefined) updateObj.college_ref_id = updateData.collegeRef
      if (updateData.batchYear !== undefined) updateObj.batch_year = updateData.batchYear
      if (updateData.role !== undefined) updateObj.role = updateData.role
      if (updateData.photoUrl !== undefined) updateObj.photo_url = updateData.photoUrl
      if (updateData.isActive !== undefined) updateObj.is_active = updateData.isActive

      const { data, error } = await this.supabase
        .from('users')
        .update(updateObj)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'updateUser')
      }

      return await this.mapDbUserToUser(data)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Get all users (with pagination)
  async getAllUsers(page: number = 1, limit: number = 50, activeOnly: boolean = true): Promise<{
    users: IUser[]
    totalCount: number
    totalPages: number
    currentPage: number
  }> {
    try {
      const offset = (page - 1) * limit

      // Build query
      let query = this.supabase
        .from('users')
        .select('*', { count: 'exact' })

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        handleSupabaseError(error, 'getAllUsers')
      }

      const usersPromises = data?.map(user => this.mapDbUserToUser(user)) || []
      const users = await Promise.all(usersPromises)
      const totalCount = count || 0
      const totalPages = Math.ceil(totalCount / limit)

      return {
        users,
        totalCount,
        totalPages,
        currentPage: page
      }
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  }

  // Get users by college
  async getUsersByCollege(collegeName: string, activeOnly: boolean = true): Promise<IUser[]> {
    try {
      let query = this.supabase
        .from('users')
        .select('*')
        .eq('college', collegeName)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'getUsersByCollege')
      }

      const usersPromises = data?.map(user => this.mapDbUserToUser(user)) || []
      return await Promise.all(usersPromises)
    } catch (error) {
      console.error('Error getting users by college:', error)
      throw error
    }
  }

  // Get users by batch year
  async getUsersByBatch(batchYear: string, activeOnly: boolean = true): Promise<IUser[]> {
    try {
      let query = this.supabase
        .from('users')
        .select('*')
        .eq('batch_year', batchYear)

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'getUsersByBatch')
      }

      const usersPromises = data?.map(user => this.mapDbUserToUser(user)) || []
      return await Promise.all(usersPromises)
    } catch (error) {
      console.error('Error getting users by batch:', error)
      throw error
    }
  }

  // Soft delete user
  async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        handleSupabaseError(error, 'deleteUser')
      }

      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Get user count
  async getUserCount(activeOnly: boolean = true): Promise<number> {
    try {
      let query = this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { count, error } = await query

      if (error) {
        handleSupabaseError(error, 'getUserCount')
      }

      return count || 0
    } catch (error) {
      console.error('Error getting user count:', error)
      throw error
    }
  }

  // Search users by name or email
  async searchUsers(searchTerm: string, activeOnly: boolean = true): Promise<IUser[]> {
    try {
      let query = this.supabase
        .from('users')
        .select('*')

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      // Using ilike for case-insensitive search
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        handleSupabaseError(error, 'searchUsers')
      }

      const usersPromises = data?.map(user => this.mapDbUserToUser(user)) || []
      return await Promise.all(usersPromises)
    } catch (error) {
      console.error('Error searching users:', error)
      throw error
    }
  }

  // Helper method to map database user to IUser interface
  private async mapDbUserToUser(dbUser: Database['public']['Tables']['users']['Row']): Promise<IUser> {
    // Try to get college name from collegeRef
    let collegeName = dbUser.college // Fallback to the stored value
    
    if (dbUser.college_ref_id) {
      try {
        const college = await CollegeService.findById(dbUser.college_ref_id)
        if (college) {
          collegeName = college.name
        }
      } catch (error) {
        console.warn(`Failed to fetch college name for ID ${dbUser.college_ref_id}:`, error)
        // Keep the fallback value
      }
    }

    return {
      id: dbUser.id,
      fullName: dbUser.full_name,
      email: dbUser.email,
      phone: dbUser.phone,
      college: collegeName,
      collegeRef: dbUser.college_ref_id || undefined,
      batchYear: dbUser.batch_year,
      role: dbUser.role,
      photoUrl: dbUser.photo_url || undefined,
      memberId: dbUser.member_id,
      isActive: dbUser.is_active,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    }
  }
}

export default new UserService() 