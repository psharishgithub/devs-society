# Devs Society Portal

A full-stack web application for managing dev society events, members, and activities.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + Express
- **Database**: Supabase (PostgreSQL)

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Environment files configured (see setup instructions below)

### Environment Setup

1. **Backend Environment**:
   ```bash
   cp backend/supabase.env.example backend/.env
   ```
   Edit `backend/.env` with your Supabase credentials and other configuration.

2. **Frontend Environment**:
   Create `frontend/.env` with your frontend-specific environment variables if needed.

### Running the Application

1. **Start all services**:
   ```bash
   docker-compose up --build
   ```

2. **Start in detached mode**:
   ```bash
   docker-compose up -d --build
   ```

3. **Stop all services**:
   ```bash
   docker-compose down
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f
   ```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5050

## Development

### Individual Services

To run services individually during development:

1. **Backend only**:
   ```bash
   docker-compose up backend
   ```

2. **Frontend only**:
   ```bash
   docker-compose up frontend
   ```

### Local Development

For local development without Docker:

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Configuration

### Environment Variables

#### Backend (.env)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: JWT signing secret
- `PORT`: Backend port (default: 5050)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay key secret
- `EMAIL_USER`: Email username for SMTP
- `EMAIL_PASS`: Email password for SMTP

#### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:5050)

## Database Setup

The application uses Supabase as the database. Refer to `backend/BACKEND_SUPABASE_SETUP.md` for detailed setup instructions.

## Deployment

### Cloud Deployment

1. **Build for production**:
   ```bash
   docker-compose -f docker-compose.yml build
   ```

2. **Push to registry**:
   ```bash
   docker tag devs-society-backend your-registry/devs-society-backend
   docker tag devs-society-frontend your-registry/devs-society-frontend
   docker push your-registry/devs-society-backend
   docker push your-registry/devs-society-frontend
   ```

### Platform-specific Builds

For different CPU architectures (e.g., ARM64 for Apple Silicon, AMD64 for cloud):

```bash
docker buildx build --platform linux/amd64 -t your-registry/devs-society-backend ./backend
docker buildx build --platform linux/amd64 -t your-registry/devs-society-frontend ./frontend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 5050 and 5173 are available
2. **Environment variables**: Check that all required environment variables are set
3. **Database connection**: Verify Supabase credentials and network connectivity
4. **File permissions**: Ensure upload directories have proper permissions

### Logs

Check container logs for debugging:
```bash
docker-compose logs backend
docker-compose logs frontend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker Compose
5. Submit a pull request

## License

This project is licensed under the ISC License.
