const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

// Import Routes
const apiRouter = require("./routes/api");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// API Routes
app.use("/api/v1", apiRouter);

// Ports
const port = process.env.PORT || 3000;
const secure_port = process.env.SECURE_PORT || 8443;

// ✅ รันเซิร์ฟเวอร์ HTTP บนพอร์ตหลัก
http.createServer(app).listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

// ✅ รันเซิร์ฟเวอร์ HTTP อีกพอร์ตหนึ่ง
if (port !== secure_port) {
  http.createServer(app).listen(secure_port, () => {
    console.log(`🔐 Secure server (HTTP) is running on port ${secure_port}`);
  });
}

// ✅ Graceful Shutdown (ปิด Prisma เมื่อเซิร์ฟเวอร์ปิด)
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
