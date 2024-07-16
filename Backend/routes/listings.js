const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../middlewares/auth");
const cloudinary = require("../config/cloudinaryConfig");
const { buildFilters } = require("../utils/buildFilters.js");
const { sendNotification } = require("../services/notificationService");
const NotificationType = require("../Enums/NotificationType.js");
const logActivity = require("../middlewares/logActivity");

const prisma = new PrismaClient();
const router = express.Router();
router.use(verifyToken);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpeg", "png"],
  },
});

const upload = multer({ storage: storage });

router.post(
  "/listings",
  logActivity(),
  upload.array("images", 8),
  async (req, res) => {
    const {
      title,
      description,
      category,
      condition,
      subcategory,
      brand,
      auction,
      initialBid,
    } = req.body;

    const price =
      auction === "true" ? parseFloat(initialBid) : parseFloat(req.body.price);

    if (isNaN(price)) {
      return res
        .status(400)
        .json({ error: "Invalid price or initial bid value" });
    }
    const imageUrls = req.files.map((file) => file.path);
    const sellerId = req.user.id;

    try {
      const newListing = await prisma.listing.create({
        data: {
          title,
          description,
          price: price,
          category,
          subcategory,
          brand,
          condition,
          imageUrls,
          sellerId: parseInt(sellerId),
          status: "active",
          auction: auction === "true",
          initialBid: auction === "true" ? price : null,
          currentBid: auction === "true" ? price : null,
          auctionEndTime:
            auction === "true"
              ? new Date(Date.now() + 24 * 60 * 60 * 1000)
              : null,
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

router.get("/listings/user", logActivity(), verifyToken, async (req, res) => {
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

router.get("/listings/:id", logActivity(), async (req, res) => {
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

router.delete("/listings/:id", verifyToken, async (req, res) => {
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

router.get("/listings/category/:category", async (req, res) => {
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

router.get(
  "/listings/subcategory/:subcategory",
  logActivity(),
  async (req, res) => {
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
  }
);

router.get("/listings/price/:maxPrice", logActivity(), async (req, res) => {
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

router.get("/listings/brand/:brand", logActivity(), async (req, res) => {
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

router.get(
  "/listings/condition/:condition",
  logActivity(),
  async (req, res) => {
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
  }
);

router.get("/search", logActivity(), async (req, res) => {
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

router.post(
  "/listings/:id/like",
  logActivity(),
  verifyToken,
  async (req, res) => {
    const { id: itemId } = req.params;
    const userId = req.user.id;
    const io = req.app.locals.io;

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
      //finding the seller id of the listing liked
      const listing = await prisma.listing.findUnique({
        where: { id: parseInt(itemId) },
        include: { seller: true },
      });

      const liker = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      const listingImage = listing.imageUrls[0];

      const notificationContent = `@${liker.username} liked your item ${listing.title}.`;
      const notificationData = {
        content: notificationContent,
        userId: listing.sellerId,
        isRead: false,
        type: NotificationType.LIKE,
        listingId: listing.id,
        listingImage: listingImage,
        usernameTarget: liker.username,
      };
      await sendNotification(notificationData, io);

      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking item:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while liking the item" });
    }
  }
);

router.delete("/listings/:id/like", verifyToken, async (req, res) => {
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

router.get("/wishlist", verifyToken, logActivity(), async (req, res) => {
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
    res
      .status(500)
      .json({ error: "Something went wrong while fetching liked items" });
  }
});

router.get(
  "/listings/:id/like-status",
  logActivity(),
  verifyToken,
  async (req, res) => {
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
  }
);

router.post(
  "/create-payment-intent",
  logActivity(),
  verifyToken,
  async (req, res) => {
    const { amount } = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Amount in cents
        currency: "usd",
      });

      res.status(201).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        error: "Something went wrong while creating the payment intent",
      });
    }
  }
);

router.post(
  "/listings/:id/complete-purchase",
  logActivity(),
  verifyToken,
  async (req, res) => {
    const { id: listingId } = req.params;
    const { paymentIntentId } = req.body;
    const userId = req.user.id;
    const io = req.app.locals.io;

    try {
      // Update listing status to sold
      const updatedListing = await prisma.listing.update({
        where: { id: parseInt(listingId) },
        data: { status: "sold" },
      });

      // Record transaction details
      const transaction = await prisma.transaction.create({
        data: {
          listingId: parseInt(listingId),
          buyerId: parseInt(userId),
          paymentIntentId,
        },
      });

      const listingImage = updatedListing.imageUrls[0];
      //notification for the seller
      const sellerId = updatedListing.sellerId;
      const notificationContent = `Your item "${updatedListing.title}" has been purchased.`;

      const sellerNotification = {
        content: notificationContent,
        sellerId: sellerId,
        userId: sellerId,
        isRead: false,
        type: NotificationType.PURCHASE,
        listingId: parseInt(listingId),
        listingImage: listingImage,
      };

      await sendNotification(sellerNotification, io);

      const buyerNotificationContent = `You just successfully purchased "${updatedListing.title}". Please leave a review!`;

      const buyerNotification = {
        content: buyerNotificationContent,
        sellerId: sellerId,
        userId: userId,
        isRead: false,
        type: NotificationType.REVIEW_REMINDER,
        listingId: parseInt(listingId),
        listingImage: listingImage,
      };

      await sendNotification(buyerNotification, io);
      // Fetch users who have liked this item
      const likes = await prisma.like.findMany({
        where: { itemId: parseInt(listingId) },
        include: { user: true },
      });

      // Create notifications for users who liked this item
      for (const like of likes) {
        const user = like.user;
        if (user.id !== userId) {
          const likeNotificationContent = `An item you liked "${updatedListing.title}" has been purchased.`;
          const userNotification = {
            content: likeNotificationContent,
            userId: user.id,
            isRead: false,
            type: NotificationType.LIKE_PURHASE,
            listingId: parseInt(listingId),
            listingImage: listingImage,
          };

          await sendNotification(userNotification, io);
        }
      }

      res
        .status(200)
        .json({ message: "Purchase completed successfully", transaction });
    } catch (error) {
      console.error("Error completing purchase:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while completing the purchase" });
    }
  }
);

router.post(
  "/listings/:id/reviews",
  verifyToken,
  logActivity(),
  async (req, res) => {
    const { content, rating, sellerId } = req.body;
    const { id: listingId } = req.params;
    const reviewerId = req.user.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
      // Check if the user has purchased the item
      const transaction = await prisma.transaction.findFirst({
        where: {
          listingId: parseInt(listingId),
          buyerId: reviewerId,
        },
      });

      if (!transaction) {
        return res
          .status(403)
          .json({ error: "You must purchase the item to leave a review" });
      }

      // if the user has already reviewed this listing
      const existingReview = await prisma.review.findFirst({
        where: {
          reviewerId,
          listingId: parseInt(listingId),
        },
      });

      if (existingReview) {
        return res
          .status(400)
          .json({ error: "You have already reviewed this listing" });
      }

      const review = await prisma.review.create({
        data: {
          content,
          rating,
          reviewer: { connect: { id: reviewerId } },
          seller: { connect: { id: parseInt(sellerId) } },
          listing: { connect: { id: parseInt(listingId) } },
        },
      });

      // Update seller's average rating and review count
      const reviews = await prisma.review.findMany({
        where: { sellerId: parseInt(sellerId) },
      });

      const reviewCount = reviews.length;
      const averageRating =
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount;

      await prisma.user.update({
        where: { id: parseInt(sellerId) },
        data: {
          reviewCount,
          averageRating,
        },
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while creating the review" });
    }
  }
);

router.get("/users/:id/reviews", logActivity(), async (req, res) => {
  const { id: sellerId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { sellerId: parseInt(sellerId) },
      include: {
        reviewer: {
          select: { username: true },
        },
        listing: {
          select: { imageUrls: true },
        },
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the reviews" });
  }
});

router.get("/listings/auctions/all", verifyToken, async (req, res) => {
  try {
    const auctionListings = await prisma.listing.findMany({
      where: {
        auction: true,
        status: "active",
      },
      orderBy: {
        auctionEndTime: "asc", // Sort by auction end time to show the soonest ending auctions first
      },
    });
    res.json(auctionListings);
  } catch (error) {
    console.error("Error fetching auction listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
