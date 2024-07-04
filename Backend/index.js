require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bodyParser = require("body-parser");

const saltRounds = 14;
const secretKey = process.env.JWT_SECRET;
const app = express();
const port = 3002;

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpeg", "png"],
  },
});

const upload = multer({ storage: storage });
app.post("/listings",verifyToken, upload.array("images", 8), async (req, res) => {
   const { title, description, price, category, condition ,subcategory, brand } = req.body;
   const imageUrls = req.files.map((file) => file.path);
   const sellerId = req.user.id;

  try {
    const newListing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        subcategory,
        brand,
        condition,
        imageUrls,
        sellerId: parseInt(sellerId),
        status: "active",
      },
    });
    res.status(201).json(newListing);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while creating the listing" });
  }
});

app.get("/listings/user", verifyToken,async (req, res) => {
 const userId = req.user.id;
  try {
    const userListings = await prisma.listing.findMany({
      where: {
        sellerId: userId,
      },
    });
    res.status(200).json(userListings);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});

app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: true,
      },
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listing" });
  }
});

app.delete("/listings/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const sellerId = req.user.id;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (listing.sellerId !== sellerId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this listing" });
    }

    await prisma.listing.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while deleting the listing" });
  }
});

app.get("/listings/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const listings = await prisma.listing.findMany({
      where: { category },
    });
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings by category:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});

app.get("/listings/subcategory/:subcategory", async (req, res) => {
  const { subcategory } = req.params;
  try {
    const listings = await prisma.listing.findMany({ where: { subcategory } });
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings by subcategory:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});

app.get("/listings/price/:maxPrice", async (req, res) => {
  const { maxPrice } = req.params;
  try {
    const listings = await prisma.listing.findMany({
      where: { price: { lte: parseFloat(maxPrice) } },
    });
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings by price:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
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
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
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

app.get("/protected", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
