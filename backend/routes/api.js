const express = require("express");
const rateLimit = require("express-rate-limit");
const { verifyToken, verifyAdmin } = require("../controllers/auth");

const apiLimit = rateLimit({
  windowMs: 1000 * 60 * 3, // 3 minutes
  max: 100,
  message: "You have exceeded the 100 requests in 3 minutes limit!",
});

const router = express.Router();
const tenantController = require("../controllers/tenants");
const roomController = require("../controllers/rooms");
const paymentController = require("../controllers/payments");
const maintenanceController = require("../controllers/maintenance");
const userController = require("../controllers/users");
const messageController = require("../controllers/messages");
const authController = require("../controllers/auth");
const postController = require("../controllers/posts");

// 🧑‍💼 Routes เฉพาะ Admin เท่านั้น
router.get("/admin/users", verifyToken, verifyAdmin, userController.getAllUsers);
router.get("/admin/rooms", verifyToken, verifyAdmin, roomController.getAllRooms);
// router.get("/admin/payments", verifyToken, verifyAdmin, paymentController.getAllPayments);
// router.get("/admin/maintenance", verifyToken, verifyAdmin, maintenanceController.getAllRequests);
router.post("/rooms/set-password", verifyToken, verifyAdmin, roomController.setRoomPassword);

// ✅ API ผู้เช่า (Tenants) - ADMIN ใช้จัดการ
// router.post("/tenants", verifyToken, verifyAdmin, apiLimit, tenantController.createTenant);
// router.put("/tenants/:id", verifyToken, verifyAdmin, apiLimit, tenantController.updateTenant);
// router.delete("/tenants/:id", verifyToken, verifyAdmin, apiLimit, tenantController.deleteTenant);
// router.get("/tenants/:id", verifyToken, verifyAdmin, apiLimit, tenantController.getTenant);
// router.get("/tenants", verifyToken, verifyAdmin, apiLimit, tenantController.getAllTenants);

// ✅ API ผู้เช่าจองห้องเอง (Login แล้วใช้ได้)
router.post("/tenants/assign-room", verifyToken, apiLimit, tenantController.assignRoom);


// // ✅ API ห้องพัก (Rooms)
router.post("/rooms", apiLimit, roomController.createRoom);
router.put("/rooms/:id", apiLimit, roomController.updateRoom);
// router.delete("/rooms/:id", apiLimit, roomController.deleteRoom);
// router.get("/rooms/:id", apiLimit, roomController.getRoom);
router.get("/rooms", apiLimit, roomController.getAllRooms);
router.post("/rooms/enter", verifyToken, roomController.enterRoom);
router.get("/rooms/my-room", verifyToken, roomController.getMyRoom);

// // ✅ API การชำระเงิน (Payments)
router.post("/payments", verifyToken, verifyAdmin, paymentController.createPayment);
router.get("/payments/my", verifyToken, paymentController.getMyPayments);
router.put("/payments/:id/upload-slip", verifyToken, paymentController.uploadSlip);
router.put("/payments/:id/status", verifyToken, verifyAdmin, paymentController.updateStatus);
// router.post("/payments", apiLimit, paymentController.createPayment);
// router.put("/payments/:id", apiLimit, paymentController.updatePayment);
// router.delete("/payments/:id", apiLimit, paymentController.deletePayment);
// router.get("/payments/:id", apiLimit, paymentController.getPayment);
// router.get("/payments", apiLimit, paymentController.getAllPayments);

// // ✅ API การแจ้งซ่อม (Maintenance Requests)
router.post("/maintenance", verifyToken,apiLimit, maintenanceController.createRequest);
router.get("/maintenance", verifyToken, apiLimit,maintenanceController.getMyRequests);
router.get("/maintenance/:id", verifyToken, apiLimit,maintenanceController.getRequestById);
router.put("/maintenance/:id", verifyToken, apiLimit,maintenanceController.updateRequest);
router.delete("/maintenance/:id", verifyToken, apiLimit,maintenanceController.deleteRequest);
router.put("/maintenance/:id/status", verifyToken, verifyAdmin, maintenanceController.updateStatusByAdmin);


// // ✅ API ผู้ใช้ (Users)
// router.post("/users", apiLimit, userController.createUser);
router.get("/users/:id", apiLimit, userController.getUser);
router.put("/users/:id", apiLimit, userController.updateUser);
router.delete("/users/:id", apiLimit, userController.deleteUser);
router.get("/users", apiLimit, userController.getAllUsers);

router.post("/posts", verifyToken, verifyAdmin, postController.createPost);
router.get("/posts/:id", verifyToken, postController.getPost);
router.get("/posts", verifyToken, postController.getAllPosts);
router.put("/posts/:id", verifyToken, verifyAdmin, postController.updatePost);
router.delete("/posts/:id", verifyToken, verifyAdmin, postController.deletePost);

// // ✅ API การส่งข้อความ (Private Messages)
// router.post("/messages", verifyToken, messageController.sendToAdmin);
// router.post("/messages/reply", verifyToken, verifyAdmin, messageController.adminReply);
// router.get("/messages/sent", verifyToken, messageController.getSentMessages);
// router.get("/messages/received", verifyToken, messageController.getReceivedMessages);

// ✅ API ยืนยันตัวตน (Authentication)
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);

// ✅ ทดสอบ Middleware: API นี้ต้อง Login ก่อนถึงใช้งานได้
router.get("/profile", verifyToken, (req, res) => {
    res.json({ message: "This is a protected route", user: req.user });
  });

module.exports = router;
