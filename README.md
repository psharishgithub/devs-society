# Devs Society Portal

A complete member portal system for the Devs Society with React frontend and Node.js backend, featuring the same UI design and effects as the main Devs Technical Society website.

## Features

- 🔐 **Member Authentication** - Simple email-based login system
- 📝 **Member Registration** - Complete registration form with photo upload
- 🎫 **Digital Membership Cards** - QR code-enabled digital cards
- 📅 **Event Management** - View and register for society events
- 📋 **Custom Event Forms** - Customizable registration forms for events
- 📱 **QR Code Check-ins** - Unique QR codes for event attendance tracking
- 👨‍💼 **Admin Management** - Multi-level admin system (Super Admin, College Admin)
- 🎨 **Modern UI** - Dark theme with cyan accents, particle effects, and glitch animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔒 **Security Features** - JWT authentication, input validation, file upload security
- 📊 **Analytics Dashboard** - Comprehensive analytics and reporting for Super Admins
- 🏢 **Internal Booking System** - Super Admins can register users for events internally

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **React Particles** for background effects
- **QR Code generation** for membership cards
- **Lucide React** for icons
- **HTML5 QR Scanner** for QR code scanning

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Supabase** (PostgreSQL) for database
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **QR Code generation** for event check-ins

## Quick Start

### Predefined Super Admin Login

A predefined super admin account is automatically created with the following credentials:

- **Email**: `admin@devs-society.com`
- **Username**: `superadmin`
- **Password**: `DevsSociety@2024!`

**⚠️ IMPORTANT**: Change this password immediately after first login!

Access the admin panel at: `/admin/login`

### Prerequisites
- Node.js (v18 or higher)
- Supabase account and project
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   cd portal.devs-society
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at: http://localhost:5173

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   
   # Create environment variables (copy from .env.example)
   # Set your Supabase credentials and JWT secret
   
   # Create the predefined super admin
   npx ts-node src/scripts/createSuperAdmin.ts
   
   npm run dev
   ```
   Backend API will be available at: http://localhost:5000

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## Deployment

### Frontend (Netlify)
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables in Netlify dashboard

### Backend (Render)
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables in Render dashboard

## Security Features

### Authentication & Authorization
- **JWT-based authentication** with secure token handling
- **Role-based access control** (Super Admin, College Admin, Member)
- **Protected routes** with middleware validation
- **Session management** with secure logout

### Input Validation & Sanitization
- **Express Validator** for all API endpoints
- **Frontend validation** for user inputs
- **SQL injection prevention** through parameterized queries
- **XSS protection** with proper content sanitization

### File Upload Security
- **File type validation** (images only: JPG, PNG)
- **File size limits** (max 2MB for profile photos)
- **Secure storage** in Supabase Storage with RLS policies
- **Virus scanning** recommendations for production

### CORS & API Security
- **Restricted CORS** to frontend domains only
- **Rate limiting** recommendations for production
- **Helmet.js** for security headers
- **Environment variable protection**

## Usage

### Admin Features

#### Super Admin
- **College Management**: Create, update, and manage colleges
- **Admin Management**: Create and assign college admins with batch years
- **Global User Management**: View and manage all users across colleges
- **Global Event Management**: Create and manage events for all colleges
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Internal Booking**: Register users for events internally (bypassing payment)
- **System Settings**: Configure portal-wide settings

#### College Admin
- **User Management**: Manage users from assigned college
- **Event Management**: Create college-specific events with custom forms
- **Event Check-ins**: QR code scanning for event attendance
- **Analytics**: View college-specific statistics and reports

### Event Management with Custom Forms

1. **Create Event**: Admins can create events with basic details and optional thumbnails
2. **Custom Forms**: Build registration forms with various field types:
   - Text input, Email, Phone, Number, Date
   - Dropdown selections, Checkboxes, Text areas
   - Required field validation
   - Custom field ordering
3. **Form Submissions**: Users fill out custom forms during event registration
4. **QR Code Generation**: Unique QR codes generated for each registration
5. **Check-in Process**: Admins scan QR codes or enter codes manually for attendance

### QR Code System

#### For Students
- **Automatic Generation**: QR codes generated upon event registration
- **Unique Codes**: Each registration gets a unique 16-character check-in code
- **Digital Access**: QR codes accessible through member portal
- **Event-Specific**: Each event registration has its own QR code

#### For Admins
- **Scanner Interface**: Built-in QR code scanner for check-ins
- **Manual Entry**: Alternative manual code entry for check-ins
- **Real-time Tracking**: Live check-in statistics and attendee lists
- **Check-in History**: Complete audit trail of all check-ins
- **Bulk Operations**: Support for bulk check-in operations

### For Members

1. **Registration**: Visit `/register` to create a new account
   - Fill in personal details (name, email, phone)
   - Select college and batch year
   - Choose member role
   - Upload profile photo (optional)

2. **Login**: Use `/login` with your registered email

3. **Dashboard**: After login, access your member portal with options to:
   - View your digital membership card
   - Check upcoming events
   - Manage your profile

4. **Digital Card**: Display your QR-enabled membership card for event check-ins

5. **Events**: View society events and register your attendance

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new member
- `POST /api/auth/login` - Login with email

#### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users/members` - List all members (protected)

