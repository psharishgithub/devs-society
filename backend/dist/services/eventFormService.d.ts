export interface FormField {
    id: string;
    type: 'text' | 'email' | 'phone' | 'select' | 'checkbox' | 'textarea' | 'number' | 'date';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
    };
    order: number;
}
export interface EventForm {
    id: string;
    eventId: string;
    title: string;
    description?: string;
    fields: FormField[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface FormSubmission {
    id: string;
    eventId: string;
    userId: string;
    formId: string;
    responses: Record<string, any>;
    submittedAt: string;
    createdAt: string;
}
declare class EventFormService {
    private supabase;
    createEventForm(eventId: string, formData: {
        title: string;
        description?: string;
        fields: Omit<FormField, 'id'>[];
    }): Promise<EventForm>;
    getEventForm(eventId: string): Promise<EventForm | null>;
    updateEventForm(formId: string, updates: {
        title?: string;
        description?: string;
        fields?: FormField[];
    }): Promise<EventForm | null>;
    submitFormResponse(eventId: string, userId: string, formId: string, responses: Record<string, any>): Promise<FormSubmission>;
    getEventFormSubmissions(eventId: string): Promise<FormSubmission[]>;
    getUserFormSubmission(eventId: string, userId: string): Promise<FormSubmission | null>;
    deleteEventForm(formId: string): Promise<boolean>;
    private mapDbFormToForm;
    private mapDbSubmissionToSubmission;
}
declare const _default: EventFormService;
export default _default;
//# sourceMappingURL=eventFormService.d.ts.map