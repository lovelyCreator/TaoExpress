const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage
const users = [];

// Helper to generate token
const generateToken = (userId) => {
  return `mock_token_${userId}_${Date.now()}`;
};

// Register endpoint
app.post('/api/v1/auth/register', (req, res) => {
  console.log('📝 Register request:', req.body);
  
  const { email, password, user_id, phone, isBusiness } = req.body;
  
  // Validate required fields
  if (!email || !password || !user_id || !phone) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields'
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User already exists'
    });
  }
  
  // Create new user
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    user_id,
    phone,
    isBusiness: isBusiness || false,
    isEmailVerified: false,
    createdAt: new Date()
  };
  
  users.push({ ...newUser, password });
  
  const token = generateToken(newUser.id);
  const refreshToken = generateToken(newUser.id + '_refresh');
  
  console.log('✅ User registered:', newUser.email);
  
  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      user: newUser,
      token,
      refreshToken
    }
  });
});

// Login endpoint
app.post('/api/v1/auth/login', (req, res) => {
  console.log('🔐 Login request:', req.body);
  
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required'
    });
  }
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }
  
  // Check password
  if (user.password !== password) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password'
    });
  }
  
  const token = generateToken(user.id);
  const refreshToken = generateToken(user.id + '_refresh');
  
  const { password: _, ...userWithoutPassword } = user;
  
  console.log('✅ User logged in:', user.email);
  
  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
      refreshToken
    }
  });
});

// Email verification endpoint
app.post('/api/v1/auth/verify-email', (req, res) => {
  console.log('✉️ Email verification request:', req.body);
  
  const { email, code } = req.body;
  
  // Validate required fields
  if (!email || !code) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and code are required'
    });
  }
  
  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found'
    });
  }
  
  // For testing, accept any 6-digit code
  if (code.length !== 6) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid verification code'
    });
  }
  
  // Mark user as verified
  user.isEmailVerified = true;
  
  console.log('✅ Email verified for:', user.email);
  
  res.json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📱 For Android emulator use: http://10.0.2.2:${PORT}/api/v1`);
  console.log(`🌐 For physical device use: http://YOUR_LOCAL_IP:${PORT}/api/v1`);
});
