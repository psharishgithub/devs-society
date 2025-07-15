"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
async function runPaymentMigration() {
    try {
        console.log('Running payment verification migration...');
        const supabase = (0, supabase_1.getSupabase)();
        // Add payment verification fields to event_registrations table
        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: `
        ALTER TABLE event_registrations 
        ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10) DEFAULT 'INR',
        ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP WITH TIME ZONE;
      `
        });
        if (alterError) {
            console.error('Error adding payment fields:', alterError);
            return;
        }
        // Add index for payment verification
        const { error: indexError } = await supabase.rpc('exec_sql', {
            sql: 'CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_verified ON event_registrations(payment_verified);'
        });
        if (indexError) {
            console.error('Error creating index:', indexError);
            return;
        }
        // Update existing registrations for free events to have payment_verified = true
        const { error: updateFreeError } = await supabase.rpc('exec_sql', {
            sql: `
        UPDATE event_registrations 
        SET payment_verified = true 
        WHERE event_id IN (SELECT id FROM events WHERE is_paid = false);
      `
        });
        if (updateFreeError) {
            console.error('Error updating free event registrations:', updateFreeError);
            return;
        }
        // Update existing registrations for paid events to have payment_verified = false
        const { error: updatePaidError } = await supabase.rpc('exec_sql', {
            sql: `
        UPDATE event_registrations 
        SET payment_verified = false 
        WHERE event_id IN (SELECT id FROM events WHERE is_paid = true);
      `
        });
        if (updatePaidError) {
            console.error('Error updating paid event registrations:', updatePaidError);
            return;
        }
        console.log('Payment verification migration completed successfully!');
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
}
// Run the migration
runPaymentMigration();
//# sourceMappingURL=runPaymentMigration.js.map