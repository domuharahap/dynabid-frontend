const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Set the backend URL from environment variables, or a local default
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Consolidated API proxy function using axios
const apiProxy = async (req, res, apiPath) => {
    // Prepend the /api prefix here to ensure all requests go to the backend's API
    const targetUrl = `${BACKEND_URL}/api${apiPath}`;
    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Error calling backend (${targetUrl}):`, error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: 'Failed to connect to backend service.' });
    }
};

// --- Frontend Routes ---

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly handle user authentication routes
app.post('/users/register', async (req, res) => await apiProxy(req, res, '/users/register'));
app.post('/users/login', async (req, res) => await apiProxy(req, res, '/users/login'));

// Explicitly handle the bid placement route
app.post('/payments/confirm', async (req, res) => await apiProxy(req, res, '/payments/confirm'));

app.get('/payments/:bidId', async (req, res) => {
    const apiPath = req.originalUrl;
    await apiProxy(req, res, apiPath);
});


// All other API calls are routed through this single block of code
app.all('/bids/{*path}', async (req, res) => {
    const apiPath = req.originalUrl;
    await apiProxy(req, res, apiPath);
});

// Non-API routes for serving HTML pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'registration.html')));
app.get('/home', (req, res) => res.sendFile(path.join(__dirname, 'views', 'home.html')));
app.get('/series', (req, res) => res.sendFile(path.join(__dirname, 'views', 'series.html')));
app.get('/bid/:seriesName', (req, res) => res.sendFile(path.join(__dirname, 'views', 'bid_form.html')));
app.get('/payments', (req, res) => res.sendFile(path.join(__dirname, 'views', 'payment.html')));
app.get('/success', (req, res) => res.sendFile(path.join(__dirname, 'views', 'success.html')));
app.get('/confirmation', (req, res) => res.redirect('/success'));

app.listen(PORT, () => {
    console.log(`Frontend server running on http://localhost:${PORT}`);
    console.log(`Backend Service URL: ${BACKEND_URL}`);
});