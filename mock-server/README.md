# Mock API Server

Simple Node.js server for testing authentication.

## Setup

1. Install dependencies:
```bash
cd mock-server
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

## Endpoints

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/health` - Health check

## For Android Emulator

Update your `.env` file:
```
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api/v1
```

## For Physical Device

Find your computer's local IP and update `.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:5000/api/v1
```
