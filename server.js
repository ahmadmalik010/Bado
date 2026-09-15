const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static(__dirname));

let users = [];
let posts = [];

io.on('connection', (socket) => {
    console.log('User connected: ', socket.id);

    // ناردنی داتای پێشوو بۆ کەسی نوێ
    socket.emit('update posts', posts);

    socket.on('set profile', (userData) => {
        users = users.filter(u => u.id !== socket.id);
        socket.data = { id: socket.id, ...userData };
        users.push(socket.data);
        io.emit('update users', users);
        console.log('Active users:', users.length);
    });

    socket.on('update profile', (userData) => {
        users = users.filter(u => u.id !== socket.id);
        socket.data = { id: socket.id, ...userData };
        users.push(socket.data);
        io.emit('update users', users);
    });

    // بڵاوکردنەوەی پۆست بۆ هەمووان
    socket.on('new post', (postData) => {
        posts.push(postData);
        io.emit('update posts', posts);
        console.log('New post added, total posts:', posts.length);
    });

    // لایکی پۆست
    socket.on('like post', (index) => {
        if (posts[index]) {
            posts[index].likes = (posts[index].likes || 0) + 1;
            io.emit('update posts', posts);
        }
    });

    socket.on('private message', ({ to, msg, type }) => {
        io.to(to).emit('private message', { senderId: socket.id, msg, type });
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('update users', users);
        console.log('User disconnected: ', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
