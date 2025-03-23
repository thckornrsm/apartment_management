const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ สร้างห้องใหม่
exports.createRoom = async (req, res) => {
  const { number } = req.body;
  try {
    const room = await prisma.room.create({ data: { number } });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ดึงข้อมูลห้องทั้งหมด
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        user: true,
        payments: true,
        maintenanceRequests: true,
      },
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ดึงข้อมูลห้องตาม id
exports.getRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const room = await prisma.room.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        payments: true,
        maintenanceRequests: true,
      },
    });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ แก้ไขข้อมูลห้อง
exports.updateRoom = async (req, res) => {
  const { id } = req.params;
  const { number } = req.body;
  try {
    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(id) },
      data: { number },
    });
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ลบห้อง
exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.room.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Admin ตั้งรหัสผ่านให้ห้อง
exports.setRoomPassword = async (req, res) => {
    const { roomId, password } = req.body;
  
    try {
      // ตรวจสอบว่าห้องมีจริงไหม
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) return res.status(404).json({ error: "Room not found" });
  
      // เข้ารหัสรหัสผ่าน
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // อัปเดตรหัสผ่านห้อง
      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: { password: hashedPassword },
      });
  
      res.json({ message: "Room password set successfully", room: updatedRoom });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  const bcrypt = require("bcryptjs");

exports.enterRoom = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  try {
    // ดึงข้อมูล user พร้อมห้องที่เลือกไว้
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { room: true },
    });

    if (!user.room) return res.status(400).json({ error: "You have not been assigned a room" });

    // เปรียบเทียบรหัสผ่านห้อง
    const isValid = await bcrypt.compare(password, user.room.password || "");
    if (!isValid) return res.status(401).json({ error: "Incorrect room password" });

    // ✅ เข้าห้องสำเร็จ
    res.json({
      message: "Access to room granted",
      room: user.room
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRoom = async (req, res) => {
    const userId = req.user.id; // มาจาก verifyToken
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          room: {
            include: {
              payments: true,
              maintenanceRequests: true
            }
          }
        }
      });
  
      if (!user || !user.room) {
        return res.status(400).json({ error: "You have not been assigned a room" });
      }
  
      res.json(user.room);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  