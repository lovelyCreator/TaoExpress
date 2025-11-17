# Pusher Integration Guide

This guide explains how to configure and use the Pusher test screen for real-time communication with your Laravel backend.

## Prerequisites

1. Pusher account (https://pusher.com)
2. Laravel backend with Pusher integration
3. Expo project with Pusher JS library installed

## Installation

1. Install the Pusher JS library:
```bash
npm install pusher-js
```

2. For React Native, also install the React Native specific version:
```bash
npm install pusher-js/react-native
```

## Configuration

### 1. Update Pusher Configuration

In `src/screens/main/PusherTestScreen.tsx`, update the following constants:

```javascript
const pusher = new Pusher('YOUR_PUSHER_APP_KEY', {
  cluster: 'YOUR_PUSHER_CLUSTER', // e.g., 'us2', 'eu', etc.
  forceTLS: true,
});
```

### 2. Update Laravel API Endpoint

Update the API endpoint for sending test events:

```javascript
const response = await fetch('YOUR_LARAVEL_API_ENDPOINT/pusher/test', {
  // ... method and headers
});
```

### 3. Add Authentication (if required)

If your Laravel API requires authentication, add the appropriate headers:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  // or
  'X-Requested-With': 'XMLHttpRequest',
  // or any other auth headers your API expects
},
```

## Usage

### 1. Basic Usage

1. Open the Pusher Test screen in your app
2. Check the connection status (should show "initialized")
3. Enter your channel name and event name
4. Tap "Subscribe" to connect to the channel
5. Connection status should change to "subscribed"

### 2. Testing Events

1. Enter a test message in the text area
2. Tap "Send Test Event"
3. This will send a POST request to your Laravel backend
4. Your Laravel backend should broadcast the event to Pusher
5. The event should appear in the "Received Events" list

### 3. Receiving Events

When your Laravel backend broadcasts events to Pusher:
1. They will automatically appear in the "Received Events" list
2. You'll also get an alert with the event data
3. Events are stored with timestamps for debugging

## Laravel Backend Integration

### 1. Broadcasting Events

In your Laravel backend, create a broadcasted event:

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class TestEvent implements ShouldBroadcast
{
    use InteractsWithSockets, SerializesModels;

    public $message;
    public $data;

    public function __construct($message, $data = [])
    {
        $this->message = $message;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new Channel('test-channel');
    }

    public function broadcastAs()
    {
        return 'test-event';
    }
}
```

### 2. Broadcasting from Controller

```php
<?php

namespace App\Http\Controllers;

use App\Events\TestEvent;
use Illuminate\Http\Request;

class PusherTestController extends Controller
{
    public function sendTestEvent(Request $request)
    {
        $message = $request->input('message');
        $channel = $request->input('channel', 'test-channel');
        $event = $request->input('event', 'test-event');
        
        // Broadcast the event
        broadcast(new TestEvent($message, [
            'channel' => $channel,
            'event' => $event,
            'timestamp' => now()->toISOString(),
            'data' => $request->except(['message', 'channel', 'event'])
        ]));
        
        return response()->json(['status' => 'success', 'message' => 'Event broadcasted']);
    }
}
```

### 3. API Route

Add the route to your `routes/api.php`:

```php
Route::post('/pusher/test', [PusherTestController::class, 'sendTestEvent']);
```

## Troubleshooting

### 1. Connection Issues

- Verify your Pusher app key and cluster
- Check your internet connection
- Ensure your Laravel backend is properly configured
- Check the Pusher dashboard for connection logs

### 2. Event Not Receiving

- Verify channel and event names match exactly
- Check that your Laravel event is properly broadcasting
- Ensure your frontend is subscribed to the correct channel
- Check Pusher dashboard for event logs

### 3. Authentication Errors

- Verify your auth headers are correct
- Check that your Laravel API middleware allows the request
- Ensure CORS settings are properly configured

## Security Considerations

1. Never expose your Pusher app secret in frontend code
2. Use private channels for sensitive data
3. Implement proper authentication for your Laravel API
4. Validate all incoming data from the frontend

## Customization

You can customize the Pusher test screen by:

1. Adding more event types
2. Implementing private channels
3. Adding presence channel support
4. Integrating with your existing notification system
5. Adding more detailed event logging

## Example Integration with Existing App

To integrate Pusher with your existing chat system:

1. Create specific channels for each chat room
2. Broadcast new messages to the appropriate channel
3. Listen for message events in your chat components
4. Update the UI in real-time when messages are received

Example:
```javascript
// In your chat component
useEffect(() => {
  const channel = pusher.subscribe(`chat-${chatId}`);
  
  channel.bind('new-message', (data) => {
    // Add new message to chat
    addMessage(data);
  });
  
  return () => {
    channel.unbind_all();
    channel.unsubscribe();
  };
}, [chatId]);
```