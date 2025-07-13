import { getSupabase, handleSupabaseError, Database } from '../database/supabase'

export interface FormField {
  id: string
  type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'number' | 'date'
  label: string
  placeholder?: string
  required: boolean
  options?: string[] // For select fields
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    min?: number
    max?: number
  }
  order: number
}

export interface EventForm {
  id: string
  eventId: string
  title: string
  description?: string
  fields: FormField[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FormSubmission {
  id: string
  eventId: string
  userId: string
  formId: string
  responses: Record<string, any>
  submittedAt: string
  createdAt: string
}

class EventFormService {
  private supabase = getSupabase()

  // Create custom form for event
  async createEventForm(eventId: string, formData: {
    title: string
    description?: string
    fields: Omit<FormField, 'id'>[]
  }): Promise<EventForm> {
    try {
      // Generate field IDs
      const fieldsWithIds = formData.fields.map((field, index) => ({
        ...field,
        id: `field_${index + 1}`,
        order: field.order || index
      }))

      const { data, error } = await this.supabase
        .from('event_forms')
        .insert({
          event_id: eventId,
          title: formData.title,
          description: formData.description,
          fields: fieldsWithIds,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'createEventForm')
      }

      return this.mapDbFormToForm(data)
    } catch (error) {
      console.error('Error creating event form:', error)
      throw error
    }
  }

  // Get form for event
  async getEventForm(eventId: string): Promise<EventForm | null> {
    try {
      const { data, error } = await this.supabase
        .from('event_forms')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'getEventForm')
      }

      return this.mapDbFormToForm(data)
    } catch (error) {
      console.error('Error getting event form:', error)
      throw error
    }
  }

  // Update event form
  async updateEventForm(formId: string, updates: {
    title?: string
    description?: string
    fields?: FormField[]
  }): Promise<EventForm | null> {
    try {
      const updateObj: any = {}
      
      if (updates.title !== undefined) updateObj.title = updates.title
      if (updates.description !== undefined) updateObj.description = updates.description
      if (updates.fields !== undefined) updateObj.fields = updates.fields

      const { data, error } = await this.supabase
        .from('event_forms')
        .update(updateObj)
        .eq('id', formId)
        .select()
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'updateEventForm')
      }

      return this.mapDbFormToForm(data)
    } catch (error) {
      console.error('Error updating event form:', error)
      throw error
    }
  }

  // Submit form response
  async submitFormResponse(eventId: string, userId: string, formId: string, responses: Record<string, any>): Promise<FormSubmission> {
    try {
      const { data, error } = await this.supabase
        .from('form_submissions')
        .insert({
          event_id: eventId,
          user_id: userId,
          form_id: formId,
          responses: responses,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'submitFormResponse')
      }

      return this.mapDbSubmissionToSubmission(data)
    } catch (error) {
      console.error('Error submitting form response:', error)
      throw error
    }
  }

  // Get form submissions for event
  async getEventFormSubmissions(eventId: string): Promise<FormSubmission[]> {
    try {
      const { data, error } = await this.supabase
        .from('form_submissions')
        .select('*')
        .eq('event_id', eventId)
        .order('submitted_at', { ascending: false })

      if (error) {
        handleSupabaseError(error, 'getEventFormSubmissions')
      }

      return data?.map(submission => this.mapDbSubmissionToSubmission(submission)) || []
    } catch (error) {
      console.error('Error getting form submissions:', error)
      throw error
    }
  }

  // Get user's form submission for event
  async getUserFormSubmission(eventId: string, userId: string): Promise<FormSubmission | null> {
    try {
      const { data, error } = await this.supabase
        .from('form_submissions')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        handleSupabaseError(error, 'getUserFormSubmission')
      }

      return this.mapDbSubmissionToSubmission(data)
    } catch (error) {
      console.error('Error getting user form submission:', error)
      throw error
    }
  }

  // Delete event form
  async deleteEventForm(formId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('event_forms')
        .update({ is_active: false })
        .eq('id', formId)

      if (error) {
        handleSupabaseError(error, 'deleteEventForm')
      }

      return true
    } catch (error) {
      console.error('Error deleting event form:', error)
      throw error
    }
  }

  // Helper methods
  private mapDbFormToForm(dbForm: any): EventForm {
    return {
      id: dbForm.id,
      eventId: dbForm.event_id,
      title: dbForm.title,
      description: dbForm.description,
      fields: dbForm.fields as FormField[],
      isActive: dbForm.is_active,
      createdAt: dbForm.created_at,
      updatedAt: dbForm.updated_at
    }
  }

  private mapDbSubmissionToSubmission(dbSubmission: any): FormSubmission {
    return {
      id: dbSubmission.id,
      eventId: dbSubmission.event_id,
      userId: dbSubmission.user_id,
      formId: dbSubmission.form_id,
      responses: dbSubmission.responses,
      submittedAt: dbSubmission.submitted_at,
      createdAt: dbSubmission.created_at
    }
  }
}

export default new EventFormService()