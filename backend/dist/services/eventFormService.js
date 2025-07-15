"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
class EventFormService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    // Create custom form for event
    async createEventForm(eventId, formData) {
        try {
            // Generate field IDs
            const fieldsWithIds = formData.fields.map((field, index) => ({
                ...field,
                id: `field_${index + 1}`,
                order: field.order || index
            }));
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
                .single();
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'createEventForm');
            }
            return this.mapDbFormToForm(data);
        }
        catch (error) {
            console.error('Error creating event form:', error);
            throw error;
        }
    }
    // Get form for event
    async getEventForm(eventId) {
        try {
            const { data, error } = await this.supabase
                .from('event_forms')
                .select('*')
                .eq('event_id', eventId)
                .eq('is_active', true)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                (0, supabase_1.handleSupabaseError)(error, 'getEventForm');
            }
            return this.mapDbFormToForm(data);
        }
        catch (error) {
            console.error('Error getting event form:', error);
            throw error;
        }
    }
    // Update event form
    async updateEventForm(formId, updates) {
        try {
            const updateObj = {};
            if (updates.title !== undefined)
                updateObj.title = updates.title;
            if (updates.description !== undefined)
                updateObj.description = updates.description;
            if (updates.fields !== undefined)
                updateObj.fields = updates.fields;
            const { data, error } = await this.supabase
                .from('event_forms')
                .update(updateObj)
                .eq('id', formId)
                .select()
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                (0, supabase_1.handleSupabaseError)(error, 'updateEventForm');
            }
            return this.mapDbFormToForm(data);
        }
        catch (error) {
            console.error('Error updating event form:', error);
            throw error;
        }
    }
    // Submit form response
    async submitFormResponse(eventId, userId, formId, responses) {
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
                .single();
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'submitFormResponse');
            }
            return this.mapDbSubmissionToSubmission(data);
        }
        catch (error) {
            console.error('Error submitting form response:', error);
            throw error;
        }
    }
    // Get form submissions for event
    async getEventFormSubmissions(eventId) {
        try {
            const { data, error } = await this.supabase
                .from('form_submissions')
                .select('*')
                .eq('event_id', eventId)
                .order('submitted_at', { ascending: false });
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getEventFormSubmissions');
            }
            return data?.map(submission => this.mapDbSubmissionToSubmission(submission)) || [];
        }
        catch (error) {
            console.error('Error getting form submissions:', error);
            throw error;
        }
    }
    // Get user's form submission for event
    async getUserFormSubmission(eventId, userId) {
        try {
            const { data, error } = await this.supabase
                .from('form_submissions')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                (0, supabase_1.handleSupabaseError)(error, 'getUserFormSubmission');
            }
            return this.mapDbSubmissionToSubmission(data);
        }
        catch (error) {
            console.error('Error getting user form submission:', error);
            throw error;
        }
    }
    // Delete event form
    async deleteEventForm(formId) {
        try {
            const { error } = await this.supabase
                .from('event_forms')
                .update({ is_active: false })
                .eq('id', formId);
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'deleteEventForm');
            }
            return true;
        }
        catch (error) {
            console.error('Error deleting event form:', error);
            throw error;
        }
    }
    // Helper methods
    mapDbFormToForm(dbForm) {
        return {
            id: dbForm.id,
            eventId: dbForm.event_id,
            title: dbForm.title,
            description: dbForm.description,
            fields: dbForm.fields,
            isActive: dbForm.is_active,
            createdAt: dbForm.created_at,
            updatedAt: dbForm.updated_at
        };
    }
    mapDbSubmissionToSubmission(dbSubmission) {
        return {
            id: dbSubmission.id,
            eventId: dbSubmission.event_id,
            userId: dbSubmission.user_id,
            formId: dbSubmission.form_id,
            responses: dbSubmission.responses,
            submittedAt: dbSubmission.submitted_at,
            createdAt: dbSubmission.created_at
        };
    }
}
exports.default = new EventFormService();
//# sourceMappingURL=eventFormService.js.map