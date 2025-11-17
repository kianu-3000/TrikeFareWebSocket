const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
require('dotenv').config();

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
        io.to(`user_${data.user_id}_${data.id}`).emit('booking_accepted', data); // only the passenger
    }


    if (event === 'booking_canceled') {
        console.log(data)
        io.to(`user_${data.user_id}_${data.id}`).emit('booking_canceled', data); // user will cancel
    }

    if (event === 'driver_cancelled') {
        console.log(data)
        io.to(`user_${data.user_id}_${data.id}`).emit('driver_cancelled', data); // driver will cancel
    }

    if (event === 'driver_finished') {
        console.log(data)
        io.to(`user_${data.user_id}`).emit('driver_finished', data); // driver will cancel
    }

    if (event === 'driver_completed') {
        console.log(data)
        io.to(`user_${data.user_id}`).emit('driver_completed', data); // driver will cancel
    }

    res.send({ status: 'ok' });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));