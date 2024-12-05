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
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const prisma = new PrismaClient();
const router = express.Router();

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
  verifyToken,
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
      isAuction,
      initialBid,
    } = req.body;

    const isAuctionListing = isAuction === "true";

    const price = isAuctionListing
      ? parseFloat(initialBid)
      : parseFloat(req.body.price);

    if (isNaN(price)) {
      return res
        .status(400)
        .json({ error: "Invalid price or initial bid value" });
    }
    const imageUrls = req.files.map((file) => file.path);
    const sellerId = req.user.id;

    try {
      const auctionEndTime = isAuctionListing
        ? new Date(new Date().setHours(23, 59, 59, 999))
        : null;

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
          isAuction: isAuctionListing,
          initialBid: isAuctionListing ? price : null,
          currentBid: isAuctionListing ? price : null,
          auctionEndTime: auctionEndTime,
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

router.get("/listings/user", verifyToken, logActivity(), async (req, res) => {
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

router.get("/listings/:id", verifyToken, logActivity(), async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        seller: true,
        bids: {
          orderBy: {
            amount: "desc",
          },
        },
      },
    });
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const highestBid =
      listing.bids.length > 0 ? listing.bids[0].amount : listing.initialBid;
    listing.currentBid = highestBid;

    res.status(200).json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the listing" });
  }
});

