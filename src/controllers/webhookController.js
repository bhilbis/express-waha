const axios = require('axios');
// const notifier = require('node-notifier');

const WAHA_API_BASE_URL = 'http://localhost:3001/api';

let clients = [];
let messages = []; // Store webhook messages

const addClient = (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
};

// const notifyClients = (message) => {
//     clients.forEach(client => {
//         client.send(JSON.stringify(message));
//     });
// };

const handleWebhook = async (req, res) => {
    console.log('Webhook received: ', JSON.stringify(req.body, null, 2));

    if (req.body.event === 'message') {
        const messageData = req.body.payload;
        const messageText = messageData.body;
        const sender = messageData.from;
        const session = req.body.session;
        const fromMe = messageData.fromMe;

        console.log(`Received message from ${sender}: ${messageText}`);
        console.log(`Checking if message text is 'hadir': ${messageText.toLowerCase() === 'hadir'}`);
        console.log(`Is the message from me? ${fromMe}`);

        // sendNotification(sender, messageText);

        messages.push(req.body); // Store the webhook message

        // notifyClients({
        //     sender: sender,
        //     message: messageText,
        //     timestamp: messageData.timestamp,
        // });

        if (messageText.toLowerCase() === 'hadir' && !fromMe) {
            try {
                console.log(`Sending confirmation message to ${sender}`);
                await sendMessageToRecipient(sender, "Konfirmasi Hadir Diterima", session);
                console.log(`Confirmation message sent to ${sender}`);
            } catch (error) {
                console.error('Error sending confirmation message:', error.message);
            }
        }

    } else if (req.body.event === 'session.status') {
        console.log('Session status:', req.body.payload.status);
    }
    res.status(200).send('Webhook received');
};

// namaLaki2, namaPerempuan, hari, tanggalBulanTahun, waktuMulai, waktuSelesai, lokasi
const sendMessageToRecipient = async (recipient, message, session,) => {
    try {
        // const message = createInvitationMessage(namaLaki2, namaPerempuan, hari, tanggalBulanTahun, waktuMulai, waktuSelesai, lokasi);
        console.log(`Sending message to ${recipient}: ${message} (session: ${session})`);
        const payload = {
            chatId: recipient.includes('@c.us') ? recipient : `${recipient}@c.us`,
            text: message,
            session: session,
        };
        console.log('Payload: ', payload);
        const response = await axios.post(`${WAHA_API_BASE_URL}/sendText`, payload);
        console.log(`Message sent to ${recipient}: ${response.data}`);
        return response.data;
    } catch (error) {
        console.error('Error sending message: ', error.message);
        throw error;
    }
};

// const createInvitationMessage = (namaLaki2, namaPerempuan, hari, tanggalBulanTahun, waktuMulai, waktuSelesai, lokasi) => {
//     return `
//         Bersama dengan undangan ini, saya turut mengundang Bapak/Ibu/Saudara untuk hadir di acara pernikahan kami.<br>
//         <b>${namaLaki2} & ${namaPerempuan}</b><br><br>
//         Akad akan di gelar pada:<br>
//         <b>Hari dan Tanggal: ${hari}, ${tanggalBulanTahun}<br>
//         Pukul: ${waktuMulai} WIB s/d ${waktuSelesai} WIB<br>
//         Lokasi: ${lokasi}</b><br><br>
//         Demikian undangan dari kami yang sedang berbahagia.<br>
//         Kami berharap Bapak/Ibu/Saudara berkenan untuk hadir di acara kami ini.<br><br>
//         Anda bisa konfirmasi kehadiran melalui Undangan atau klik tombol RSVP dibawah ini.<br><br>
//         <div style="text-align: center;">
//             <a href="RSVP_LINK_HERE" style="display: inline-block; padding: 10px 20px; font-size: 16px; text-align: center; text-decoration: none; color: #fff; background-color: #007bff; border-radius: 5px;">RSVP</a>
//         </div>
//     `;
// };


const getWebhookMessages = (req, res) => {
    res.status(200).json(messages);
};

const sendNotification = (sender, message) => {
    notifier.notify({
        title: 'New Whatsapp Message',
        message: `from: ${sender}\nMessage: ${message}`,
    });
};

module.exports = {
    handleWebhook,
    getWebhookMessages,
    addClient,
};
