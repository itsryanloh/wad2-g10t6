// backend/server.js - ES MODULE VERSION
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import forumRoutes from './routes/forum.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api', forumRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Forum API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Cat Adoption Forum API',
    version: '1.0.0',
    endpoints: {
      posts: '/api/posts',
      singlePost: '/api/posts/:id',
      comments: '/api/posts/:id/comments',
      reactions: '/api/posts/:id/reactions',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 Forum API Server Started');
  console.log('=================================');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API endpoints: http://localhost:${PORT}/api/posts`);
  console.log('=================================');
});