router.delete("/listings/:id", verifyToken, verifyToken, async (req, res) => {
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

router.get("/listings/category/:category", verifyToken, async (req, res) => {
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
  verifyToken,
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

router.get(
  "/listings/price/:maxPrice",
  verifyToken,
  logActivity(),
  async (req, res) => {
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
  }
);

router.get(
  "/listings/brand/:brand",
  verifyToken,
  logActivity(),
  async (req, res) => {
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
  }
);

router.get(
  "/listings/condition/:condition",
  verifyToken,
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

router.get("/search", verifyToken, logActivity(), async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }
  const keywords = query
    .split(" ")
    .map((keyword) => keyword.trim().toLowerCase());

  // Map specific keywords to standardized search terms
  const keywordMapping = {
    women: "womenswear",
    womenswear: "womenswear",
    womenwear: "womenswear",
    womens: "womenswear",
    mens: "menswear",
    menwear: "mesnwear",
    men: "menswear",
    menswear: "menswear",
  };

  const mappedKeywords = keywords.map(
    (keyword) => keywordMapping[keyword] || keyword
  );
  const filters = buildFilters({}, req.query);
  try {
    // Perform a search for listings
    const listings = await prisma.listing.findMany({
      where: {
        AND: [
          // Ensure that each keyword must match at least one of the fields
          ...mappedKeywords.map((keyword) => ({
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
          // Specific filter for women's or men's wear
          {
            NOT: {
              OR: [
                // Exclude men's listings if query is for women's wear
                mappedKeywords.includes("womenswear") && {
                  category: {
                    equals: "menswear",
                    mode: "insensitive",
                  },
                },
                // Exclude women's listings if query is for men's wear
                mappedKeywords.includes("menswear") && {
                  category: {
                    equals: "womenswear",
                    mode: "insensitive",
                  },
                },
              ].filter(Boolean), // filter out false conditions
            },
          },
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
  verifyToken,
  logActivity(),
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
  verifyToken,
  logActivity(),
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
  "/create-payment-intent/single",
  verifyToken,
  logActivity(),
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
  verifyToken,
  logActivity(),
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
          buyerId: parseInt(reviewerId),
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

router.get(
  "/users/:id/reviews",
  verifyToken,
  logActivity(),
  async (req, res) => {
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
  }
);

router.get("/listings/auctions/all", verifyToken, async (req, res) => {
  try {
    const auctionListings = await prisma.listing.findMany({
      where: {
        isAuction: true,
        status: "active",
      },
      orderBy: {
        auctionEndTime: "asc", // Sort by auction end time to show the soonest ending auctions first
      },
      include: {
        seller: true,
        bids: {
          orderBy: {
            amount: "desc",
          },
        },
      },
    });

    res.json(auctionListings);
  } catch (error) {
    console.error("Error fetching auction listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//fetch bids for a particular listing
router.get(
  "/listings/:id/bids",
  verifyToken,
  logActivity(),
  async (req, res) => {
    const { id: listingId } = req.params;

    try {
      const bids = await prisma.bid.findMany({
        where: { listingId: parseInt(listingId) },
        include: {
          user: {
            select: { username: true },
          },
        },
        orderBy: {
          amount: "desc",
        },
      });

      res.status(200).json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while fetching the bids" });
    }
  }
);

router.post(
  "/listings/:id/bids",
  verifyToken,
  logActivity(),
  async (req, res) => {
    const { id: listingId } = req.params;
    const { amount, paymentMethodId } = req.body;
    const userId = req.user.id;
    const io = req.app.locals.io;

    const bidAmount = parseInt(amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ error: "Invalid bid amount" });
    }

    try {
      // Get the current highest bid for the listing
      const listing = await prisma.listing.findUnique({
        where: { id: parseInt(listingId) },
        include: { bids: true },
      });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const currentHighestBid =
        listing.bids.length > 0
          ? Math.max(...listing.bids.map((bid) => bid.amount))
          : listing.initialBid;

      if (bidAmount <= currentHighestBid) {
        return res.status(400).json({
          error: "Your bid must be higher than the current highest bid.",
        });
      }

      // Create the new bid
      const bid = await prisma.bid.create({
        data: {
          amount: bidAmount,
          listingId: parseInt(listingId),
          userId: parseInt(userId),
          paymentMethodId: paymentMethodId,
        },
      });

      // Update the listing's current bid
      await prisma.listing.update({
        where: { id: parseInt(listingId) },
        data: {
          currentBid: bidAmount,
        },
      });

      // Fetch the bidder's username
      const bidder = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      // Create notification for the seller
      const notificationContent = `@${bidder.username} just bid $${amount} on your item "${listing.title}"`;
      const notificationData = {
        content: notificationContent,
        userId: listing.sellerId,
        isRead: false,
        type: NotificationType.BID,
        listingId: listing.id,
        listingImage: listing.imageUrls[0],
        usernameTarget: bidder.username,
      };
      await sendNotification(notificationData, io);

      const previousBidders = await prisma.bid.findMany({
        where: {
          listingId: parseInt(listingId),
          userId: {
            not: parseInt(userId),
          },
        },
        distinct: ["userId"],
        include: { user: true },
      });

      for (const previousBid of previousBidders) {
        if (!previousBid.user) {
          continue;
        }
        const notificationContentForPreviousBidder = `Another user has placed a bid on the item "${listing.title}" you previously placed a bid on. Do you want to place another bid?`;
        const notificationDataForPreviousBidder = {
          content: notificationContentForPreviousBidder,
          userId: previousBid.userId,
          isRead: false,
          type: NotificationType.BID,
          listingId: listing.id,
          listingImage: listing.imageUrls[0],
          usernameTarget: previousBid.user.username,
        };

        await sendNotification(notificationDataForPreviousBidder, io);
      }

      res.status(201).json(bid);
    } catch (error) {
      console.error("Error posting bid:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while posting the bid" });
    }
  }
);

router.post(
  "/create-setup-intent",
  verifyToken,
  logActivity(),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.stripeCustomerId) {
        return res
          .status(404)
          .json({ error: "User or Stripe customer not found" });
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: user.stripeCustomerId,
        payment_method_types: ["card"],
      });

      res.status(201).json({
        clientSecret: setupIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating setup intent:", error);
      res.status(500).json({
        error: "Something went wrong while creating the setup intent",
      });
    }
  }
);

router.get("/search/suggestions", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const suggestions = await prisma.listing.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { subcategory: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        title: true,
        id: true,
      },
      take: 10, // Limit to 10 suggestions
    });

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching suggestions" });
  }
});

module.exports = router;
