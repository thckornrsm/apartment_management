// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// // controllers/messages.js
// exports.sendToAdmin = async (req, res) => {
//     const senderId = req.user.id; // รับ senderId จาก user ที่ login
//     const { message } = req.body;
  
//     try {
//       // ค้นหาผู้ใช้ที่เป็น Admin ในระบบ
//       const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
//       if (!admin) return res.status(404).json({ error: "Admin not found" });
  
//       // สร้างข้อความจาก Tenant ไปยัง Admin
//       const sentMessage = await prisma.privateMessage.create({
//         data: {
//           senderId,  // ผู้ส่งเป็น Tenant ที่กำลัง login
//           receiverId: admin.id, // ผู้รับเป็น Admin
//           message,
//         },
//       });
  
//       res.status(201).json({ message: "Message sent to admin", data: sentMessage });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };

//   exports.adminReply = async (req, res) => {
//     const senderId = req.user.id; // senderId คือ admin ที่ตอบกลับ
//     const { receiverId, message } = req.body;

//     // ตรวจสอบว่า user ที่ส่งคำตอบต้องเป็น admin
//     if (req.user.role !== "ADMIN") {
//       return res.status(403).json({ error: "Only admin can reply" });
//     }

//     try {
//       // ตรวจสอบว่า receiverId ถูกต้องและมีผู้ใช้งานจริง
//       const tenant = await prisma.user.findUnique({ where: { id: receiverId } });
//       if (!tenant || tenant.role !== "TENANT") {
//         return res.status(404).json({ error: "Tenant not found" });
//       }

//       // สร้างข้อความตอบกลับจาก Admin ไปยัง Tenant
//       const reply = await prisma.privateMessage.create({
//         data: {
//           senderId,    // Admin เป็นผู้ส่ง
//           receiverId,  // receiverId คือ Tenant ที่ส่งข้อความมา
//           message,     // ข้อความตอบกลับจาก Admin
//         },
//       });

//       res.status(201).json({ message: "Reply sent", data: reply });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
// };


//   exports.getSentMessages = async (req, res) => {
//     try {
//       const messages = await prisma.privateMessage.findMany({
//         where: { senderId: req.user.id },
//         include: {
//           receiver: { select: { name: true, email: true } }
//         },
//         orderBy: { createdAt: "desc" },
//       });
//       res.json(messages);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };

//   exports.getReceivedMessages = async (req, res) => {
//     try {
//       const messages = await prisma.privateMessage.findMany({
//         where: { receiverId: req.user.id },
//         include: {
//           sender: { select: { name: true, email: true } }
//         },
//         orderBy: { createdAt: "desc" },
//       });
//       res.json(messages);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
  
  