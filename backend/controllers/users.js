const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ ดึงข้อมูลผู้ใช้ทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roomId: true
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
    const { id } = req.params; // ดึง `id` จาก URL parameters
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          roomId: true
        }
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.updateUser = async (req, res) => {
    const { id } = req.params; // ดึง `id` จาก URL parameters
    const { name, email, role, roomId } = req.body; // รับค่าจาก body
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          name,
          email,
          role,
          roomId
        }
      });
      res.json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  exports.deleteUser = async (req, res) => {
    const { id } = req.params; // ดึง `id` จาก URL parameters
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) }
      });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // ลบผู้ใช้
      await prisma.user.delete({
        where: { id: parseInt(id) }
      });
  
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
    
