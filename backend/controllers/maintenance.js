const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createRequest = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.roomId) {
      return res.status(400).json({ error: "You must be assigned to a room first" });
    }

    const { category, description, image } = req.body;

    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        userId,
        roomId: user.roomId,
        category,
        description,
        image,
      },
    });

    res.status(201).json({ message: "Request submitted", request: newRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ดึงคำขอทั้งหมดของผู้ใช้
exports.getMyRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await prisma.maintenanceRequest.findMany({
      where: { userId },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        room: true,
      },
    });

    if (!request) return res.status(404).json({ error: "Request not found" });

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ แก้ไขคำขอของตัวเอง
exports.updateRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { category, description, image, status } = req.body;

  try {
    const request = await prisma.maintenanceRequest.findUnique({ where: { id: Number(id) } });

    if (!request || request.userId !== userId) {
      return res.status(403).json({ error: "Not authorized or request not found" });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id: Number(id) },
      data: { category, description, image, status },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ลบคำขอของตัวเอง
exports.deleteRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const request = await prisma.maintenanceRequest.findUnique({ where: { id: Number(id) } });

    if (!request || request.userId !== userId) {
      return res.status(403).json({ error: "Not authorized or request not found" });
    }

    await prisma.maintenanceRequest.delete({ where: { id: Number(id) } });

    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatusByAdmin = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!request) return res.status(404).json({ error: "Maintenance request not found" });

    const updated = await prisma.maintenanceRequest.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ message: "Status updated", request: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

