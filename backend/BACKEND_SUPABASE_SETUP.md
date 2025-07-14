# Backend Supabase Storage Setup

## Prerequisites

1. Supabase project with storage enabled
2. Backend dependencies installed (`@supabase/supabase-js`, `multer`)

## Environment Variables

Add the following variable to your backend `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### How to get the Service Role Key:

1. Go to your Supabase dashboard
2. Navigate to **Settings > API**
3. Copy the **service_role** key (not the anon key)
4. Add it to your `.env` file

## Storage Bucket Setup

1. **Create Storage Bucket**
   - Go to your Supabase dashboard
   - Navigate to Storage
   - Create a new bucket called `profile-photos`
   - Set it to public (for profile photos)

2. **Configure Bucket Policies**
   - Go to Storage > Buckets > profile-photos > Policies
   - Add the following policies:

### Policy 1: Allow service role to upload
1. Click **"New Policy"**
2. **Policy name:** `Allow service role uploads`
3. **Allowed operation:** Select `INSERT`
4. **Target roles:** Leave empty
5. **Policy definition:** `(bucket_id = 'profile-photos')`
6. Click **"Review"** then **"Save policy"**

### Policy 2: Allow public read access
1. Click **"New Policy"**
2. **Policy name:** `Allow public read access`
3. **Allowed operation:** Select `SELECT`
4. **Target roles:** Leave empty
5. **Policy definition:** `(bucket_id = 'profile-photos')`
6. Click **"Review"** then **"Save policy"**

### Policy 3: Allow service role to update
1. Click **"New Policy"**
2. **Policy name:** `Allow service role updates`
3. **Allowed operation:** Select `UPDATE`
4. **Target roles:** Leave empty
5. **Policy definition:** `(bucket_id = 'profile-photos')`
6. Click **"Review"** then **"Save policy"**

### Policy 4: Allow service role to delete
1. Click **"New Policy"**
2. **Policy name:** `Allow service role deletes`
3. **Allowed operation:** Select `DELETE`
4. **Target roles:** Leave empty
5. **Policy definition:** `(bucket_id = 'profile-photos')`
6. Click **"Review"** then **"Save policy"**

## Security Features

- **Backend-only Supabase access**: All Supabase operations happen in the backend
- **Service role key**: Uses the service role key for full access (keep this secret)
- **File validation**: Only image files (max 5MB) are accepted
- **Unique naming**: Files are named with user ID and timestamp
- **Automatic cleanup**: Old photos are deleted when new ones are uploaded
- **Error handling**: Comprehensive error messages for upload failures

## How it Works

1. **Frontend**: User selects an image file
2. **Frontend**: Sends image to backend via multipart form data
3. **Backend**: Validates the image file
4. **Backend**: Uploads to Supabase storage using service role key
5. **Backend**: Gets public URL and updates user profile
6. **Backend**: Returns updated user data to frontend

## File Structure

```
src/services/
├── supabaseStorage.ts    # Backend Supabase storage service
└── userService.ts        # User service (existing)

src/routes/
└── users.ts             # Updated with photo upload handling
```

## Security Notes

- Service role key has full access to Supabase - keep it secret
- All file validation happens in the backend
- Frontend never has direct access to Supabase storage
- Public read access allows profile photos to be displayed
- Automatic cleanup prevents storage bloat 