const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/retail', require('./routes/retailRoutes'));

app.get('/', (req, res) => {
  res.send('my API is running :P...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