#### Events
- `GET /api/events` - Get all events (protected)
- `GET /api/events/upcoming` - Get upcoming events (protected)
- `POST /api/events` - Create event (admin)
- `POST /api/events/:id/register` - Register for event (protected)
- `DELETE /api/events/:id/unregister` - Unregister from event (protected)

#### Event Forms
- `POST /api/event-forms/:eventId` - Create custom form for event (admin)
- `GET /api/event-forms/:eventId` - Get event registration form (public)
- `PUT /api/event-forms/form/:formId` - Update event form (admin)
- `POST /api/event-forms/:eventId/submit` - Submit form response (protected)
- `GET /api/event-forms/:eventId/submissions` - Get form submissions (admin)

#### QR Code & Check-ins
- `GET /api/qr-code/event/:eventId/my-qr` - Get user's QR code (protected)
- `POST /api/qr-code/check-in` - Process QR code check-in (admin)
- `POST /api/qr-code/check-in-by-code` - Manual code check-in (admin)
- `GET /api/qr-code/event/:eventId/check-ins` - Get check-in statistics (admin)

#### Admin Management
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile (admin)
- `GET /api/super-admin/colleges` - Manage colleges (super admin)
- `POST /api/super-admin/admins` - Create admin with college assignment (super admin)
- `GET /api/super-admin/dashboard` - Get dashboard statistics (super admin)
- `GET /api/super-admin/analytics` - Get analytics data (super admin)

#### Internal Booking (Super Admin)
- `POST /api/superadmin/internal-booking` - Create internal booking
- `GET /api/superadmin/internal-bookings` - List internal bookings

## Project Structure

```
portal.devs-society/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Base UI components (Button, Input, etc.)
│   │   │   ├── particles.tsx # Particle background effect
│   │   │   ├── loading-screen.tsx
│   │   │   ├── EventFormBuilder.tsx # Custom form builder
│   │   │   ├── QRCodeScanner.tsx    # QR code scanning interface
│   │   │   ├── QRScanner.tsx        # QR scanner component
│   │   │   ├── AdminDashboard.tsx   # Admin dashboard router
│   │   │   ├── SuperAdminDashboard.tsx # Super admin interface
│   │   │   └── CollegeAdminDashboard.tsx # College admin interface
│   │   ├── pages/           # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── Events.tsx
│   │   │   └── superadmin/
│   │   │       ├── Participation.tsx
│   │   │       └── InternalBooking.tsx
│   │   ├── services/        # API services
│   │   │   ├── api.ts       # Main API service
│   │   │   ├── adminApi.ts  # Admin API service
│   │   │   ├── eventApi.ts  # Event API service
│   │   │   ├── eventFormApi.ts # Event forms & QR API
│   │   │   └── superAdminApiService.ts # Super admin API
│   │   ├── lib/
│   │   │   └── utils.ts     # Utility functions
│   │   └── App.tsx          # Main app component
│   └── public/              # Static assets
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── models/          # Supabase database models
│   │   │   ├── User.ts
│   │   │   ├── Event.ts
│   │   │   ├── Admin.ts
│   │   │   └── College.ts
│   │   ├── services/        # Business logic services
│   │   │   ├── userService.ts
│   │   │   ├── eventService.ts
│   │   │   ├── adminService.ts
│   │   │   ├── collegeService.ts
│   │   │   ├── eventFormService.ts # Custom forms service
│   │   │   └── qrCodeService.ts    # QR code generation service
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── events.ts
│   │   │   ├── admin.ts
│   │   │   ├── superAdmin.ts
│   │   │   ├── collegeAdmin.ts
│   │   │   ├── eventForms.ts    # Event forms API
│   │   │   └── qrCode.ts        # QR code API
│   │   ├── database/        # Database configuration
│   │   │   ├── supabase.ts  # Supabase client
│   │   │   ├── schemas/     # Database schemas
│   │   │   └── migrations/  # Database migrations
│   │   ├── middleware/      # Custom middleware
│   │   │   ├── auth.ts
│   │   │   ├── adminAuth.ts
│   │   │   └── roleBasedAuth.ts # Admin authentication
│   │   ├── scripts/         # Utility scripts
│   │   │   ├── createSuperAdmin.ts # Super admin creation
│   │   │   └── setupUploads.ts # File upload setup
│   │   └── index.ts         # Server entry point
│   └── uploads/             # File upload directory
└── README.md
```

