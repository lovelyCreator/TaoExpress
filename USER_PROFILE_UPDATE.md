# User Profile Update - Frontend Guide

## Endpoint
```
PUT /api/v1/users/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

## Request Format

Use `FormData` to send the request. All fields are optional.

### Form Fields
- `user_id` (string) - Display ID
- `phone` (string) - Phone number
- `gender` (string) - `male`, `female`, or `other`
- `birthday` (string) - ISO date format: `YYYY-MM-DD`
- `isBusiness` (boolean) - Business account flag
- `picture` (file) - Profile picture (jpg, png, gif, webp, max 5MB)

## JavaScript Example

```javascript
const updateProfile = async (data, pictureFile) => {
  const formData = new FormData();
  
  // Add text fields
  if (data.user_id) formData.append('user_id', data.user_id);
  if (data.phone) formData.append('phone', data.phone);
  if (data.gender) formData.append('gender', data.gender);
  if (data.birthday) formData.append('birthday', data.birthday);
  if (data.isBusiness !== undefined) formData.append('isBusiness', data.isBusiness);
  
  // Add picture file
  if (pictureFile) formData.append('picture', pictureFile);
  
  const response = await fetch('/api/v1/users/profile', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type - browser sets it automatically
    },
    body: formData
  });
  
  return await response.json();
};
```

## React Example

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('phone', phone);
  formData.append('gender', gender);
  if (pictureFile) formData.append('picture', pictureFile);
  
  const res = await fetch('/api/v1/users/profile', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const result = await res.json();
  console.log(result.data.user);
};
```

## Axios Example

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('phone', '+1234567890');
formData.append('picture', file);

await axios.put('/api/v1/users/profile', formData, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "pictureUrl": "https://api.example.com/api/files/profiles/images/...",
      // ... other user fields
    }
  }
}
```

## Notes
- Use `FormData` for multipart/form-data
- Don't manually set `Content-Type` header (browser handles it)
- Picture field name is `picture` (not `pictureUrl`)
- Old picture is automatically deleted when uploading new one

