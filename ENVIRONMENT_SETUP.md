# Environment Setup for Razorpay Integration

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_RVKFS8WX756Anx
RAZORPAY_KEY_SECRET=kpUZ6zd9t5q7VRM2c76xnqdo

# Email Configuration (Gmail SMTP)
EMAIL_USER=asivasabariganesan@gmail.com
EMAIL_PASS=azba osyp mziq ktqf

# Server Configuration
PORT=5050
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5050/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_RVKFS8WX756Anx
```

## Database Migration

Run the complete database setup to create all necessary tables and fix existing issues:

```bash
cd backend
# Run the complete database setup
psql -h your_supabase_host -U your_supabase_user -d your_supabase_db -f src/database/migrations/006_complete_database_setup.sql

# Run the payment verification migration
psql -h your_supabase_host -U your_supabase_user -d your_supabase_db -f src/database/migrations/007_add_payment_verification.sql
```

Or manually run the SQL migrations in order:

1. **Add admin_pricing to events table:**
```sql
-- Add admin_pricing column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_pricing JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the column
COMMENT ON COLUMN events.admin_pricing IS 'JSON array of admin pricing objects for "Open to All" events. Format: [{"adminType": "string", "amount": "number", "adminId": "string"}]';

-- Update existing events to have empty admin_pricing array
UPDATE events SET admin_pricing = '[]'::jsonb WHERE admin_pricing IS NULL;
```

2. **Create event_forms tables:**
```sql
-- Create event_forms table
CREATE TABLE IF NOT EXISTS event_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_form_responses table
CREATE TABLE IF NOT EXISTS event_form_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES event_forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one response per user per form
    UNIQUE(form_id, user_id)
);
```

3. **Fix event_registrations unique constraint:**
```sql
-- Ensure one registration per user per event
ALTER TABLE event_registrations ADD CONSTRAINT IF NOT EXISTS event_registrations_event_id_user_id_key UNIQUE(event_id, user_id);
```

## Testing the Integration

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the payment flow:**
   - Create an "Open to All" paid event with admin pricing
   - Register for the event and select an admin
   - Complete the Razorpay payment
   - Check for confirmation email

## Payment Verification Features

The system now includes enhanced payment verification for paid events:

### For Paid Events:
- **Payment Required**: Users must complete Razorpay payment before registration
- **QR Code Generation**: QR codes are only generated after successful payment verification
- **Payment Tracking**: All payment details are stored and tracked in the database
- **Email Confirmation**: Users receive confirmation emails with payment details

### For Free Events:
- **Direct Registration**: Users can register directly without payment
- **Immediate QR Code**: QR codes are generated immediately upon registration

### Payment Flow:
1. User clicks "Pay & Register" for paid events
2. User is redirected to EventPayment page
3. For "Open to All" events, user selects an admin
4. Razorpay payment is processed
5. Payment is verified on the backend
6. User is registered and QR code is generated
7. Confirmation email is sent

## Important Notes

- The Razorpay keys provided are test keys. For production, use live keys from your Razorpay dashboard.
- The Gmail SMTP password is an app-specific password. Make sure 2FA is enabled on the Gmail account.
- The frontend will automatically load the Razorpay script from the CDN (already added to index.html).
- QR codes for paid events are only accessible after payment verification. 