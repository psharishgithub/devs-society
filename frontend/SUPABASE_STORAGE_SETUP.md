# Supabase Storage Setup for Profile Photos

## Prerequisites

1. A Supabase project with storage enabled
2. Supabase client library installed (`@supabase/supabase-js`)

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Storage Bucket Setup

1. **Create Storage Bucket**
   - Go to your Supabase dashboard
   - Navigate to Storage
   - Create a new bucket called `profile-photos`
   - Set it to public (for profile photos)

2. **Configure Bucket Policies**
   - Go to Storage > Policies
   - Select the `profile-photos` bucket
   - Click "New Policy" for each policy below

### Policy 1: Allow authenticated users to upload
1. Click **"New Policy"**
2. **Policy name:** `Allow authenticated uploads`
3. **Allowed operation:** Select `INSERT`
4. **Target roles:** Leave empty (defaults to all)
5. **Policy definition:** Enter `(auth.role() = 'authenticated')`
6. Click **"Review"** then **"Save policy"**

### Policy 2: Allow public read access
1. Click **"New Policy"**
2. **Policy name:** `Allow public read access`
3. **Allowed operation:** Select `SELECT`
4. **Target roles:** Leave empty (defaults to all)
5. **Policy definition:** Enter `(true)`
6. Click **"Review"** then **"Save policy"**

### Policy 3: Allow users to update their own photos
1. Click **"New Policy"**
2. **Policy name:** `Allow authenticated updates`
3. **Allowed operation:** Select `UPDATE`
4. **Target roles:** Leave empty (defaults to all)
5. **Policy definition:** Enter `(auth.role() = 'authenticated')`
6. Click **"Review"** then **"Save policy"**

### Policy 4: Allow users to delete their own photos
1. Click **"New Policy"**
2. **Policy name:** `Allow authenticated deletes`
3. **Allowed operation:** Select `DELETE`
4. **Target roles:** Leave empty (defaults to all)
5. **Policy definition:** Enter `(auth.role() = 'authenticated')`
6. Click **"Review"** then **"Save policy"**

### Alternative: Using Policy Templates
If you prefer to use templates:
1. Click **"View templates"** in the policy creation form
2. For read policy: Select **"Enable read access to everyone"**
3. For upload policy: Select **"Enable insert for authenticated users only"**
4. For update policy: Select **"Enable update for authenticated users only"**
5. For delete policy: Select **"Enable delete for authenticated users only"**

## Features

- **File Validation**: Only image files (max 5MB) are accepted
- **Unique Naming**: Files are named with user ID and timestamp
- **Automatic Cleanup**: Old photos are deleted when new ones are uploaded
- **Preview**: Users can see a preview before uploading
- **Error Handling**: Comprehensive error messages for upload failures

## Usage

The profile photo upload is integrated into the Edit Profile modal in the Dashboard. Users can:

1. Click "Edit Profile" in the Dashboard
2. Click "Upload Photo" to select an image
3. See a preview of the selected image
4. Submit the form to upload the photo and update their profile

## File Structure

```
src/services/
├── supabaseStorage.ts    # Supabase storage API
└── api.ts               # Updated with photo upload methods

src/pages/
└── Dashboard.tsx        # Updated with photo upload UI
```

## Security Notes

- Only authenticated users can upload photos
- File size is limited to 5MB
- Only image files are accepted
- Old photos are automatically deleted when new ones are uploaded
- Public read access allows profile photos to be displayed without authentication 