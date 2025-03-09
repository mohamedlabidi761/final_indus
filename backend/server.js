const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Add a health endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/machines', require('./routes/machines'));
app.use('/api/workers', require('./routes/workers'));

// Error handler middleware (should be last)
app.use(errorHandler);

// Define port
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Run test script
require('child_process').exec('node test-api.js');