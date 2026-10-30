const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ربط مجلد الملفات الثابتة (واجهات الواجهة الأمامية)
app.use(express.static(path.join(__dirname, 'public')));

let currentTicketNumber = 0;
let patientName = 'لا يوجد مريض حالياً';
let clinicName = 'عيادة التخصصات الطبية';
let waitingList = []; // قائمة المرضى المنتظرين

io.on('connection', (socket) => {
    console.log('مستخدم متصل بالنظام بنجاح');

    // إرسال البيانات الحالية عند اتصال أي عميل جديد
    socket.emit('updateQueue', { currentTicketNumber, patientName, clinicName, waitingList });

    // تحديث اسم العيادة
    socket.on('updateClinicName', (name) => {
        clinicName = name;
        io.emit('updateQueue', { currentTicketNumber, patientName, clinicName, waitingList });
    });

    // الانتقال للعميل التالي أو حالات الطوارئ/VIP
    socket.on('nextPatient', (data) => {
        currentTicketNumber++;
        const pName = data.patientName && data.patientName.trim() !== '' ? data.patientName : `مريض رقم ${currentTicketNumber}`;
        
        if (data.isVip) {
            patientName = `⭐ [حالة طارئة / VIP] ${pName}`;
        } else {
            patientName = pName;
            // إضافة المريض لقائمة الانتظار المرئية
            waitingList.push({ number: currentTicketNumber, name: patientName });
            if (waitingList.length > 3) waitingList.shift(); // الاحتفاظ بآخر 3 مرضى فقط
        }

        // تحديث جميع الشاشات ولوحات التحكم بالبيانات الجديدة
        io.emit('updateQueue', { currentTicketNumber, patientName, clinicName, waitingList });
        
        // إرسال إشارة الصوت مع تمرير الرقم واسم المريض لينطقها المتصفح معاً
        io.emit('playAlert', { currentTicketNumber: currentTicketNumber, patientName: patientName });
    });

    // تصفير الطابور بالكامل وإعادة العد من الصفر
    socket.on('resetQueue', () => {
        currentTicketNumber = 0;
        patientName = 'لا يوجد مريض حالياً';
        waitingList = [];
        io.emit('updateQueue', { currentTicketNumber, patientName, clinicName, waitingList });
    });

    socket.on('disconnect', () => {
        console.log('انقطع اتصال مستخدم');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`السيرفر يعمل بكفاءة جبارة على الرابط: http://localhost:${PORT}`);
});