const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// تحديد المجلد العام للملفات (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// مسار افتراضي يوجه للوحة التحكم أو الشاشة
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// استقبال اتصال الـ Socket.io
io.on('connection', (socket) => {
    console.log('مستخدم متصل بنجاح');

    // استقبال التحديث من لوحة التحكم وإعادة إرساله لشاشة الانتظار
    socket.on('update-queue', (data) => {
        io.emit('update-queue', data);
    });

    socket.on('disconnect', () => {
        console.log('تم انقطاع الاتصال');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`السيرفر يعمل على البورت ${PORT}`);
});
