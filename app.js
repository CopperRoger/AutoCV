const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const generateRoute = require('./routes/generate');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend as static files
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.use('/generate', generateRoute);

// Fallback to index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`AutoCV running on http://localhost:${PORT}`));
