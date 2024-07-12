const express = require("express");
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("../middlewares/auth");
const { sendNotification } = require("../services/notificationService");
const NotificationType = require("../Enums/NotificationType.js");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/users/:username", async (req, res) => {
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
        reviewCount: true,
        averageRating: true,
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

router.post("/users/:id/follow", verifyToken, async (req, res) => {
  const { id: followingId } = req.params;
  const followerId = req.user.id;
  const io = req.app.locals.io;

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId: parseInt(followerId),
        followingId: parseInt(followingId),
      },
    });

    // Fetch follower and following user details
    const follower = await prisma.user.findUnique({
      where: { id: parseInt(followerId) },
    });

    const followingUser = await prisma.user.findUnique({
      where: { id: parseInt(followingId) },
    });

    // Create a notification for the user being followed
    const notificationContent = `@${follower.username} just followed you.`;
    const notificationData = {
      content: notificationContent,
      userId: parseInt(followingId),
      isRead: false,
      type: NotificationType.FOLLOW,
      usernameTarget: follower.username,
    };
    await sendNotification(notificationData, io);

    res.status(201).json(follow);
  } catch (error) {
    console.error("Error following user:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while following the user" });
  }
});

router.delete("/users/:id/unfollow", verifyToken, async (req, res) => {
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

router.get("/users/:id/followers", async (req, res) => {
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

router.get("/users/:id/followings", async (req, res) => {
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

module.exports = router;
