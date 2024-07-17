const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../middlewares/auth");

const prisma = new PrismaClient();
const router = express.Router();

const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { username, password, firstname, lastname } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        firstname,
        lastname,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return res.status(400).json({ message: "Username not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    } else {
      const token = jwt.sign(
        {
          id: user.id,
        },
        secretKey,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 604800000, // 7 days
      });

      res.status(200).json({ token, user });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/protected", verifyToken, async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
});

module.exports = router;
