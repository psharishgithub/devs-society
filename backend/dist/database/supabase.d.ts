import { SupabaseClient } from '@supabase/supabase-js';
export interface Database {
    public: {
        Tables: {
            colleges: {
                Row: {
                    id: string;
                    name: string;
                    code: string;
                    location: string;
                    address: string;
                    contact_email: string;
                    contact_phone: string;
                    website: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    code: string;
                    location: string;
                    address: string;
                    contact_email: string;
                    contact_phone: string;
                    website?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    code?: string;
                    location?: string;
                    address?: string;
                    contact_email?: string;
                    contact_phone?: string;
                    website?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            admins: {
                Row: {
                    id: string;
                    username: string;
                    email: string;
                    password_hash: string;
                    full_name: string;
                    role: 'super-admin' | 'admin';
                    assigned_college_id: string | null;
                    batch_year: number | null;
                    permissions: string[];
                    tenure_start_date: string | null;
                    tenure_end_date: string | null;
                    tenure_is_active: boolean;
                    is_active: boolean;
                    last_login: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    username: string;
                    email: string;
                    password_hash: string;
                    full_name: string;
                    role?: 'super-admin' | 'admin';
                    assigned_college_id?: string | null;
                    batch_year?: number | null;
                    permissions?: string[];
                    tenure_start_date?: string | null;
                    tenure_end_date?: string | null;
                    tenure_is_active?: boolean;
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    username?: string;
                    email?: string;
                    password_hash?: string;
                    full_name?: string;
                    role?: 'super-admin' | 'admin';
                    assigned_college_id?: string | null;
                    batch_year?: number | null;
                    permissions?: string[];
                    tenure_start_date?: string | null;
                    tenure_end_date?: string | null;
                    tenure_is_active?: boolean;
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    full_name: string;
                    email: string;
                    phone: string;
                    college: string;
                    college_ref_id: string | null;
                    batch_year: string;
                    role: 'core-member' | 'board-member' | 'special-member' | 'other';
                    photo_url: string | null;
                    member_id: string;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    email: string;
                    phone: string;
                    college: string;
                    college_ref_id?: string | null;
                    batch_year: string;
                    role?: 'core-member' | 'board-member' | 'special-member' | 'other';
                    photo_url?: string | null;
                    member_id?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    email?: string;
                    phone?: string;
                    college?: string;
                    college_ref_id?: string | null;
                    batch_year?: string;
                    role?: 'core-member' | 'board-member' | 'special-member' | 'other';
                    photo_url?: string | null;
                    member_id?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            events: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    event_date: string;
                    event_time: string;
                    location: string;
                    event_type: 'college-specific' | 'open-to-all';
                    target_college_id: string | null;
                    max_attendees: number;
                    category: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other';
                    organizer_admin_id: string;
                    organizer_name: string;
                    organizer_contact: string;
                    requirements: string[];
                    prizes: string[];
                    registration_deadline: string;
                    is_paid: boolean;
                    price: number;
                    admin_pricing: any;
                    photo_url: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description: string;
                    event_date: string;
                    event_time: string;
                    location: string;
                    event_type?: 'college-specific' | 'open-to-all';
                    target_college_id?: string | null;
                    max_attendees: number;
                    category?: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other';
                    organizer_admin_id: string;
                    organizer_name: string;
                    organizer_contact: string;
                    requirements?: string[];
                    prizes?: string[];
                    registration_deadline: string;
                    is_paid?: boolean;
                    price?: number;
                    admin_pricing?: any;
                    photo_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string;
                    event_date?: string;
                    event_time?: string;
                    location?: string;
                    event_type?: 'college-specific' | 'open-to-all';
                    target_college_id?: string | null;
                    max_attendees?: number;
                    category?: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other';
                    organizer_admin_id?: string;
                    organizer_name?: string;
                    organizer_contact?: string;
                    requirements?: string[];
                    prizes?: string[];
                    registration_deadline?: string;
                    is_paid?: boolean;
                    price?: number;
                    admin_pricing?: any;
                    photo_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            event_registrations: {
                Row: {
                    id: string;
                    event_id: string;
                    user_id: string;
                    registered_at: string;
                    status: 'confirmed' | 'waitlisted' | 'cancelled';
                    created_at: string;
                    updated_at: string;
                    qr_code_data: any;
                    check_in_code: string | null;
                    qr_code_url: string | null;
                    checked_in_at: string | null;
                    checked_in_by: string | null;
                    payment_verified: boolean | null;
                    payment_id: string | null;
                    payment_amount: number | null;
                    payment_currency: string | null;
                    payment_timestamp: string | null;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    user_id: string;
                    registered_at?: string;
                    status?: 'confirmed' | 'waitlisted' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                    qr_code_data?: any;
                    check_in_code?: string | null;
                    qr_code_url?: string | null;
                    checked_in_at?: string | null;
                    checked_in_by?: string | null;
                    payment_verified?: boolean | null;
                    payment_id?: string | null;
                    payment_amount?: number | null;
                    payment_currency?: string | null;
                    payment_timestamp?: string | null;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    user_id?: string;
                    registered_at?: string;
                    status?: 'confirmed' | 'waitlisted' | 'cancelled';
                    created_at?: string;
                    updated_at?: string;
                    qr_code_data?: any;
                    check_in_code?: string | null;
                    qr_code_url?: string | null;
                    checked_in_at?: string | null;
                    checked_in_by?: string | null;
                    payment_verified?: boolean | null;
                    payment_id?: string | null;
                    payment_amount?: number | null;
                    payment_currency?: string | null;
                    payment_timestamp?: string | null;
                };
            };
            college_tenure_heads: {
                Row: {
                    id: string;
                    college_id: string;
                    admin_id: string;
                    batch_year: number | null;
                    start_date: string;
                    end_date: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    college_id: string;
                    admin_id: string;
                    batch_year?: number | null;
                    start_date?: string;
                    end_date?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    college_id?: string;
                    admin_id?: string;
                    batch_year?: number | null;
                    start_date?: string;
                    end_date?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            event_forms: {
                Row: {
                    id: string;
                    event_id: string;
                    title: string;
                    description: string | null;
                    fields: any;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    title: string;
                    description?: string | null;
                    fields?: any;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    title?: string;
                    description?: string | null;
                    fields?: any;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            event_form_responses: {
                Row: {
                    id: string;
                    form_id: string;
                    user_id: string;
                    responses: any;
                    submitted_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    form_id: string;
                    user_id: string;
                    responses?: any;
                    submitted_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    form_id?: string;
                    user_id?: string;
                    responses?: any;
                    submitted_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            user_role: 'core-member' | 'board-member' | 'special-member' | 'other';
            admin_role: 'super-admin' | 'admin';
            event_type: 'college-specific' | 'open-to-all';
            event_category: 'workshop' | 'seminar' | 'hackathon' | 'competition' | 'meetup' | 'other';
            registration_status: 'confirmed' | 'waitlisted' | 'cancelled';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
export declare const initializeSupabase: () => SupabaseClient<Database>;
export declare const getSupabase: () => SupabaseClient<Database>;
export declare const handleSupabaseError: (error: any, operation: string) => never;
export declare const testConnection: (retries?: number) => Promise<boolean>;
export declare const debugConnection: () => Promise<void>;
export default getSupabase;
//# sourceMappingURL=supabase.d.ts.map