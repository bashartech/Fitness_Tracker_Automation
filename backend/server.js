const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',    // Next.js frontend
    'http://localhost:8000',    // Chatbot backend
    process.env.CLIENT_URL,       // From environment variable
    'https://bashartc14-ftt.hf.space'  // Production frontend
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/weights', require('./routes/weights'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/progress', require('./routes/progress'));

// Basic route
app.get('/', (req, res) => {
  res.send('Fitness Tracker API Running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});