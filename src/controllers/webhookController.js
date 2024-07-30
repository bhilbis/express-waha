const axios = require('axios');
const Message = require('../models/Invitation')
const WAHA_API_BASE_URL = 'http://localhost:3001/api';

let clients = [];
let messages = [];
let userSessions = {};

const addClient = (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
};

const handleWebhook = async (req, res) => {
    console.log('Webhook received: ', JSON.stringify(req.body, null, 2));

    if (req.body.event === 'message') {
        const messageData = req.body.payload;
        const messageText = messageData.body.trim().toLowerCase();
        const sender = messageData.from;
        const session = req.body.session;
        const fromMe = messageData.fromMe;
        const timestamp = new Date((messageData.timestamp * 1000) + (7 * 60 * 60 * 1000));
        const dateSent = fromMe ? timestamp : null;
        const dateReceive = messageData.viewed ? timestamp : (!fromMe ? timestamp : null);
        const status = fromMe ? 'sent' : 'received';
        const receiverNumber = fromMe ? messageData.to : sender;
        const senderNumber = fromMe ? sender : messageData.to;

        console.log(timestamp)

        // try {
        //     await Message.create({
        //         message: messageText,
        //         date_sent: dateSent,
        //         date_read: null,
        //         date_receive: dateReceive,
        //         status: status,
        //         receiver_number: receiverNumber,
        //         sender_number: senderNumber,
        //     });
        //     console.log('Message loggend successfully')
        // } catch (error) {
        //     if (error.name === 'sequelizeUniqueConstraintError') {
        //         console.log('Duplicate entry detected, skipping insertion');
        //     } else {
        //         console.error('Error inserting message into the database:', error);
        //     }
        // }

        console.log(`Received message from ${sender}: ${messageText}`);
        console.log(`Checking if message text is 'hadir': ${messageText.toLowerCase() === 'hadir'}`);
        console.log(`Is the message from me? ${fromMe}`);

        messages.push(req.body);

        if (!userSessions[sender]) {
            userSessions[sender] = { started: false, confirmed: false, id: Date.now() };
        }

        const validCommands = ['rsvp', 'hadir', 'tidak hadir', 'konfirmasi', 'reset', '1', '2', '3', '4'];

        if (messageText === 'rsvp' && !fromMe) {
            if (userSessions[sender].confirmed) {
                try {
                    let summaryMessage;
                    if (userSessions[sender].attendance === 'hadir') {
                        summaryMessage = `Anda sudah memiliki RSVP. Berikut adalah ringkasan RSVP Anda:\n\nKehadiran: Hadir\nJumlah Orang: ${userSessions[sender].numberOfAttendees}\nAkomodasi: ${userSessions[sender].accommodationChoice}`;
                    } else {
                        summaryMessage = `status RSVP anda tidak hadir.`;
                    }
                    await sendMessageToRecipient(sender, summaryMessage, session);
                    console.log(`Sent existing RSVP summary to ${sender}`);
                    return res.status(200).send('Webhook processed');
                } catch (error) {
                    console.error('Error sending RSVP summary:', error.message);
                }
                return res.status(200).send('Webhook processed');
            } else if (userSessions[sender].resetConfirm && !userSessions[sender].resetConfirmed) {
                try {
                    let summaryMessage;
                    if (userSessions[sender].attendance === 'hadir') {
                        summaryMessage = `Berikut adalah ringkasan RSVP Anda sebelumnya:\n\nKehadiran: Hadir\nJumlah Orang: ${userSessions[sender].numberOfAttendees}\nAkomodasi: ${userSessions[sender].accommodationChoice}`;
                    } else {
                        summaryMessage = `Berikut adalah ringkasan RSVP Anda sebelumnya:\n\nKehadiran: Tidak Hadir`;
                    }
                    await sendMessageToRecipient(sender, summaryMessage, session);
                    console.log(`Sent previous RSVP summary to ${sender}`);
                    return res.status(200).send('Webhook processed');
                } catch (error) {
                    console.error('Error sending previous RSVP summary:', error.message);
                }
                return res.status(200).send('Webhook processed');
            } else {
                try {
                    console.log(`Sending RSVP start message to ${sender}`);
                    const rsvpMessage =
                        `Bersama dengan undangan ini, saya turut mengundang Bapak/Ibu/Saudara untuk hadir di acara pernikahan kami.
*$[namaLakiLaki] & $[namaPerempuan]*

Akad akan digelar pada:
*Hari dan Tanggal:* *$[hariAkad]*, *$[tanggalAkad]*
*Pukul: $[waktuMulaiAkad] WIB s/d $[waktuSelesaiAkad] WIB*
*Lokasi: $[lokasiAkad]*

Resepsi akan digelar pada:
*Hari dan Tanggal:* *$[hariResepsi]*, *$[tanggalResepsi]*
*Pukul: $[waktuMulaiResepsi] WIB s/d $[waktuSelesaiResepsi] WIB*
*Lokasi: $[lokasiResepsi]*

Demikian undangan dari kami yang sedang berbahagia.
Kami berharap Bapak/Ibu/Saudara berkenan untuk hadir di acara kami ini.

Mohon melengkapi RSVP ini sebelum Tanggal [tanggal].\n\nBalas pesan ini dengan\n*Hadir*\n*Tidak Hadir*`;
                    await sendMessageToRecipient(sender, rsvpMessage, session);
                    console.log(`Confirmation message sent to ${sender}`);
                    userSessions[sender].started = true;
                    userSessions[sender].step = 'attendance';
                } catch (error) {
                    console.error('Error sending RSVP message:', error.message);
                }
            }
        } else if (!userSessions[sender].started && validCommands.includes(messageText) && !fromMe) {
            try {
                console.log(`Sending error message to ${sender} for not starting with RSVP`);
                await sendMessageToRecipient(sender, 'Silakan mulai dengan mengetik "RSVP" untuk melanjutkan.', session);
                console.log(`Error message sent to ${sender} for not starting with RSVP`);
            } catch (error) {
                console.error('Error sending error message:', error.message);
            }
        } else if (userSessions[sender].step === 'attendance' && messageText === 'hadir' && !fromMe) {
            try {
                console.log(`Processing attendance confirmation from ${sender}`);
                await sendMessageToRecipient(sender, "Undangan anda berlaku untuk *4 orang*. Berapa orang yang akan hadir? \n\nBalas pesan ini dengan angka.\n(Contoh: *4*)", session);
                console.log(`Confirmation message sent to ${sender}`);
                userSessions[sender].attendance = 'hadir';
                userSessions[sender].step = 'numberOfAttendees';
            } catch (error) {
                console.error('Error sending confirmation message:', error.message);
            }
        } else if (userSessions[sender].step === 'numberOfAttendees' && !isNaN(messageText) && !fromMe) {
            const numberOfAttendees = parseInt(messageText, 10);
            if (numberOfAttendees >= 1 && numberOfAttendees <= 4) {
                try {
                    console.log(`Confirming attendance for ${numberOfAttendees} people to ${sender}`);
                    userSessions[sender].numberOfAttendees = numberOfAttendees;
                    userSessions[sender].step = 'accommodationChoice';
                    await sendMessageToRecipient(sender, `Anda akan mendapat fasilitas *Akomodasi*.\n*Menginap di Hotel Grand Mecure Malang*\nBerapa lama anda akan menginap?\n1. 1 malam, Check in 16 Januari 2025, Check out 17 Januari 2025\n2. 2 malam, Check in 15 Januari 2025, Check out 17 Januari 2025\n3. Tidak Perlu\n\n Balas pesan ini dengan angka.\n( Contoh: *2* )`, session);
                    console.log(`Attendance confirmed for ${numberOfAttendees} people to ${sender}`);
                } catch (error) {
                    console.error('Error confirming attendance:', error.message);
                }
            } else {
                try {
                    console.log(`Sending error message for invalid attendance number to ${sender}`);
                    await sendMessageToRecipient(sender, "Mohon maaf Jawaban yang ada kirimkan melebihi kuota \n\n balas pesan ini dengan angka.\n( Contoh: *4* )", session);
                    console.log(`Error message sent for invalid attendance number to ${sender}`);
                } catch (error) {
                    console.error('Error sending error message for invalid attendance number:', error.message);
                }
            }
        } else if (userSessions[sender].step === 'accommodationChoice' && ['1', '2', '3'].includes(messageText) && !fromMe) {
            try {
                let accommodation;
                if (messageText === '1') {
                    accommodation = '1 malam';
                } else if (messageText === '2') {
                    accommodation = '2 malam';
                } else {
                    accommodation = 'Tidak Perlu';
                }
                userSessions[sender].accommodationChoice = accommodation;
        
                let confirmationMessage = `Anda telah memilih:\n\nKehadiran: Hadir\nJumlah Orang: ${userSessions[sender].numberOfAttendees}\nAkomodasi: ${accommodation}\n\nApakah Anda ingin mengkonfirmasi RSVP Anda? Balas dengan *konfirmasi* untuk menyetujui atau *reset* untuk mengulangi proses.`;
                await sendMessageToRecipient(sender, confirmationMessage, session);
                
                userSessions[sender].step = 'confirmation';
            } catch (error) {
                console.error('Error processing accommodation choice:', error.message);
            }
        } else if (messageText === 'tidak hadir' && !fromMe) {
            try {
                console.log(`Processing non-attendance confirmation from ${sender}`);
                await sendMessageToRecipient(sender, "Terima kasih telah memberitahu kami. Kami menghargai respons Anda.", session);
                userSessions[sender].attendance = 'tidak hadir';
                userSessions[sender].confirmed = true;
                userSessions[sender].step = null;
                console.log('Non-attendance confirmation sent');
            } catch (error) {
                console.error('Error sending non-attendance confirmation:', error.message);
            }
        } else if (userSessions[sender].step === 'confirmation' && !fromMe) {
            if (messageText === 'konfirmasi') {
                try {
                    let finalMessage = `Terima kasih, RSVP Anda telah berhasil.\n\nKehadiran: Hadir\nJumlah Orang: ${userSessions[sender].numberOfAttendees}\nAkomodasi: ${userSessions[sender].accommodationChoice}\n\nKami berharap dapat bertemu Anda di acara kami.`;
                    await sendMessageToRecipient(sender, finalMessage, session);

                    await Message.create({
                        message: finalMessage,
                        date_sent: dateSent,
                        date_read: null,
                        date_receive: dateReceive,
                        status: status,
                        receiver_number: receiverNumber,
                        sender_number: senderNumber,
                    });
        
                    userSessions[sender].confirmed = true;
                    userSessions[sender].step = null;
                    console.log('Final RSVP confirmation sent');
                } catch (error) {
                    console.error('Error sending final RSVP confirmation:', error.message);
                }
            } else {
                try {
                    await sendMessageToRecipient(sender, 'Silakan mulai dengan mengetik "RSVP" untuk melanjutkan.', session);
                } catch (error) {
                    console.error('Error sending confirmation message:', error.message);
                }
            }
        } else if (messageText === 'reset' && !fromMe) {
            if (userSessions[sender].resetConfirm) {
                userSessions[sender] = { started: false, confirmed: false, id: Date.now() };
                try {
                    const resetCompleteMessage = 'RSVP Anda telah direset. Silakan mulai dengan mengetik "RSVP" untuk memulai ulang.';
                    await sendMessageToRecipient(sender, resetCompleteMessage, session);
                    await message.destroy({ where: { receiver_number: receiverNumber, status: 'received' } })
                    console.log(`Reset complete message sent to ${sender}`);
                } catch (error) {
                    console.error('Error sending reset complete message:', error.message);
                }
            } else {
                userSessions[sender].resetConfirm = true;
                try {
                    const resetMessage = 'Apakah Anda yakin ingin mereset RSVP Anda? Jika ya, ketik "reset" lagi. Jika tidak, ketik pesan apa saja selain "reset".';
                    await sendMessageToRecipient(sender, resetMessage, session);
                    console.log(`Reset confirmation message sent to ${sender}`);
                } catch (error) {
                    console.error('Error sending reset confirmation message:', error.message);
                }
            }
        } else if (userSessions[sender].resetConfirm && messageText !== 'reset' && !fromMe) {
                userSessions[sender].resetConfirm = false;
                try {
                    const resetCompleteMessage = 'RSVP Anda tidak direset. Lanjutkan dengan RSVP Anda.';
                    await sendMessageToRecipient(sender, resetCompleteMessage, session);
                    console.log('Informing the user to start with "RSVP".');
                } catch (error) {
                    console.error('Error informing the user to start with "RSVP":', error.message);
                }
        } 

        clients.forEach(client => client.send(JSON.stringify(req.body)));
        console.log('Broadcasted webhook to all clients.');
        res.status(200).send('Webhook processed');
    } else {
        res.status(200).send('No action taken.');
    }
};

const sendMessageToRecipient = async (recipient, message, session) => {
    try {
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

const getWebhookMessages = (req, res) => {
    res.status(200).json(messages);
};

module.exports = {
    handleWebhook,
    getWebhookMessages,
    addClient,
};