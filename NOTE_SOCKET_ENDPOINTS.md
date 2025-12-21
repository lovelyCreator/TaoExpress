# Note (Broadcast) System Documentation

This document describes all Socket.IO endpoints for the Note (Broadcast) system, which allows admins to create and broadcast announcements/notifications to all connected users in real-time.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Socket.IO Endpoints](#socketio-endpoints)
  - [Admin Socket Endpoints](#admin-socket-endpoints)
  - [User Socket Events (Receive Only)](#user-socket-events-receive-only)
- [Socket Rooms](#socket-rooms)
- [Data Structures](#data-structures)
- [Error Codes](#error-codes)
- [Examples](#examples)

---

## Overview

The Note system allows admins to create and broadcast announcements, maintenance notices, updates, warnings, info messages, and promotions to all connected users in real-time via Socket.IO.

**Key Features:**
- Real-time broadcasting to all connected users
- Multiple note types (announcement, maintenance, update, warning, info, promotion)
- Priority levels (low, normal, high, urgent)
- Permanent storage in database
- Only new notes are shown to users (no history)
- Admin-only creation and management

---

## Authentication

- **Admin Authentication**: Required for all admin endpoints (via JWT in Authorization header or socket auth token)
- **Admin Permission**: `notes:create` permission required for admin note operations
- **User Authentication**: Users automatically receive broadcasts when connected (no action required)

---

## Socket.IO Endpoints

### Admin Socket Endpoints

All admin endpoints require authentication and `notes:create` permission.

#### Create Note

**Event:** `admin:note:create`

**Description:** Create a new note and automatically broadcast it to all connected users.

**Request:**
```typescript
{
  type: 'announcement' | 'maintenance' | 'update' | 'warning' | 'info' | 'promotion';
  content: string; // Required, max 5000 characters
  expiresAt?: string; // Optional ISO date string
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Default: 'normal'
  targetAudience?: 'all' | 'users' | 'admins'; // Default: 'all'
}
```

**Success Response:** `admin:note:create:success`
```typescript
{
  note: {
    _id: string;
    type: string;
    content: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdByName: string;
    priority: string;
    targetAudience: string;
    expiresAt?: string;
    createdAt: string;
  }
}
```

**Error Response:** `admin:note:create:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}
```

---

#### Get Notes List

**Event:** `admin:note:list`

**Description:** Get a paginated list of all notes (for admin management).

**Request:**
```typescript
{
  type?: 'announcement' | 'maintenance' | 'update' | 'warning' | 'info' | 'promotion';
  isActive?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience?: 'all' | 'users' | 'admins';
  page?: number; // Default: 1
  pageSize?: number; // Default: 20
}
```

**Response:** `admin:note:list:response`
```typescript
{
  notes: Array<{
    _id: string;
    type: string;
    content: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdByName: string;
    isActive: boolean;
    expiresAt?: string;
    priority: string;
    targetAudience: string;
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
}
```

**Error Response:** `admin:note:list:error`
```typescript
{
  message: string;
  code: 'INTERNAL_ERROR';
}
```

---

#### Get Single Note

**Event:** `admin:note:get`

**Description:** Get a specific note by ID.

**Request:**
```typescript
{
  noteId: string; // Required
}
```

**Response:** `admin:note:get:response`
```typescript
{
  note: {
    _id: string;
    type: string;
    content: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdByName: string;
    isActive: boolean;
    expiresAt?: string;
    priority: string;
    targetAudience: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

**Error Response:** `admin:note:get:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
}
```

---

#### Update Note

**Event:** `admin:note:update`

**Description:** Update an existing note. If the note is active, it will be rebroadcast to all users.

**Request:**
```typescript
{
  noteId: string; // Required
  type?: 'announcement' | 'maintenance' | 'update' | 'warning' | 'info' | 'promotion';
  content?: string; // Max 5000 characters
  expiresAt?: string; // ISO date string
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience?: 'all' | 'users' | 'admins';
}
```

**Success Response:** `admin:note:update:success`
```typescript
{
  note: {
    _id: string;
    type: string;
    content: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdByName: string;
    isActive: boolean;
    expiresAt?: string;
    priority: string;
    targetAudience: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

**Error Response:** `admin:note:update:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}
```

---

#### Delete Note

**Event:** `admin:note:delete`

**Description:** Soft delete a note (sets isActive to false). Users will be notified of the deletion.

**Request:**
```typescript
{
  noteId: string; // Required
}
```

**Success Response:** `admin:note:delete:success`
```typescript
{
  noteId: string;
}
```

**Error Response:** `admin:note:delete:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}
```

---

### User Socket Events (Receive Only)

Users automatically join the `notes:broadcast` room when they connect. They receive broadcasts but cannot create or manage notes.

#### Receive Note Broadcast

**Event:** `note:broadcast`

**Description:** Real-time broadcast when an admin creates or updates a note.

**Payload:**
```typescript
{
  noteId: string;
  type: 'announcement' | 'maintenance' | 'update' | 'warning' | 'info' | 'promotion';
  content: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdByName: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'users' | 'admins';
  createdAt: string;
  updatedAt?: string;
}
```

---

#### Receive Note Deletion Notification

**Event:** `note:deleted`

**Description:** Notification when an admin deletes a note.

**Payload:**
```typescript
{
  noteId: string;
}
```

---

## Socket Rooms

### Admin Rooms
- No specific rooms for admins (they emit to `notes:broadcast` room)

### User Rooms
- `notes:broadcast` - All users automatically join this room on connection to receive note broadcasts

---

## Data Structures

### Note Types
- `announcement` - General announcements
- `maintenance` - Maintenance notices
- `update` - System updates
- `warning` - Important warnings
- `info` - Informational messages
- `promotion` - Promotional messages

### Priority Levels
- `low` - Low priority
- `normal` - Normal priority (default)
- `high` - High priority
- `urgent` - Urgent priority

### Target Audience
- `all` - All users and admins (default)
- `users` - Only users
- `admins` - Only admins

---

## Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Note not found
- `INTERNAL_ERROR` - Server error
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied

---

## Examples

### Admin: Create and Broadcast a Note

```javascript
// Admin creates a maintenance notice
socket.emit('admin:note:create', {
  type: 'maintenance',
  content: 'Scheduled maintenance on December 25, 2024 from 2:00 AM to 4:00 AM KST',
  priority: 'high',
  targetAudience: 'all'
});

// Listen for success
socket.on('admin:note:create:success', (data) => {
  console.log('Note created:', data.note);
  // Note is automatically broadcast to all users
});

// Listen for errors
socket.on('admin:note:create:error', (error) => {
  console.error('Error:', error.message);
});
```

### User: Receive Note Broadcast

```javascript
// Users automatically receive broadcasts when connected
socket.on('note:broadcast', (data) => {
  console.log('New note received:', data);
  
  // Display note to user based on type and priority
  if (data.type === 'maintenance' && data.priority === 'urgent') {
    showUrgentMaintenanceNotice(data);
  } else if (data.type === 'promotion') {
    showPromotionBanner(data);
  } else {
    showNotification(data);
  }
});

// Listen for note deletions
socket.on('note:deleted', (data) => {
  console.log('Note deleted:', data.noteId);
  // Remove note from UI if displayed
});
```

### Admin: Get Notes List

```javascript
socket.emit('admin:note:list', {
  type: 'announcement',
  isActive: true,
  page: 1,
  pageSize: 20
});

socket.on('admin:note:list:response', (data) => {
  console.log('Notes:', data.notes);
  console.log('Total:', data.total);
});
```

### Admin: Update Note

```javascript
socket.emit('admin:note:update', {
  noteId: '507f1f77bcf86cd799439011',
  content: 'Updated maintenance time: December 25, 2024 from 3:00 AM to 5:00 AM KST',
  priority: 'urgent'
});

socket.on('admin:note:update:success', (data) => {
  console.log('Note updated:', data.note);
  // Note is automatically rebroadcast to all users if active
});
```

---

## Frontend Implementation Guide

### 1. Connect to Socket.IO

```javascript
import io from 'socket.io-client';

const socket = io('http://your-server-url', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### 2. Listen for Note Broadcasts (Users)

```javascript
socket.on('note:broadcast', (note) => {
  // Handle different note types
  switch (note.type) {
    case 'announcement':
      showAnnouncement(note);
      break;
    case 'maintenance':
      showMaintenanceNotice(note);
      break;
    case 'warning':
      showWarning(note);
      break;
    case 'promotion':
      showPromotion(note);
      break;
    default:
      showNotification(note);
  }
});

socket.on('note:deleted', (data) => {
  // Remove note from UI
  removeNoteFromUI(data.noteId);
});
```

### 3. Admin: Create Note

```javascript
function createNote(type, content, priority = 'normal') {
  socket.emit('admin:note:create', {
    type,
    content,
    priority,
    targetAudience: 'all'
  });
}

socket.on('admin:note:create:success', (data) => {
  console.log('Note created and broadcasted:', data.note);
});

socket.on('admin:note:create:error', (error) => {
  alert('Error: ' + error.message);
});
```

### 4. Admin: Manage Notes

```javascript
// Get all notes
socket.emit('admin:note:list', { page: 1, pageSize: 20 });

socket.on('admin:note:list:response', (data) => {
  displayNotesList(data.notes);
});

// Update note
socket.emit('admin:note:update', {
  noteId: noteId,
  content: newContent,
  priority: 'high'
});

// Delete note
socket.emit('admin:note:delete', { noteId: noteId });
```

---

## Best Practices

1. **Note Content**: Keep content concise and clear. Maximum 5000 characters.
2. **Priority Usage**: 
   - Use `urgent` sparingly for critical issues
   - Use `high` for important announcements
   - Use `normal` for regular updates
   - Use `low` for informational messages
3. **Type Selection**: Choose the appropriate type to help users understand the context
4. **Expiration**: Set expiration dates for time-sensitive notes
5. **User Experience**: Display notes prominently based on priority and type
6. **Error Handling**: Always handle error events and provide user feedback

---

## Notes

- Notes are stored permanently in the database
- Only new notes are shown to users (no history retrieval)
- Notes are automatically broadcast to all connected users when created/updated
- Users must be connected to receive broadcasts (no offline delivery)
- Expired notes are automatically filtered out from active notes

