const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ ให้ผู้ใช้จองห้อง (1 ห้อง/คน)
exports.assignRoom = async (req, res) => {
  const userId = req.user.id;
  const { roomId } = req.body;

  try {
    // ตรวจสอบว่าผู้ใช้มีห้องอยู่แล้วหรือยัง
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.roomId) {
      return res.status(400).json({ error: "You already have a room assigned" });
    }

    // ตรวจสอบว่าห้องมีอยู่จริงไหม
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // ตรวจสอบว่าห้องถูกจองไปแล้วหรือยัง
    const isRoomTaken = await prisma.user.findFirst({ where: { roomId } });
    if (isRoomTaken) {
      return res.status(400).json({ error: "Room is already assigned" });
    }

    // อัปเดต roomId ให้ผู้ใช้
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roomId },
    });

    res.json({ message: "Room assigned successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

