"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
class EventService {
    constructor() {
        this.supabase = (0, supabase_1.getSupabase)();
    }
    // Create a new event
    async createEvent(eventData) {
        try {
            // Temporary solution: Store paid event info in description until database is fixed
            let description = eventData.description;
            if (eventData.isPaid && eventData.price) {
                description = `[PAID_EVENT:₹${eventData.price}] ${description}`;
            }
            const { data, error } = await this.supabase
                .from('events')
                .insert({
                title: eventData.title,
                description: description, // Use modified description
                event_date: eventData.date,
                event_time: eventData.time,
                location: eventData.location,
                event_type: eventData.eventType || 'college-specific',
                target_college_id: eventData.targetCollege || null,
                max_attendees: eventData.maxAttendees,
                category: eventData.category || 'other',
                organizer_admin_id: eventData.organizer.adminId,
                organizer_name: eventData.organizer.name,
                organizer_contact: eventData.organizer.contact,
                requirements: eventData.requirements || [],
                prizes: eventData.prizes || [],
                registration_deadline: eventData.registrationDeadline,
                is_paid: eventData.isPaid || false,
                price: eventData.isPaid ? (eventData.price || 0) : 0,
                admin_pricing: eventData.adminPricing || [],
                photo_url: eventData.photoUrl || null,
                is_active: true
            })
                .select()
                .single();
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'createEvent');
            }
            return this.mapDbEventToEvent(data);
        }
        catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }
    // Find event by ID
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .eq('is_active', true)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                (0, supabase_1.handleSupabaseError)(error, 'findById');
            }
            // Get attendee count
            const attendeeCount = await this.getConfirmedRegistrationCount(id);
            const event = this.mapDbEventToEvent(data);
            return {
                ...event,
                attendees: Array(attendeeCount).fill({}) // Create array with attendee count for frontend compatibility
            };
        }
        catch (error) {
            console.error('Error finding event by ID:', error);
            throw error;
        }
    }
    // Update event
    async updateEvent(id, updateData) {
        try {
            const updateObj = {};
            if (updateData.title !== undefined)
                updateObj.title = updateData.title;
            if (updateData.description !== undefined)
                updateObj.description = updateData.description;
            if (updateData.date !== undefined)
                updateObj.event_date = updateData.date;
            if (updateData.time !== undefined)
                updateObj.event_time = updateData.time;
            if (updateData.location !== undefined)
                updateObj.location = updateData.location;
            if (updateData.eventType !== undefined)
                updateObj.event_type = updateData.eventType;
            if (updateData.targetCollege !== undefined)
                updateObj.target_college_id = updateData.targetCollege;
            if (updateData.maxAttendees !== undefined)
                updateObj.max_attendees = updateData.maxAttendees;
            if (updateData.category !== undefined)
                updateObj.category = updateData.category;
            if (updateData.requirements !== undefined)
                updateObj.requirements = updateData.requirements;
            if (updateData.prizes !== undefined)
                updateObj.prizes = updateData.prizes;
            if (updateData.registrationDeadline !== undefined)
                updateObj.registration_deadline = updateData.registrationDeadline;
            if (updateData.isActive !== undefined)
                updateObj.is_active = updateData.isActive;
            if (updateData.organizer) {
                if (updateData.organizer.adminId !== undefined)
                    updateObj.organizer_admin_id = updateData.organizer.adminId;
                if (updateData.organizer.name !== undefined)
                    updateObj.organizer_name = updateData.organizer.name;
                if (updateData.organizer.contact !== undefined)
                    updateObj.organizer_contact = updateData.organizer.contact;
            }
            if (updateData.photoUrl !== undefined)
                updateObj.photo_url = updateData.photoUrl;
            const { data, error } = await this.supabase
                .from('events')
                .update(updateObj)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                (0, supabase_1.handleSupabaseError)(error, 'updateEvent');
            }
            return this.mapDbEventToEvent(data);
        }
        catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }
    // Get all events
    async getAllEvents(activeOnly = true) {
        try {
            let query = this.supabase
                .from('events')
                .select('*');
            if (activeOnly) {
                query = query.eq('is_active', true);
            }
            query = query.order('event_date', { ascending: false });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getAllEvents');
            }
            // Get attendee count for each event
            const eventsWithAttendees = await Promise.all((data || []).map(async (event) => {
                const attendeeCount = await this.getConfirmedRegistrationCount(event.id);
                const mappedEvent = this.mapDbEventToEvent(event);
                return {
                    ...mappedEvent,
                    attendees: Array(attendeeCount).fill({}) // Create array with attendee count for frontend compatibility
                };
            }));
            return eventsWithAttendees;
        }
        catch (error) {
            console.error('Error getting all events:', error);
            throw error;
        }
    }
    // Get upcoming events
    async getUpcomingEvents(activeOnly = true) {
        try {
            const now = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
            let query = this.supabase
                .from('events')
                .select('*')
                .gte('event_date', now);
            if (activeOnly) {
                query = query.eq('is_active', true);
            }
            query = query.order('event_date', { ascending: true });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getUpcomingEvents');
            }
            return data?.map(event => this.mapDbEventToEvent(event)) || [];
        }
        catch (error) {
            console.error('Error getting upcoming events:', error);
            throw error;
        }
    }
    // Get events by college
    async getEventsByCollege(collegeId, activeOnly = true) {
        try {
            let query = this.supabase
                .from('events')
                .select('*')
                .or(`event_type.eq.open-to-all,and(event_type.eq.college-specific,target_college_id.eq.${collegeId})`);
            if (activeOnly) {
                query = query.eq('is_active', true);
            }
            query = query.order('event_date', { ascending: false });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getEventsByCollege');
            }
            return data?.map(event => this.mapDbEventToEvent(event)) || [];
        }
        catch (error) {
            console.error('Error getting events by college:', error);
            throw error;
        }
    }
    // Get events by organizer
    async getEventsByOrganizer(adminId, activeOnly = true) {
        try {
            let query = this.supabase
                .from('events')
                .select('*')
                .eq('organizer_admin_id', adminId);
            if (activeOnly) {
                query = query.eq('is_active', true);
            }
            query = query.order('event_date', { ascending: false });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getEventsByOrganizer');
            }
            return data?.map(event => this.mapDbEventToEvent(event)) || [];
        }
        catch (error) {
            console.error('Error getting events by organizer:', error);
            throw error;
        }
    }
    // Soft delete event
    async deleteEvent(id) {
        try {
            const { error } = await this.supabase
                .from('events')
                .update({ is_active: false })
                .eq('id', id);
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'deleteEvent');
            }
            return true;
        }
        catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
    // Event Registration Methods
    // Register user for event
    async registerForEvent(eventId, userId) {
        try {
            // Check if user can register
            const canRegister = await this.canUserRegister(eventId, userId);
            if (!canRegister.canRegister) {
                throw new Error(canRegister.reason);
            }
            // Check if user already has a registration (including cancelled ones)
            const { data: existingReg, error: checkError } = await this.supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();
            if (checkError && checkError.code !== 'PGRST116') {
                (0, supabase_1.handleSupabaseError)(checkError, 'registerForEvent');
            }
            let data;
            let error;
            if (existingReg) {
                // If registration exists and is not cancelled, return it
                if (existingReg.status !== 'cancelled') {
                    return this.mapDbRegistrationToRegistration(existingReg);
                }
                // Update cancelled registration to confirmed
                const { data: updateData, error: updateError } = await this.supabase
                    .from('event_registrations')
                    .update({
                    status: canRegister.status || 'confirmed',
                    registered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                    .eq('id', existingReg.id)
                    .select()
                    .single();
                data = updateData;
                error = updateError;
            }
            else {
                // Create new registration
                const { data: insertData, error: insertError } = await this.supabase
                    .from('event_registrations')
                    .insert({
                    event_id: eventId,
                    user_id: userId,
                    status: canRegister.status || 'confirmed',
                    payment_verified: false // Default to false for new registrations
                })
                    .select()
                    .single();
                data = insertData;
                error = insertError;
            }
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'registerForEvent');
            }
            return this.mapDbRegistrationToRegistration(data);
        }
        catch (error) {
            console.error('Error registering for event:', error);
            throw error;
        }
    }
    // Register user for event with payment verification
    async registerForEventWithPayment(eventId, userId, paymentInfo) {
        try {
            // Check if user can register
            const canRegister = await this.canUserRegister(eventId, userId);
            if (!canRegister.canRegister) {
                throw new Error(canRegister.reason);
            }
            // Check if registration already exists
            const { data: existingReg, error: checkError } = await this.supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .single();
            if (checkError && checkError.code !== 'PGRST116') {
                (0, supabase_1.handleSupabaseError)(checkError, 'registerForEventWithPayment');
            }
            let data;
            let error;
            if (existingReg) {
                // Update existing registration with payment info
                const { data: updateData, error: updateError } = await this.supabase
                    .from('event_registrations')
                    .update({
                    status: canRegister.status || 'confirmed',
                    payment_verified: paymentInfo.verified,
                    payment_id: paymentInfo.paymentId,
                    payment_amount: paymentInfo.amount,
                    payment_currency: paymentInfo.currency,
                    payment_timestamp: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                    .eq('id', existingReg.id)
                    .select()
                    .single();
                data = updateData;
                error = updateError;
            }
            else {
                // Create new registration with payment info
                const { data: insertData, error: insertError } = await this.supabase
                    .from('event_registrations')
                    .insert({
                    event_id: eventId,
                    user_id: userId,
                    status: canRegister.status || 'confirmed',
                    payment_verified: paymentInfo.verified,
                    payment_id: paymentInfo.paymentId,
                    payment_amount: paymentInfo.amount,
                    payment_currency: paymentInfo.currency,
                    payment_timestamp: new Date().toISOString()
                })
                    .select()
                    .single();
                data = insertData;
                error = insertError;
            }
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'registerForEventWithPayment');
            }
            return this.mapDbRegistrationToRegistration(data);
        }
        catch (error) {
            console.error('Error registering for event with payment:', error);
            throw error;
        }
    }
    // Get event registrations
    async getEventRegistrations(eventId, status) {
        try {
            let query = this.supabase
                .from('event_registrations')
                .select(`
          *,
          users!inner(full_name, email, member_id)
        `)
                .eq('event_id', eventId);
            if (status) {
                query = query.eq('status', status);
            }
            query = query.order('registered_at', { ascending: true });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getEventRegistrations');
            }
            return data?.map(reg => ({
                ...this.mapDbRegistrationToRegistration(reg),
                userName: reg.users?.full_name || 'Unknown User'
            })) || [];
        }
        catch (error) {
            console.error('Error getting event registrations:', error);
            throw error;
        }
    }
    // Get user registrations
    async getUserRegistrations(userId, status) {
        try {
            let query = this.supabase
                .from('event_registrations')
                .select('*')
                .eq('user_id', userId);
            if (status) {
                query = query.eq('status', status);
            }
            query = query.order('registered_at', { ascending: false });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getUserRegistrations');
            }
            return data?.map(reg => this.mapDbRegistrationToRegistration(reg)) || [];
        }
        catch (error) {
            console.error('Error getting user registrations:', error);
            throw error;
        }
    }
    // Get registration by ID
    async getRegistrationById(registrationId) {
        try {
            const { data, error } = await this.supabase
                .from('event_registrations')
                .select('*')
                .eq('id', registrationId)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                (0, supabase_1.handleSupabaseError)(error, 'getRegistrationById');
            }
            return this.mapDbRegistrationToRegistration(data);
        }
        catch (error) {
            console.error('Error getting registration by ID:', error);
            throw error;
        }
    }
    // Get all registrations for analytics
    async getAllRegistrations() {
        try {
            const { data, error } = await this.supabase
                .from('event_registrations')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getAllRegistrations');
            }
            return data?.map(reg => this.mapDbRegistrationToRegistration(reg)) || [];
        }
        catch (error) {
            console.error('Error getting all registrations:', error);
            throw error;
        }
    }
    // Check if user can register for event
    async canUserRegister(eventId, userId) {
        try {
            const event = await this.findById(eventId);
            if (!event) {
                return { canRegister: false, reason: 'Event not found' };
            }
            const now = new Date();
            const deadline = new Date(event.registrationDeadline);
            // Check if registration is still open
            if (now > deadline) {
                return { canRegister: false, reason: 'Registration deadline passed' };
            }
            // Check if user already registered
            const { data: existingReg, error } = await this.supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .neq('status', 'cancelled')
                .single();
            if (error && error.code !== 'PGRST116') {
                (0, supabase_1.handleSupabaseError)(error, 'canUserRegister');
            }
            if (existingReg) {
                // If user is already registered and confirmed, they can't register again
                if (existingReg.status === 'confirmed') {
                    return { canRegister: false, reason: 'Already registered' };
                }
                // If user is waitlisted, they can be moved to confirmed if spots are available
                if (existingReg.status === 'waitlisted') {
                    const confirmedCount = await this.getConfirmedRegistrationCount(eventId);
                    if (confirmedCount < event.maxAttendees) {
                        return { canRegister: true, status: 'confirmed' };
                    }
                }
                return { canRegister: false, reason: 'Already registered' };
            }
            // Check if spots available
            const confirmedCount = await this.getConfirmedRegistrationCount(eventId);
            if (confirmedCount >= event.maxAttendees) {
                return { canRegister: true, status: 'waitlisted' };
            }
            return { canRegister: true, status: 'confirmed' };
        }
        catch (error) {
            console.error('Error checking if user can register:', error);
            return { canRegister: false, reason: 'Error checking registration eligibility' };
        }
    }
    // Get available spots for event
    async getAvailableSpots(eventId) {
        try {
            const event = await this.findById(eventId);
            if (!event)
                return 0;
            const confirmedCount = await this.getConfirmedRegistrationCount(eventId);
            return Math.max(0, event.maxAttendees - confirmedCount);
        }
        catch (error) {
            console.error('Error getting available spots:', error);
            return 0;
        }
    }
    // Get confirmed registration count
    async getConfirmedRegistrationCount(eventId) {
        try {
            const { count, error } = await this.supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', eventId)
                .eq('status', 'confirmed');
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'getConfirmedRegistrationCount');
            }
            return count || 0;
        }
        catch (error) {
            console.error('Error getting confirmed registration count:', error);
            return 0;
        }
    }
    // Search events
    async searchEvents(searchTerm, activeOnly = true) {
        try {
            let query = this.supabase
                .from('events')
                .select('*');
            if (activeOnly) {
                query = query.eq('is_active', true);
            }
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
                .order('event_date', { ascending: false });
            const { data, error } = await query;
            if (error) {
                (0, supabase_1.handleSupabaseError)(error, 'searchEvents');
            }
            return data?.map(event => this.mapDbEventToEvent(event)) || [];
        }
        catch (error) {
            console.error('Error searching events:', error);
            throw error;
        }
    }
    // Helper method to map database event to IEvent interface
    mapDbEventToEvent(dbEvent) {
        // Check for temporary paid event format: [PAID_EVENT:₹price]
        const tempPaidMatch = dbEvent.description?.match(/\[PAID_EVENT:₹(\d+)\]/);
        const isTempPaidEvent = !!tempPaidMatch;
        const tempPrice = tempPaidMatch ? parseInt(tempPaidMatch[1]) : 0;
        // Remove the temporary format from description for display
        const cleanDescription = dbEvent.description?.replace(/\[PAID_EVENT:₹\d+\]\s*/, '') || dbEvent.description;
        // Check if the event has pricing information in the title or description
        const hasPricingInfo = dbEvent.title?.toLowerCase().includes('paid') ||
            dbEvent.title?.toLowerCase().includes('₹') ||
            dbEvent.title?.toLowerCase().includes('rs') ||
            cleanDescription?.toLowerCase().includes('paid') ||
            cleanDescription?.toLowerCase().includes('₹') ||
            cleanDescription?.toLowerCase().includes('rs');
        // Extract price from title or description if available
        const priceMatch = dbEvent.title?.match(/₹(\d+)/) ||
            cleanDescription?.match(/₹(\d+)/) ||
            dbEvent.title?.match(/rs\.?\s*(\d+)/i) ||
            cleanDescription?.match(/rs\.?\s*(\d+)/i);
        const extractedPrice = priceMatch ? parseInt(priceMatch[1]) : 0;
        return {
            id: dbEvent.id,
            title: dbEvent.title,
            description: cleanDescription, // Use clean description without temp format
            date: dbEvent.event_date,
            time: dbEvent.event_time,
            location: dbEvent.location,
            eventType: dbEvent.event_type,
            targetCollege: dbEvent.target_college_id || undefined,
            maxAttendees: dbEvent.max_attendees,
            category: dbEvent.category,
            organizer: {
                adminId: dbEvent.organizer_admin_id,
                name: dbEvent.organizer_name,
                contact: dbEvent.organizer_contact
            },
            requirements: dbEvent.requirements,
            prizes: dbEvent.prizes,
            registrationDeadline: dbEvent.registration_deadline,
            isPaid: dbEvent.is_paid || isTempPaidEvent || hasPricingInfo || extractedPrice > 0, // Use database value first
            price: dbEvent.price || tempPrice || extractedPrice, // Use database value first
            adminPricing: dbEvent.admin_pricing || [], // Read from database
            photoUrl: dbEvent.photo_url || undefined,
            isActive: dbEvent.is_active,
            createdAt: dbEvent.created_at,
            updatedAt: dbEvent.updated_at
        };
    }
    // Helper method to map database registration to IEventRegistration interface
    mapDbRegistrationToRegistration(dbReg) {
        return {
            id: dbReg.id,
            eventId: dbReg.event_id,
            userId: dbReg.user_id,
            registeredAt: dbReg.registered_at,
            status: dbReg.status,
            createdAt: dbReg.created_at,
            updatedAt: dbReg.updated_at,
            paymentVerified: dbReg.payment_verified || undefined,
            paymentId: dbReg.payment_id || undefined,
            paymentAmount: dbReg.payment_amount || undefined,
            paymentCurrency: dbReg.payment_currency || undefined,
            paymentTimestamp: dbReg.payment_timestamp || undefined
        };
    }
}
exports.default = new EventService();
//# sourceMappingURL=eventService.js.map