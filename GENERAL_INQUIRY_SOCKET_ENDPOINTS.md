# General Inquiry (1:1) System Documentation

This document describes all Socket.IO endpoints for the General Inquiry system, which enables direct 1:1 messaging between users and admins (not tied to orders).

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Socket.IO Endpoints](#socketio-endpoints)
  - [User Socket Endpoints](#user-socket-endpoints)
  - [Admin Socket Endpoints](#admin-socket-endpoints)
- [Broadcast Events](#broadcast-events)
- [Socket Rooms](#socket-rooms)
- [Data Structures](#data-structures)
- [Error Codes](#error-codes)
- [Examples](#examples)

---

## Overview

The General Inquiry system allows users to create inquiries and communicate directly with admins via real-time messaging. Unlike Order Inquiries, these are not tied to specific orders and can be used for general support, complaints, suggestions, technical issues, etc.

**Key Features:**
- Direct 1:1 messaging between users and admins
- Real-time message delivery via Socket.IO
- Inquiry assignment to specific admins
- Read receipts
- Message attachments (images, files, videos)
- Inquiry status management (open, closed, resolved)
- Unread message counts
- Inquiry categories (general, support, complaint, suggestion, technical)

---

## Authentication

- **User Authentication**: Required for all user endpoints (via JWT in Authorization header or socket auth token)
- **Admin Authentication**: Required for all admin endpoints (via JWT in Authorization header or socket auth token)
- **Admin Permission**: `general:inquiry` permission required for admin inquiry operations

---

## Socket.IO Endpoints

### User Socket Endpoints

#### Create General Inquiry

**Event:** `user:general-inquiry:create`

**Description:** Create a new general inquiry.

**Request:**
```typescript
{
  subject?: string; // Optional, max 200 characters
  category?: 'general' | 'support' | 'complaint' | 'suggestion' | 'technical';
  message: string; // Required
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  }>;
}
```

**Success Response:** `user:general-inquiry:create:success`
```typescript
{
  inquiry: {
    _id: string;
    subject?: string;
    category?: string;
    status: 'open' | 'closed' | 'resolved';
    messages: Array<{
      _id: string;
      senderType: 'user' | 'admin';
      senderId: string;
      senderName?: string;
      message: string;
      timestamp: string;
      readBy: string[];
      attachments?: Array<{
        type: string;
        url: string;
        name?: string;
      }>;
    }>;
    assignedAdmin?: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }
}
```

**Error Response:** `user:general-inquiry:create:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}
```

---

#### Send Message

**Event:** `user:general-inquiry:send-message`

**Description:** Send a message in an existing inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
  message: string; // Required
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  }>;
}
```

**Success Response:** `user:general-inquiry:message:success`
```typescript
{
  inquiry: {
    _id: string;
    messages: Array<{...}>;
    lastMessageAt: string;
  }
}
```

**Error Response:** `user:general-inquiry:message:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}
```

---

#### Get Inquiries List

**Event:** `user:general-inquiry:list`

**Description:** Get list of user's inquiries.

**Request:**
```typescript
{
  status?: 'open' | 'closed' | 'resolved'; // Optional filter
}
```

**Response:** `user:general-inquiry:list:response`
```typescript
{
  inquiries: Array<{
    _id: string;
    subject?: string;
    category?: string;
    status: string;
    assignedAdmin?: {
      _id: string;
      name: string;
      email: string;
    };
    lastMessageAt?: string;
    createdAt: string;
    messageCount: number;
  }>;
}
```

**Error Response:** `user:general-inquiry:list:error`
```typescript
{
  message: string;
  code: 'INTERNAL_ERROR';
}
```

---

#### Get Single Inquiry

**Event:** `user:general-inquiry:get`

**Description:** Get a specific inquiry with all messages.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

**Response:** `user:general-inquiry:get:response`
```typescript
{
  inquiry: {
    _id: string;
    subject?: string;
    category?: string;
    status: string;
    assignedAdmin?: {
      _id: string;
      name: string;
      email: string;
    };
    messages: Array<{...}>;
    lastMessageAt?: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

**Error Response:** `user:general-inquiry:get:error`
```typescript
{
  message: string;
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
}
```

---

#### Subscribe to Inquiry

**Event:** `user:general-inquiry:subscribe`

**Description:** Subscribe to real-time updates for a specific inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

**Success Response:** `user:general-inquiry:subscribe:success`
```typescript
{
  inquiryId: string;
  message: string;
}
```

---

#### Unsubscribe from Inquiry

**Event:** `user:general-inquiry:unsubscribe`

**Description:** Unsubscribe from inquiry updates.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

**Success Response:** `user:general-inquiry:unsubscribe:success`
```typescript
{
  inquiryId: string;
  message: string;
}
```

---

#### Mark Messages as Read

**Event:** `user:general-inquiry:mark-read`

**Description:** Mark all admin messages in an inquiry as read.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

**Success Response:** `user:general-inquiry:mark-read:success`
```typescript
{
  inquiryId: string;
  inquiry: {
    _id: string;
    messages: Array<{...}>;
  }
}
```

---

#### Close Inquiry

**Event:** `user:general-inquiry:close`

**Description:** Close an inquiry (user can only close their own inquiries).

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

**Success Response:** `user:general-inquiry:close:success`
```typescript
{
  inquiry: {
    _id: string;
    status: 'closed';
  }
}
```

---

#### Get Unread Count

**Event:** `user:general-inquiry:unread-count`

**Description:** Get total unread message count across all inquiries.

**Response:** `user:general-inquiry:unread-count:response`
```typescript
{
  count: number;
}
```

---

#### Get Unread Counts by Inquiry

**Event:** `user:general-inquiry:unread-counts`

**Description:** Get unread counts grouped by inquiry.

**Response:** `user:general-inquiry:unread-counts:response`
```typescript
{
  totalUnread: number;
  inquiries: Array<{
    inquiryId: string;
    unreadCount: number;
  }>;
}
```

---

### Admin Socket Endpoints

#### Create General Inquiry

**Event:** `admin:general-inquiry:create`

**Description:** Admin creates an inquiry for a user.

**Request:**
```typescript
{
  userId: string; // Required
  subject?: string;
  category?: 'general' | 'support' | 'complaint' | 'suggestion' | 'technical';
  message: string; // Required
  attachments?: Array<{...}>;
  autoAssign?: boolean; // Default: true
}
```

**Success Response:** `admin:general-inquiry:create:success`
```typescript
{
  inquiry: {
    _id: string;
    user: {...};
    subject?: string;
    category?: string;
    status: string;
    messages: Array<{...}>;
    assignedAdmin?: {...};
    createdAt: string;
  }
}
```

---

#### Get Inquiries List

**Event:** `admin:general-inquiry:list`

**Description:** Get list of inquiries with filters.

**Request:**
```typescript
{
  status?: 'open' | 'closed' | 'resolved';
  assignedAdmin?: string; // Admin ID
  unassigned?: boolean; // Get unassigned inquiries
  category?: string;
  page?: number; // Default: 1
  pageSize?: number; // Default: 20
}
```

**Response:** `admin:general-inquiry:list:response`
```typescript
{
  inquiries: Array<{
    _id: string;
    user: {...};
    subject?: string;
    category?: string;
    status: string;
    assignedAdmin?: {...};
    lastMessageAt?: string;
    createdAt: string;
    messageCount: number;
    unreadCount: number;
  }>;
  total: number;
  page: number;
  pageSize: number;
}
```

---

#### Get Single Inquiry

**Event:** `admin:general-inquiry:get`

**Description:** Get a specific inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

**Response:** `admin:general-inquiry:get:response`
```typescript
{
  inquiry: {
    _id: string;
    user: {...};
    subject?: string;
    category?: string;
    status: string;
    assignedAdmin?: {...};
    messages: Array<{...}>;
    lastMessageAt?: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

---

#### Assign Inquiry

**Event:** `admin:general-inquiry:assign`

**Description:** Assign an inquiry to an admin (or self).

**Request:**
```typescript
{
  inquiryId: string; // Required
  adminId?: string; // Optional, defaults to current admin
}
```

**Success Response:** `admin:general-inquiry:assign:success`
```typescript
{
  inquiry: {
    _id: string;
    assignedAdmin: {...};
    status: string;
  }
}
```

---

#### Send Message

**Event:** `admin:general-inquiry:send-message`

**Description:** Admin sends a message in an inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
  message: string; // Required
  attachments?: Array<{...}>;
}
```

**Success Response:** `admin:general-inquiry:message:success`
```typescript
{
  inquiry: {
    _id: string;
    messages: Array<{...}>;
    lastMessageAt: string;
  }
}
```

---

#### Subscribe to Inquiries

**Event:** `admin:general-inquiry:subscribe`

**Description:** Subscribe to all general inquiry updates.

**Response:** `admin:general-inquiry:subscribe:success`
```typescript
{
  message: string;
}
```

---

#### Subscribe to Specific Inquiry

**Event:** `admin:general-inquiry:subscribe:inquiry`

**Description:** Subscribe to a specific inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

---

#### Mark Messages as Read

**Event:** `admin:general-inquiry:mark-read`

**Description:** Mark all user messages in an inquiry as read.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

---

#### Close Inquiry

**Event:** `admin:general-inquiry:close`

**Description:** Close or resolve an inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
  status?: 'closed' | 'resolved'; // Default: 'closed'
}
```

---

#### Reopen Inquiry

**Event:** `admin:general-inquiry:reopen`

**Description:** Reopen a closed inquiry.

**Request:**
```typescript
{
  inquiryId: string; // Required
}
```

---

#### Get Unread Count

**Event:** `admin:general-inquiry:unread-count`

**Description:** Get total unread message count for admin.

**Response:** `admin:general-inquiry:unread-count:response`
```typescript
{
  count: number;
}
```

---

## Broadcast Events

### User Receives

- `user:general-inquiry:new` - New inquiry created by admin
- `user:general-inquiry:message:received` - New message received
- `user:general-inquiry:messages-read` - Admin read receipt
- `user:general-inquiry:closed` - Inquiry closed
- `user:general-inquiry:reopened` - Inquiry reopened

### Admin Receives

- `admin:general-inquiry:new` - New inquiry created
- `admin:general-inquiry:message:received` - New message received
- `admin:general-inquiry:assigned` - Inquiry assigned to admin
- `admin:general-inquiry:messages-read` - User read receipt
- `admin:general-inquiry:closed` - Inquiry closed
- `admin:general-inquiry:updated` - Inquiry updated

### Shared Events

- `general-inquiry:message:received` - Message received (broadcast to inquiry room)
- `general-inquiry:messages-read` - Read receipt (broadcast to inquiry room)
- `general-inquiry:closed` - Inquiry closed (broadcast to inquiry room)
- `general-inquiry:reopened` - Inquiry reopened (broadcast to inquiry room)
- `general-inquiry:admin-assigned` - Admin assigned (broadcast to inquiry room)

---

## Socket Rooms

### User Rooms
- `user:{userId}` - User's personal room
- `user:{userId}:general-inquiries` - User's general inquiries room
- `general-inquiry:{inquiryId}` - Specific inquiry room

### Admin Rooms
- `admin:{adminId}` - Admin's personal room
- `admin:general-inquiries` - All admins with general:inquiry permission
- `general-inquiry:{inquiryId}` - Specific inquiry room

---

## Data Structures

### Inquiry Categories
- `general` - General inquiries
- `support` - Support requests
- `complaint` - Complaints
- `suggestion` - Suggestions
- `technical` - Technical issues

### Inquiry Status
- `open` - Inquiry is open
- `closed` - Inquiry is closed
- `resolved` - Inquiry is resolved

### Message Structure
```typescript
{
  _id: string;
  senderType: 'user' | 'admin';
  senderId: string;
  senderName?: string;
  message: string;
  timestamp: string;
  readBy: string[]; // Array of user/admin IDs who read this message
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  }>;
}
```

---

## Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Inquiry not found
- `INTERNAL_ERROR` - Server error
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied

---

## Examples

### User: Create Inquiry

```javascript
socket.emit('user:general-inquiry:create', {
  subject: 'Payment Issue',
  category: 'support',
  message: 'I am having trouble processing my payment. Can you help?'
});

socket.on('user:general-inquiry:create:success', (data) => {
  console.log('Inquiry created:', data.inquiry);
});
```

### User: Send Message

```javascript
socket.emit('user:general-inquiry:send-message', {
  inquiryId: '507f1f77bcf86cd799439011',
  message: 'Thank you for your help!'
});

socket.on('user:general-inquiry:message:success', (data) => {
  console.log('Message sent:', data.inquiry);
});
```

### User: Receive Message

```javascript
socket.on('user:general-inquiry:message:received', (data) => {
  console.log('New message:', data.message);
  console.log('Unread count:', data.unreadCount);
  console.log('Total unread:', data.totalUnreadCount);
});
```

### Admin: Get Inquiries

```javascript
socket.emit('admin:general-inquiry:list', {
  status: 'open',
  unassigned: true,
  page: 1,
  pageSize: 20
});

socket.on('admin:general-inquiry:list:response', (data) => {
  console.log('Inquiries:', data.inquiries);
  console.log('Total:', data.total);
});
```

### Admin: Assign and Send Message

```javascript
// Assign inquiry
socket.emit('admin:general-inquiry:assign', {
  inquiryId: '507f1f77bcf86cd799439011'
});

// Send message
socket.emit('admin:general-inquiry:send-message', {
  inquiryId: '507f1f77bcf86cd799439011',
  message: 'I can help you with that. Let me check your account.'
});

socket.on('admin:general-inquiry:message:success', (data) => {
  console.log('Message sent:', data.inquiry);
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

### 2. User: Create and Manage Inquiries

```javascript
// Create inquiry
function createInquiry(subject, category, message) {
  socket.emit('user:general-inquiry:create', {
    subject,
    category,
    message
  });
}

// Subscribe to inquiry updates
socket.emit('user:general-inquiry:subscribe', {
  inquiryId: inquiryId
});

// Listen for new messages
socket.on('user:general-inquiry:message:received', (data) => {
  displayMessage(data.message);
  updateUnreadCount(data.unreadCount);
});

// Send message
function sendMessage(inquiryId, message) {
  socket.emit('user:general-inquiry:send-message', {
    inquiryId,
    message
  });
}

// Mark as read
socket.emit('user:general-inquiry:mark-read', {
  inquiryId: inquiryId
});
```

### 3. Admin: Manage Inquiries

```javascript
// Subscribe to all inquiries
socket.emit('admin:general-inquiry:subscribe');

// Get inquiries list
socket.emit('admin:general-inquiry:list', {
  status: 'open',
  page: 1,
  pageSize: 20
});

// Assign inquiry
socket.emit('admin:general-inquiry:assign', {
  inquiryId: inquiryId
});

// Send message
socket.emit('admin:general-inquiry:send-message', {
  inquiryId: inquiryId,
  message: message
});

// Listen for new inquiries
socket.on('admin:general-inquiry:new', (data) => {
  addInquiryToList(data.inquiry);
});

// Listen for new messages
socket.on('admin:general-inquiry:message:received', (data) => {
  displayMessage(data.message);
});
```

---

## Best Practices

1. **Subscribe to Inquiries**: Always subscribe to an inquiry when viewing it to receive real-time updates
2. **Mark as Read**: Mark messages as read when user views them
3. **Error Handling**: Always handle error events and provide user feedback
4. **Unread Counts**: Update unread counts in real-time for better UX
5. **Inquiry Status**: Use appropriate status (open, closed, resolved) to track inquiry lifecycle
6. **Categories**: Use categories to help organize and prioritize inquiries
7. **Attachments**: Support file attachments for better communication

---

## Notes

- Inquiries are separate from Order Inquiries
- Users can only access their own inquiries
- Admins need `general:inquiry` permission
- Inquiries automatically reopen when new messages are sent
- Read receipts are sent when messages are marked as read
- Unread counts are calculated in real-time

