const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ Admin สร้างบิลให้ tenant
exports.createPayment = async (req, res) => {
    const { userId, roomId, amount, waterFee, electricityFee, totalAmount, dueDate } = req.body;
  
    try {
      const payment = await prisma.payment.create({
        data: {
          userId,
          roomId,
          amount,
          waterFee,
          electricityFee,
          totalAmount,
          dueDate: new Date(dueDate),
          // paymentIssuedDate ไม่ต้องใส่ จะเซ็ตเองจาก Prisma
          status: "PENDING",
        },
      });
  
      res.status(201).json({ message: "Payment created", payment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// ✅ Tenant ดูบิลของตัวเอง
exports.getMyPayments = async (req, res) => {
  const userId = req.user.id;

  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { dueDate: "desc" },
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Tenant แนบสลิป
exports.uploadSlip = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { image } = req.body;

  try {
    const payment = await prisma.payment.findUnique({ where: { id: Number(id) } });

    if (!payment || payment.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or payment not found" });
    }

    const updated = await prisma.payment.update({
      where: { id: Number(id) },
      data: { 
        image,
        paymentDate: new Date(), },
    });

    res.json({ message: "Slip uploaded", payment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Admin เปลี่ยนสถานะการชำระเงิน
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["PAID", "OVERDUE"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const updated = await prisma.payment.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ message: "Payment status updated", payment: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
