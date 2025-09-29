const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// When a client connects
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined room user_${userId}`);
    });

});

// Endpoint for Laravel to call
app.post('/notify', (req, res) => {
    const { event, data } = req.body;

    if (event === 'booking_waiting') {
        console.log(data)
        io.emit('booking_waiting', data); // notify all drivers
    }

    if (event === 'booking_accepted') {
        console.log(data)
        io.to(`user_${data.user_id}`).emit('booking_accepted', data); // only the passenger
    }


    if (event === 'booking_canceled') {
        console.log(data)
        io.emit('booking_canceled', data); // user will cancel
    }

    res.send({ status: 'ok' });
});

server.listen(4000, () => console.log('WebSocket server running on port 4000'));