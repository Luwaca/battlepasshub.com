const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');  // Import cors package
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());  // Use cors middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'
app.use(express.static(path.join(__dirname))); // Serve static files from root

// Function to get access token from Blizzard
async function getAccessToken() {
    try {
        console.log('Fetching access token...');
        const response = await axios.post('https://us.battle.net/oauth/token', null, {
            params: {
                grant_type: 'client_credentials'
            },
            auth: {
                username: process.env.BLIZZARD_CLIENT_ID,
                password: process.env.BLIZZARD_CLIENT_SECRET
            }
        });
        console.log('Access token fetched successfully.');
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Function to get Overwatch player stats using the community-driven API
async function getOverwatchStats(username) {
    try {
        const response = await axios.get(`https://ow-api.com/v1/stats/pc/us/${username}/profile`);
        console.log('API response:', response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error('Error fetching player stats:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Endpoint to fetch Overwatch player stats
app.get('/api/overwatch/stats/:username', async (req, res) => {
    const username = req.params.username;
    console.log(`Fetching stats for username: ${username}`);
    try {
        const playerStats = await getOverwatchStats(username);
        console.log(`Stats fetched successfully for username: ${username}`);
        res.json(playerStats);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).send('Error fetching player stats');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