## Design Features

The portal inherits the beautiful design from the main Devs Technical Society website:

- **Dark Theme**: Black background with cyan (#0dcaf0) accents
- **Particle Effects**: Interactive particle background on all pages
- **Glitch Text**: Animated glitch effects on headings
- **Loading Animation**: Logo animation with glow effects
- **Gradient Cards**: Beautiful glass-morphism cards with gradients
- **Responsive Layout**: Mobile-first responsive design
- **Modern Typography**: Poppins and Orbitron fonts
- **Admin Interface**: Professional admin dashboards with role-based access
- **Form Builder**: Drag-and-drop interface for creating custom forms
- **QR Scanner**: Modern QR code scanning interface for check-ins
- **Analytics Dashboard**: Comprehensive data visualization and reporting

## Security Best Practices

### Environment Variables
- **Never commit secrets** to version control
- **Use .env files** for local development
- **Set environment variables** in deployment platforms
- **Separate public and private keys** (Supabase anon vs service role)

### File Uploads
- **Validate file types** (images only)
- **Limit file sizes** (max 2MB)
- **Use secure storage** (Supabase Storage with RLS)
- **Scan for malware** in production

### API Security
- **Validate all inputs** on both frontend and backend
- **Use HTTPS** in production
- **Implement rate limiting** for API endpoints
- **Set proper CORS** headers

### Database Security
- **Use Row Level Security** (RLS) in Supabase
- **Parameterized queries** to prevent SQL injection
- **Regular backups** of production data
- **Monitor access logs** for suspicious activity

## Known Issues & Limitations

### Camera-based QR Scanning
- **Issue**: Camera-based QR code scanning is not yet implemented
- **Current Solution**: Manual code entry is available and fully functional
- **Status**: Camera scanning will be added in a future update

### Database Migration
- **Note**: The system has been migrated from MongoDB to Supabase (PostgreSQL)
- **Requirement**: Run the database schema migration before first use
- **Command**: Execute the SQL files in `backend/src/database/schemas/` in your Supabase dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of the Devs Society ecosystem and follows the same licensing terms.

## Support

For support, please contact the Devs Society team or create an issue in the repository.

## Recent Updates

### Version 2.1 - Security & Analytics (Latest)
- ✅ Enhanced security with input validation and file upload protection
- ✅ Added comprehensive analytics dashboard for Super Admins
- ✅ Implemented internal booking system for Super Admins
- ✅ Improved mobile responsiveness across all pages
- ✅ Added event thumbnail support
- ✅ Enhanced QR code system with better error handling
- ✅ Updated branding with consistent DEVS logo styling
- ✅ Added deployment guides for Render and Netlify

### Version 2.0 - Event Management & QR System (13/07/25)
- ✅ Added predefined super admin login
- ✅ Implemented multi-level admin system (Super Admin, College Admin)
- ✅ Created customizable event registration forms
- ✅ Added QR code generation for event check-ins
- ✅ Built QR code scanning interface for admins
- ✅ Migrated from MongoDB to Supabase (PostgreSQL)
- ✅ Added batch year support for admin assignments
- ✅ Implemented college-specific user and event management
- ✅ Created comprehensive admin dashboards
- ✅ Added real-time check-in statistics and reporting

### Upcoming Features
- 📷 Camera-based QR code scanning
- 📊 Advanced analytics and reporting
- 📧 Email notifications for events
- 🔔 Push notifications
- 📱 Mobile app for QR scanning
- 🔐 Two-factor authentication
- 📈 Real-time dashboard updates

**Built with ❤️ by the Devs Society Team** 