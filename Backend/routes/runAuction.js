const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { AuctionSystem } = require("../services/auctionSystem");
const { sendNotification } = require("../services/notificationService");
const NotificationType = require("../Enums/NotificationType.js");

const prisma = new PrismaClient();
const auctionSystem = new AuctionSystem(prisma);
const router = express.Router();

router.post("/run-daily-auctions", async (req, res) => {
  const io = req.app.locals.io;
  try {
    const processedAuctions = await auctionSystem.processEndingAuctions();

    // Get the assignments (winning bids) from the auction system
    const assignments = auctionSystem.getAssignments();

    // Send notifications for winning bids
    for (const [auctionId, winningBid] of assignments) {
      const auction = await prisma.listing.findUnique({
        where: { id: auctionId },
      });

      if (auction && winningBid) {
        const notificationContent = `You won the auction for "${auction.title}"`;
        await sendNotification(
          {
            content: notificationContent,
            userId: winningBid.bidder.id,
            type: NotificationType.PURCHASE,
            listingId: auction.id,
            listingImage: auction.imageUrls[0],
          },
          io
        );
      }
    }

    res.status(200).json({
      message: `Processed ${processedAuctions} auctions successfully`,
    });
  } catch (error) {
    console.error("Error running daily auctions:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while running daily auctions" });
  }
});

module.exports = router;
