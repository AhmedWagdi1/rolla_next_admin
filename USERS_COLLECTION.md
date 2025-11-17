# Users Collection - Custom Features

## Overview

The Users collection has been enhanced with specialized CRUD functionality beyond the generic collection view.

## Custom Features

### 1. Auto-Generated UID ✅
- **What**: User ID is automatically generated when creating new users
- **Format**: `user_[timestamp]_[random]`
- **Benefit**: No manual UID entry required, ensures uniqueness
- **Note**: UID field is not shown in the create/edit form

### 2. Auto-Managed Creation Time ✅
- **What**: `created_time` field uses Firebase server timestamp
- **Behavior**: 
  - Automatically set when creating new users
  - Cannot be edited or modified after creation
  - Displayed in human-readable format in the data grid
- **Format**: "MMM dd, yyyy HH:mm" (e.g., "Nov 17, 2025 14:30")

### 3. Boolean Supplier Toggle ✅
- **What**: `is_supplier` field uses a Switch component
- **UI**: Toggle switch (not text field)
- **Values**: true/false
- **Visual**: 
  - "Yes" chip (green) when true
  - "No" chip (gray) when false

### 4. Conditional Supplier Fields ✅
- **What**: Company name and logo only appear when `is_supplier` is true
- **Behavior**:
  - Toggle "Is Supplier" ON → Shows company fields
  - Toggle "Is Supplier" OFF → Hides and clears company fields
- **Fields**:
  - Company Name (required if supplier)
  - Company Logo (optional)

### 5. Image Upload for Company Logo ✅
- **What**: Direct file upload to Firebase Storage
- **Accepted Formats**: JPG, PNG, GIF
- **Max Size**: 5MB
- **Storage Path**: `users/[timestamp]_[filename]`
- **Features**:
  - Image preview with avatar
  - Upload progress indicator
  - Remove uploaded image option
  - Validation for file type and size
  - Public URL automatically saved to Firestore

## How to Use

### Creating a New User

1. Click "Add New User" button
2. Fill in required fields:
   - Email (required)
   - Display Name (optional)
3. Toggle "Is Supplier" if applicable
4. If supplier:
   - Enter Company Name (required)
   - Upload Company Logo (optional)
     - Click "Upload Company Logo"
     - Select image file (JPG, PNG, GIF, max 5MB)
     - Wait for upload to complete
     - Preview appears automatically
5. Click "Save"

**Auto-generated on save:**
- UID
- Created Time

### Editing an Existing User

1. Click edit icon (✏️) on user row
2. Modify any editable fields:
   - Email
   - Display Name
   - Is Supplier toggle
   - Company Name (if supplier)
   - Company Logo (if supplier)
3. Click "Save"

**Cannot be edited:**
- UID (auto-generated, immutable)
- Created Time (auto-set, immutable)

### Viewing Users

Data grid shows:
- UID (as chip badge)
- Email
- Display Name
- Supplier Status (Yes/No chip)
- Company Name (if applicable)
- Company Logo (avatar thumbnail)
- Created Time (formatted)
- Action buttons (Edit, Delete)

## Technical Details

### API Endpoints

Custom endpoints for Users collection:

```
POST   /api/collections/Users
GET    /api/collections/Users
PUT    /api/collections/Users/[id]
DELETE /api/collections/Users/[id]
POST   /api/upload (for images)
```

### Data Structure

```typescript
interface UserDocument {
  id: string;                    // Firestore document ID
  uid: string;                   // Auto-generated user identifier
  email: string;                 // Required
  display_name?: string;         // Optional
  is_supplier: boolean;          // Toggle
  company_name?: string;         // Required if is_supplier = true
  company_logo?: string;         // Image URL (if uploaded)
  created_time: Timestamp;       // Firebase server timestamp
}
```

### File Upload Process

1. User selects image file
2. Frontend validates:
   - File type (must be image/*)
   - File size (max 5MB)
3. Uploads to `/api/upload` endpoint
4. Backend:
   - Converts file to buffer
   - Uploads to Firebase Storage bucket
   - Makes file public
   - Returns public URL
5. Frontend saves URL to form data
6. URL saved to Firestore on form submit

### Storage Bucket

- **Bucket**: `rolla-q4037s.appspot.com`
- **Path Pattern**: `users/[timestamp]_[sanitized-filename]`
- **Access**: Public (read-only)
- **URL Format**: `https://storage.googleapis.com/rolla-q4037s.appspot.com/users/...`

## Validation Rules

### Client-Side
- Email: Required, must be valid email format
- Company Name: Required if `is_supplier = true`
- Image: Must be image type, max 5MB

### Server-Side
- Created time: Auto-set with `FieldValue.serverTimestamp()`
- Created time: Cannot be updated (removed from update data)
- UID: Auto-generated for new documents only

## Files Modified/Created

### New Files
- `/components/UsersCollectionView.tsx` - Custom Users CRUD component
- `/app/dashboard/collections/Users/page.tsx` - Users page
- `/app/api/collections/Users/route.ts` - Custom Users API
- `/app/api/collections/Users/[id]/route.ts` - Single user API
- `/app/api/upload/route.ts` - Image upload endpoint

### Modified Files
- `/lib/firebase-admin.ts` - Added Firebase Storage support

## Screenshots Reference

### Form States

**Non-Supplier User:**
- Email field
- Display Name field
- Is Supplier toggle (OFF)
- Info: "UID and creation time will be automatically generated"

**Supplier User:**
- Email field
- Display Name field
- Is Supplier toggle (ON)
- Company Name field (required)
- Company Logo upload section:
  - Avatar preview (if uploaded)
  - Upload button
  - File size/type info
  - Remove button (if image exists)

## Benefits

✅ Simplified user creation (no manual UID entry)
✅ Accurate timestamps (server-side)
✅ Intuitive boolean toggle
✅ Clean conditional UI
✅ Professional image upload
✅ Validation and error handling
✅ Better UX with preview and progress
✅ Consistent with Firebase best practices
