const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../middlewares/auth");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");

const prisma = new PrismaClient();
const router = express.Router();

const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { username, password, firstname, lastname, email } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        firstname,
        lastname,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.emailVerificationToken.create({
      data: {
        token,
        userId: newUser.id,
      },
    });

    const verifyUrl = `${req.protocol}://${req.get(
      "host"
    )}/verify-email?token=${token}`;
    const emailSubject = "Email Verification";
    const emailMessage = `Please verify your email by clicking on the following link: ${verifyUrl}`;

    await sendEmail(newUser.email, emailSubject, emailMessage);

    res.status(201).json({
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { isVerified: true },
    });

    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    res.status(200).json({ message: "Email verified successfully" });
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

    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified" });
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
    return res
      .status(401)
      .json({ message: "No token, authorization denied. here" });
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

router.post("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0, httpOnly: true });
  res.status(200).json({ message: "Logged out" });
});

module.exports = router;
