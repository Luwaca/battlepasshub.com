const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Function to get access token from Blizzard
async function getAccessToken() {
    try {
        const response = await axios.post('https://us.battle.net/oauth/token', null, {
            params: {
                grant_type: 'client_credentials'
            },
            auth: {
                username: process.env.BLIZZARD_CLIENT_ID,
                password: process.env.BLIZZARD_CLIENT_SECRET
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching access token:', error);
        throw error;
    }
}

// Endpoint to fetch Overwatch player stats
app.get('/api/overwatch/stats/:username', async (req, res) => {
    const username = req.params.username;
    const accessToken = await getAccessToken();

    try {
        const response = await axios.get(`https://ow-api.com/v1/stats/pc/us/${username}/profile`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching player stats:', error);
        res.status(500).send('Error fetching player stats');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});