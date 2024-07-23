const axios = require('axios');

// const WAHA_API_BASE_URL = 'http://149.28.155.78:3000/api';
const WAHA_API_BASE_URL = 'http://localhost:3001/api';

const startSession = async (req, res) => {
    try {
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/start`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error starting session:', error.message);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const stopSession = async (req, res) => {
    try {
        console.log('Stop session payload:', req.body);
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/stop`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error stopping session:', error.message);  
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const logoutSession = async (req, res) => {
    try {
        console.log('Logout session payload:', req.body);
        const response = await axios.post(`${WAHA_API_BASE_URL}/sessions/logout`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error logging out session:', error.message);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const screenshotSession = async (req, res) => {
    try {
        const { session } = req.query;
        console.log('Screenshot session:', session);
        const response = await axios.get(`${WAHA_API_BASE_URL}/screenshot?session=${session}`, { responseType: 'arraybuffer' });
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);
    } catch (error) {
        console.error('Error taking screenshot:', error.message);  
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};

const getSessions = async (req, res) => {
    try {
        const { all } = req.query;
        const url = all ? `${WAHA_API_BASE_URL}/sessions?all=${all}` : `${WAHA_API_BASE_URL}/sessions`;
        const response = await axios.get(url);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status: 500).send(error.response ? error.response.data : error.message);
    }
};

const sendMessage = async (req, res) => {
    try {
        const { chatId, text, session } = req.body;
        console.log(`Sending message to ${chatId}: ${text}`);
        const response = await axios.post(`${WAHA_API_BASE_URL}/sendText`, { chatId, text, session });
        res.status(response.status).send(response.data);

        notifyClients({ chatId, text, session });
    } catch (error) {
        console.error('Error sending message:', error.message); 
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : error.message);
    }
};



module.exports = {
    startSession,
    stopSession,
    logoutSession,
    getSessions,
    screenshotSession,
    sendMessage,
};
