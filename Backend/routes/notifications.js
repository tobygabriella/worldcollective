const express = require("express");
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../middlewares/auth");
const { formatDistanceToNow } = require("date-fns");
const logActivity = require("../middlewares/logActivity");
const { clearScheduledJob } = require("../services/notificationService");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/notifications", verifyToken, logActivity(), async (req, res) => {
  const { content, userId } = req.body;

  try {
    const notification = await prisma.notification.create({
      data: {
        content,
        userId: parseInt(userId),
        isRead: false,
        type: req.body.type,
        usernameTarget: req.body.usernameTarget || null,
        listingId: req.body.listingId ? parseInt(req.body.listingId) : null,
        sellerId: req.body.sellerId ? parseInt(req.body.sellerId) : null,
      },
    });
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while creating the notification" });
  }
});

router.get("/notifications", verifyToken, logActivity(), async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query;

  try {
    const whereClause = { userId: parseInt(userId), isPending: false };

    if (type) {
      whereClause.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const groupedNotifications = notifications.reduce((acc, notif) => {
      const key = `${notif.type}-${notif.listingId || ""}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(notif);
      return acc;
    }, {});

    const formattedNotifications = Object.values(groupedNotifications).map(
      (group) => {
        if (group.length > 1 && group[0].type === "LIKE") {
          const users = group.map((notif) => notif.usernameTarget).slice(0, 3);
          const othersCount = group.length - users.length;
          const content = `${users.join(", ")}${
            othersCount > 0 ? `and ${othersCount} others` : ""
          } liked your listing.`;
          return {
            ...group[0],
            content,
            timeAgo: formatDistanceToNow(new Date(group[0].createdAt), {
              addSuffix: true,
            }),
          };
        } else {
          return {
            ...group[0],
            timeAgo: formatDistanceToNow(new Date(group[0].createdAt), {
              addSuffix: true,
            }),
          };
        }
      }
    );

    res.status(200).json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      error: "Something went wrong while fetching the notifications",
    });
  }
});

router.post(
  "/notifications/mark-all-as-read",
  verifyToken,
  async (req, res) => {
    const userId = req.user.id;

    try {
      await prisma.notification.updateMany({
        where: { userId: parseInt(userId), isRead: false },
        data: { isRead: true },
      });

      res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res
        .status(500)
        .json({ error: "Something went wrong while updating notifications" });
    }
  }
);

router.post(
  "/notifications/:id/mark-as-read",
  verifyToken,
  async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { isRead: true },
      });

      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({
        error: "Something went wrong while updating the notification",
      });
    }
  }
);

router.get("/notifications/unread-count", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const count = await prisma.notification.count({
      where: { userId: parseInt(userId), isRead: false },
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).json({
      error: "Something went wrong while fetching notifications count",
    });
  }
});

router.put(
  "/notifications/:id/interact",
  verifyToken,
  logActivity(),
  async (req, res) => {
    const { id } = req.params;

    try {
      const notification = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: {
          interactionCount: { increment: 1 },
          lastInteractedAt: new Date(), // Update the timestamp
        },
      });

      res.status(200).json(notification);
    } catch (error) {
      console.error("Error recording notification interaction:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.get("/notifications/important", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const importantNotifications = await prisma.notification.findMany({
      where: { userId: parseInt(userId), isImportant: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(importantNotifications);
  } catch (error) {
    console.error("Error fetching important notifications:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/notifications/pending", verifyToken, async (req, res) => {
  const userId = req.user.id; // Assuming you have user authentication set up

  try {
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        userId,
        isPending: true,
      },
    });

    clearScheduledJob(userId);

    await prisma.notification.updateMany({
      where: {
        userId,
        isPending: true,
      },
      data: {
        isPending: false,
      },
    });

    res.json(pendingNotifications);
  } catch (error) {
    console.error("Error fetching pending notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/notifications/pending/count", verifyToken, async (req, res) => {
  const userId = req.user.id; // Assuming you have user authentication set up

  try {
    const pendingCount = await prisma.notification.count({
      where: {
        userId,
        isPending: true,
      },
    });

    res.json({ count: pendingCount });
  } catch (error) {
    console.error("Error fetching pending notifications count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
