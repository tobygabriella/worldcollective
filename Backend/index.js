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
const { buildFilters } = require("./Utils/buildFilters");

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
app.post(
  "/listings",
  verifyToken,
  upload.array("images", 8),
  async (req, res) => {
    const {
      title,
      description,
      price,
      category,
      condition,
      subcategory,
      brand,
    } = req.body;
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
  }
);

app.get("/listings/user", verifyToken, async (req, res) => {
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
  const filters = buildFilters({ category }, req.query);
  try {
    const listings = await prisma.listing.findMany({
      where: { ...filters },
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
  const filters = buildFilters({ subcategory }, req.query);
  try {
    const listings = await prisma.listing.findMany({ where: { ...filters } });
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
  const filters = buildFilters(
    { price: { lte: parseFloat(maxPrice) } },
    req.query
  );
  try {
    const listings = await prisma.listing.findMany({
      where: { ...filters },
    });
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings by price:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});
app.get("/listings/brand/:brand", async (req, res) => {
  const { brand } = req.params;
  const filters = buildFilters({ brand }, req.query);

  try {
    const listings = await prisma.listing.findMany({
      where: { ...filters },
    });
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings by brand:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});
app.get("/listings/condition/:condition", async (req, res) => {
  const { condition } = req.params;
  const filters = buildFilters({ condition }, req.query);

  try {
    const listings = await prisma.listing.findMany({
      where: { ...filters },
    });
    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching listings by condition:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listings" });
  }
});

app.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }
  const keywords = query.split(" ").map((keyword) => keyword.trim());
  const filters = buildFilters({}, req.query);
  try {
    // Perform a search for listings
    const listings = await prisma.listing.findMany({
      where: {
        AND: [
          // Ensure that each keyword must match at least one of the fields
          ...keywords.map((keyword) => ({
            OR: [
              {
                title: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  equals: keyword,
                  mode: "insensitive",
                },
              },
              {
                subcategory: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
              {
                brand: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            ],
          })),
          filters,
        ],
      },
    });

     const users = await prisma.user.findMany({
       where: {
         username: { contains: query, mode: "insensitive" },
       },
       select: {
         id: true,
         username: true,
         bio: true,
       },
     });

    // Combine results into a single response object
    const results = {
      listings,
      users,
    };

    res.status(200).json(results);
  } catch (error) {
    console.error("Error performing search:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while performing the search" });
  }
});

app.get("/users/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        firstname: true,
        lastname: true,
        listings: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the user details" });
  }
});
// Follow a user
app.post("/users/:id/follow", verifyToken, async (req, res) => {
  const { id: followingId } = req.params;
  const followerId = req.user.id;

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    res.status(201).json(follow);
  } catch (error) {
    console.error("Error following user:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while following the user" });
  }
});

// Unfollow a user
app.delete("/users/:id/unfollow", verifyToken, async (req, res) => {
  const { id: followingId } = req.params;
  const followerId = req.user.id;

  try {
    await prisma.follow.deleteMany({
      where: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while unfollowing the user" });
  }
});

// Get followers
app.get("/users/:id/followers", async (req, res) => {
  const { id } = req.params;

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: parseInt(id) },
      include: { follower: true },
    });

    res.status(200).json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching followers" });
  }
});

// Get followings
app.get("/users/:id/followings", async (req, res) => {
  const { id } = req.params;

  try {
    const followings = await prisma.follow.findMany({
      where: { followerId: parseInt(id) },
      include: { following: true },
    });

    res.status(200).json(followings);
  } catch (error) {
    console.error("Error fetching followings:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching followings" });
  }
});
// Like an item
app.post("/listings/:id/like", verifyToken, async (req, res) => {
  const { id: itemId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: parseInt(userId),
        itemId: parseInt(itemId),
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "Item is already liked" });
    }

    const like = await prisma.like.create({
      data: {
        userId: parseInt(userId),
        itemId: parseInt(itemId),
      },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error("Error liking item:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while liking the item" });
  }
});

// Unlike an item
app.delete("/listings/:id/like", verifyToken, async (req, res) => {
  const { id: itemId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: parseInt(userId),
        itemId: parseInt(itemId),
      },
    });

    if (!existingLike) {
      return res.status(400).json({ message: "Item is not liked" });
    }

    await prisma.like.delete({
      where: { id: existingLike.id },
    });

    res.status(200).json({ message: "Item unliked successfully" });
  } catch (error) {
    console.error("Error unliking item:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while unliking the item" });
  }
});

// Get all liked items (wishlist) for the user
app.get("/wishlist", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const likedItems = await prisma.like.findMany({
      where: { userId: parseInt(userId) },
      include: {
        item: true,
      },
    });

    const listings = likedItems.map((like) => like.item);

    res.status(200).json(listings);
  } catch (error) {
    console.error("Error fetching liked items:", error);
    res.status(500).json({ error: "Something went wrong while fetching liked items" });
  }
});

app.get("/listings/:id/like-status", verifyToken, async (req, res) => {
  const { id: itemId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: parseInt(userId),
        itemId: parseInt(itemId),
      },
    });

    res.status(200).json({ isLiked: !!existingLike });
  } catch (error) {
    console.error("Error fetching liked status:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching liked status" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password, firstname, lastname} = req.body;
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
