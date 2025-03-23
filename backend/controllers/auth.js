const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler"); // ป้องกันเซิร์ฟเวอร์ล่มจาก Error
require("dotenv").config();

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";



// ✅ 1. Register (สมัครสมาชิก)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // ตรวจสอบว่า Email มีอยู่แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    // ตรวจสอบ role ให้เป็นค่า VALID เท่านั้น
    const validRoles = ["TENANT", "ADMIN"];
    const userRole = validRoles.includes(role) ? role : "TENANT";

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกผู้ใช้ลงฐานข้อมูล
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // สร้าง JWT Token
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 2. Login (เข้าสู่ระบบ)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    // ค้นหาผู้ใช้จากอีเมล
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    // ตรวจสอบรหัสผ่าน
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    // สร้าง JWT Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: "1h" });

    // ตั้งค่า Cookie สำหรับเก็บ Token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true บน production
      maxAge: 3600000, // 1 ชั่วโมง
    });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ 3. Logout (ออกจากระบบ)
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// ✅ 4. Middleware ตรวจสอบ Token
const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized, no token provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

// เช็คว่า user ต้องเป็น ADMIN เท่านั้น
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

module.exports = { register, login, logout, verifyToken,verifyAdmin };
