import { initializeSupabase } from '../database/supabase'
import UserService from '../services/userService'
import EventService from '../services/eventService'
import AdminService from '../services/adminService'
import CollegeService from '../services/collegeService'

// Initialize Supabase
const supabase = initializeSupabase()

const testPricing = async () => {
  try {
    console.log('🧪 Testing Personalized Pricing System...\n')

    // 1. Get all events
    console.log('📋 Getting all events...')
    const events = await EventService.getAllEvents()
    console.log(`Found ${events.length} events`)

    // 2. Get a test user (first user in the system)
    console.log('\n👤 Getting test user...')
    const usersResponse = await UserService.getAllUsers()
    if (usersResponse.users.length === 0) {
      console.log('❌ No users found in the system')
      return
    }
    const testUser = usersResponse.users[0]
    console.log(`Test user: ${testUser.fullName} (${testUser.college}, Batch ${testUser.batchYear})`)

    // 3. Get user's college info
    console.log('\n🏫 Getting college info...')
    let userCollege = null
    if (testUser.collegeRef) {
      userCollege = await CollegeService.findById(testUser.collegeRef)
      console.log(`College: ${userCollege?.name} (${userCollege?.code})`)
    } else {
      console.log('⚠️  User has no college reference')
    }

    // 4. Get admins for user's college
    console.log('\n👨‍💼 Getting college admins...')
    let collegeAdmins: any[] = []
    if (userCollege) {
      collegeAdmins = await AdminService.getAdminsByCollege(userCollege.id, true)
      console.log(`Found ${collegeAdmins.length} admins for ${userCollege.name}:`)
      collegeAdmins.forEach(admin => {
        console.log(`  - ${admin.fullName} (Batch ${admin.batchYear})`)
      })
    }

    // 5. Test pricing for each event
    console.log('\n💰 Testing pricing for each event...')
    for (const event of events) {
      console.log(`\n📅 Event: ${event.title}`)
      console.log(`   Type: ${event.eventType}`)
      console.log(`   Is Paid: ${event.isPaid}`)
      console.log(`   Base Price: ₹${event.price}`)
      console.log(`   Admin Pricing: ${JSON.stringify(event.adminPricing)}`)

      if (event.isPaid) {
        if (event.eventType === 'open-to-all' && event.adminPricing && event.adminPricing.length > 0) {
          if (userCollege) {
            // Find admin that matches user's batch year
            const matchingAdmin = collegeAdmins.find(admin => 
              admin.batchYear?.toString() === testUser.batchYear
            )
            
            if (matchingAdmin) {
              // Find the pricing for this admin
              const adminPricing = event.adminPricing.find(p => p.adminId === matchingAdmin.id)
              if (adminPricing) {
                console.log(`   ✅ Personalized Price: ₹${adminPricing.amount} (${matchingAdmin.fullName})`)
              } else {
                console.log(`   ❌ No pricing found for admin ${matchingAdmin.fullName}`)
              }
            } else {
              console.log(`   ❌ No admin found for batch year ${testUser.batchYear}`)
            }
          } else {
            console.log(`   ❌ User has no college reference`)
          }
        } else if (event.eventType === 'college-specific') {
          if (userCollege && event.targetCollege === userCollege.id) {
            console.log(`   ✅ College-specific price: ₹${event.price}`)
          } else {
            console.log(`   ❌ User not from target college`)
          }
        }
      } else {
        console.log(`   ✅ Free event`)
      }
    }

    console.log('\n✅ Pricing test completed!')

  } catch (error) {
    console.error('❌ Error testing pricing:', error)
  }
}

// Run the test
testPricing()
  .then(() => {
    console.log('\n🎉 Test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  }) 