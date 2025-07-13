import fs from 'fs'
import path from 'path'

async function setupUploads() {
  try {
    console.log('📁 Setting up uploads directory...')
    
    const uploadsDir = path.join(__dirname, '../../uploads')
    const photosDir = path.join(uploadsDir, 'photos')
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
      console.log('✅ Created uploads directory')
    } else {
      console.log('✅ Uploads directory already exists')
    }
    
    // Create photos subdirectory if it doesn't exist
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true })
      console.log('✅ Created photos directory')
    } else {
      console.log('✅ Photos directory already exists')
    }
    
    console.log('🎉 Uploads directory setup completed!')
    console.log('📂 Path:', photosDir)
    
  } catch (error) {
    console.error('❌ Error setting up uploads directory:', error)
    process.exit(1)
  }
}

// Run the script
setupUploads()
  .then(() => {
    console.log('\n✅ Setup completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  }) 