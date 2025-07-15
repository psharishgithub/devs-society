"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
async function runEventPhotoMigration() {
    const supabase = (0, supabase_1.getSupabase)();
    try {
        console.log('🔄 Running event photo migration...');
        // Check if photo_url column exists
        const { data: columns, error: columnError } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'events')
            .eq('column_name', 'photo_url');
        if (columnError) {
            console.error('❌ Error checking columns:', columnError);
            return;
        }
        if (columns && columns.length > 0) {
            console.log('✅ photo_url column already exists');
        }
        else {
            console.log('📝 Adding photo_url column...');
            // Add the column using raw SQL
            const { error: alterError } = await supabase.rpc('exec_sql', {
                sql: `
          ALTER TABLE events 
          ADD COLUMN IF NOT EXISTS photo_url TEXT;
          
          COMMENT ON COLUMN events.photo_url IS 'URL to the event thumbnail/photo image stored in Supabase storage';
        `
            });
            if (alterError) {
                console.error('❌ Error adding photo_url column:', alterError);
                return;
            }
            console.log('✅ photo_url column added successfully');
        }
        // Test the column by updating an existing event
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('id, title, photo_url')
            .limit(1);
        if (eventsError) {
            console.error('❌ Error fetching events:', eventsError);
            return;
        }
        if (events && events.length > 0) {
            const testEvent = events[0];
            console.log('📋 Test event:', {
                id: testEvent.id,
                title: testEvent.title,
                photo_url: testEvent.photo_url
            });
            // Test updating photo_url
            const { error: updateError } = await supabase
                .from('events')
                .update({ photo_url: 'https://example.com/test-photo.jpg' })
                .eq('id', testEvent.id);
            if (updateError) {
                console.error('❌ Error updating photo_url:', updateError);
                return;
            }
            console.log('✅ photo_url update test successful');
            // Reset the test value
            await supabase
                .from('events')
                .update({ photo_url: null })
                .eq('id', testEvent.id);
            console.log('✅ photo_url reset successful');
        }
        console.log('🎉 Event photo migration completed successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
}
// Run the migration
runEventPhotoMigration()
    .then(() => {
    console.log('Migration script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=runEventPhotoMigration.js.map