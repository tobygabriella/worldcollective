const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const verifyToken = require("../middlewares/auth");
const logActivity = require("../middlewares/logActivity");
const { sendNotification } = require("../services/notificationService");
const NotificationType = require("../Enums/NotificationType.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.use(verifyToken);

router.get("/cart", async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { listing: true } } },
    });
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Error fetching cart" });
  }
});

router.post("/cart", async (req, res) => {
  const userId = req.user.id;
  const { listingId, quantity } = req.body;
  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_listingId: {
          cartId: cart.id,
          listingId: parseInt(listingId),
        },
      },
    });

    if (existingCartItem) {
      return res.status(400).json({ error: "Item already in cart" });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          listingId,
          quantity,
        },
      });
      res.status(201).json({ message: "Item added to cart" });
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Error adding item to cart" });
  }
});

router.delete("/cart/:itemId", async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;
  try {
    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        id: parseInt(itemId),
        cart: {
          userId: userId,
        },
      },
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/create-payment-intent/cart",
  verifyToken,
  logActivity(),
  async (req, res) => {
    const userId = req.user.id;
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { listing: true } } },
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total amount
      const amount = cart.items.reduce((total, item) => {
        return total + parseFloat(item.listing.price);
      }, 0);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.status(201).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Error creating payment intent" });
    }
  }
);

router.post("/cart/complete-purchase", verifyToken, async (req, res) => {
  const { paymentIntentId } = req.body;
  const userId = req.user.id;
  const io = req.app.locals.io;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { listing: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Mark listings as sold and record transactions
    const transactionPromises = cart.items.map(async (item) => {
      const updatedListing = await prisma.listing.update({
        where: { id: item.listingId },
        data: { status: "sold" },
      });

      const transaction = await prisma.transaction.create({
        data: {
          listingId: item.listingId,
          buyerId: userId,
          paymentIntentId,
        },
      });
      return transaction;
    });
    await Promise.all(transactionPromises);

    // Clear the cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(200).json({ message: "Purchase completed successfully" });
  } catch (error) {
    console.error("Error completing purchase:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while completing the purchase" });
  }
});

module.exports = router;
