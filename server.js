const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// قراءة الملفات الساكنة من المجلد الرئيسي
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
