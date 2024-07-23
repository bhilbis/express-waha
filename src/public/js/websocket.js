const socket = new WebSocket('ws://localhost:4000/websocket');

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    const messageData = JSON.parse(event.data);
    console.log('New message received:', messageData);
    // Handle the received message (e.g., display it in the UI)
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// Function to send a message via WebSocket
const sendMessage = (chatId, text, session) => {
    const message = {
        chatId: chatId,
        text: text,
        session: session,
    };
    socket.send(JSON.stringify(message));
};
