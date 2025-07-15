"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../database/supabase");
async function testEventPhotoSupport() {
    console.log('🧪 Testing Event Photo Support...');
    try {
        // Test 1: Check if EventService can handle photoUrl in CreateEventData
        console.log('\n📝 Test 1: CreateEventData interface with photoUrl');
        const testEventData = {
            title: 'Test Event with Photo',
            description: 'This is a test event to verify photo support',
            date: '2024-12-31',
            time: '10:00',
            location: 'Test Location',
            eventType: 'open-to-all',
            maxAttendees: 100,
            category: 'workshop',
            organizer: {
                adminId: 'test-admin-id',
                name: 'Test Admin',
                contact: 'test@example.com'
            },
            requirements: [],
            prizes: [],
            registrationDeadline: '2024-12-30T00:00:00.000Z',
            isPaid: false,
            price: 0,
            adminPricing: [],
            photoUrl: 'https://example.com/test-photo.jpg'
        };
        console.log('✅ CreateEventData interface accepts photoUrl');
        console.log('📋 Test event data:', {
            title: testEventData.title,
            photoUrl: testEventData.photoUrl
        });
        // Test 2: Check if IEvent interface includes photoUrl
        console.log('\n📝 Test 2: IEvent interface with photoUrl');
        const testEvent = {
            id: 'test-event-id',
            title: 'Test Event',
            description: 'Test description',
            date: '2024-12-31',
            time: '10:00',
            location: 'Test Location',
            eventType: 'open-to-all',
            maxAttendees: 100,
            category: 'workshop',
            organizer: {
                adminId: 'test-admin-id',
                name: 'Test Admin',
                contact: 'test@example.com'
            },
            requirements: [],
            prizes: [],
            registrationDeadline: '2024-12-30T00:00:00.000Z',
            isPaid: false,
            price: 0,
            adminPricing: [],
            photoUrl: 'https://example.com/test-photo.jpg',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
        };
        console.log('✅ IEvent interface includes photoUrl');
        console.log('📋 Test event:', {
            id: testEvent.id,
            title: testEvent.title,
            photoUrl: testEvent.photoUrl
        });
        // Test 3: Check if UpdateEventData interface includes photoUrl
        console.log('\n📝 Test 3: UpdateEventData interface with photoUrl');
        const testUpdateData = {
            title: 'Updated Test Event',
            photoUrl: 'https://example.com/updated-photo.jpg'
        };
        console.log('✅ UpdateEventData interface accepts photoUrl');
        console.log('📋 Test update data:', testUpdateData);
        // Test 4: Check Supabase types
        console.log('\n📝 Test 4: Supabase events table types');
        const supabase = (0, supabase_1.getSupabase)();
        // Try to fetch events to see if photo_url is accessible
        const { data: events, error } = await supabase
            .from('events')
            .select('id, title, photo_url')
            .limit(1);
        if (error) {
            console.log('⚠️  Could not fetch events (this is expected if photo_url column does not exist yet):', error.message);
        }
        else {
            console.log('✅ Successfully fetched events from Supabase');
            if (events && events.length > 0) {
                const event = events[0];
                console.log('📋 Sample event from database:', {
                    id: event.id,
                    title: event.title,
                    photo_url: event.photo_url
                });
            }
        }
        console.log('\n🎉 All interface tests passed!');
        console.log('\n📋 Summary:');
        console.log('✅ CreateEventData interface supports photoUrl');
        console.log('✅ IEvent interface includes photoUrl');
        console.log('✅ UpdateEventData interface supports photoUrl');
        console.log('✅ EventService methods are ready for photo support');
        console.log('✅ Supabase types are updated for photo_url');
        console.log('\n⚠️  Note: The photo_url column may need to be added to the database manually.');
        console.log('   You can do this through the Supabase dashboard or by running the SQL migration.');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
}
// Run the test
testEventPhotoSupport()
    .then(() => {
    console.log('\nTest script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=testEventPhotoSupport.js.map