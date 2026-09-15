const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
    console.log('بەکارهێنەرێک پەیوەندی بەست:', socket.id);

    // وەرگرتنی پرۆفایلی سەرەتایی بەکارهێنەر
    socket.on('set profile', (profile) => {
        users[socket.id] = {
            id: socket.id,
            name: profile.name,
            age: profile.age,
            avatar: profile.avatar,
            bio: profile.bio,
            status: profile.status
        };
        io.emit('update users', Object.values(users));
    });

    // نوێکردنەوەی پرۆفایل
    socket.on('update profile', (profile) => {
        if (users[socket.id]) {
            users[socket.id].name = profile.name;
            users[socket.id].age = profile.age;
            users[socket.id].avatar = profile.avatar;
            users[socket.id].bio = profile.bio;
            users[socket.id].status = profile.status;
            
            io.emit('update users', Object.values(users));
        }
    });

    // ناردنی پەیامی تایبەت (تێکست یان وێنە) بۆ کەسی بەرامبەر
    socket.on('private message', (data) => {
        io.to(data.to).emit('private message', {
            msg: data.msg,
            type: data.type, // تێکست یان وێنە
            senderId: socket.id
        });
    });

    // کاتێک بەکارهێنەر دەردەچێت
    socket.on('disconnect', () => {
        console.log('بەکارهێنەر دەرچوو:', socket.id);
        delete users[socket.id];
        io.emit('update users', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`سێرڤەر لەسەر پۆرت ${PORT} کار دەکات`);
});
