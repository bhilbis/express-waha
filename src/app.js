const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const wahaController = require('./controllers/wahaController');
const webhookController = require('./controllers/webhookController');
const expressWs = require('express-ws');

const app = express();
expressWs(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sendMessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sendMessage.html'));
})

//Web Socket
app.ws('/websocket', (ws, req) => {
    console.log('WebSocket connection established');
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
    webhookController.addClient(ws)
})

app.post('/webhook', webhookController.handleWebhook)

app.get('/api/webhook-messages', webhookController.getWebhookMessages)

//sessions
app.post('/api/sessions/start', wahaController.startSession);
app.post('/api/sessions/stop', wahaController.stopSession);
app.post('/api/sessions/logout', wahaController.logoutSession);
app.get('/api/sessions', wahaController.getSessions);
//login screenshots
app.get('/api/screenshot', wahaController.screenshotSession);
//send sessions
app.post('/api/sendText', wahaController.sendMessage);
// app.get('/api/messages', wahaController.fetchLatestMessage);
//End point get messages
// app.get('/api/messages', wahaController.getMessage);

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad Json:', err.message);
        return res.status(400).send({ status: 400, message: 'Bad Json' });
    }
    next();
});

const port = 3000;
app.listen(port, () =>{
    console.log(`Server running at http://localhost:${port}/`);
});