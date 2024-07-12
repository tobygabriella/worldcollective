const { PrismaClient } = require("@prisma/client");
const { subDays } = require("date-fns");
const prisma = new PrismaClient();
const threshold = 5;

const sendNotification = async (notificationData, io) => {
  const userId = notificationData.userId;
  const userSockets = Array.from(io.sockets.sockets.values()).filter(
    (socket) => socket.userId == userId
  );

  const recentTimeframe = subDays(new Date(), 5);

  // Check if the type should be marked as important for this specific user
  const interactionCount = await prisma.notification.count({
    where: {
      type: notificationData.type,
      userId: userId,
      lastInteractedAt: {
        gte: recentTimeframe,
      },
    },
  });

  const isImportant = interactionCount >= threshold;

  // Check for an existing similar notification
  const existingNotification = await prisma.notification.findFirst({
    where: {
      type: notificationData.type,
      userId: notificationData.userId,
      listingId: notificationData.listingId,
      usernameTarget: notificationData.usernameTarget,
    },
    orderBy: { createdAt: "desc" },
  });

  let savedNotification;
  if (existingNotification) {
    if (notificationData.type === "LIKE") {
      // Extract existing users who liked
      let usersWhoLiked = existingNotification.usernameTarget
        ? existingNotification.usernameTarget.split(", ")
        : [];

      // Add the new user who liked
      if (!usersWhoLiked.includes(notificationData.usernameTarget)) {
        usersWhoLiked.push(notificationData.usernameTarget);
      }

      // Fetch the listing details to get the listing name
      const listing = await prisma.listing.findUnique({
        where: { id: notificationData.listingId },
      });

      // Format the new content for LIKE notifications
      const uniqueUsersWhoLiked = [...new Set(usersWhoLiked)];
      const othersCount = uniqueUsersWhoLiked.length - 3;
      const content = `@${uniqueUsersWhoLiked.slice(0, 3).join(", ")}${
        othersCount > 0 ? ` and ${othersCount} others` : ""
      } liked your listing "${listing.title}".`;

      // Update the existing notification
      savedNotification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          createdAt: new Date(), // Update the timestamp
          isImportant,
          content, // Update the content
          usernameTarget: uniqueUsersWhoLiked.join(", "), // Update the username list
        },
      });

      // Emit an event to remove the old notification
      if (userSockets.length > 0) {
        userSockets[0].emit("removeNotification", existingNotification.id);
      }
    } else if (notificationData.type === "FOLLOW") {
      // For FOLLOW notifications, update the existing notification with the new timestamp
      savedNotification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          createdAt: new Date(), // Update the timestamp
          isImportant,
          content: `@${notificationData.usernameTarget} followed you.`, // Update the content
        },
      });
    }
  } else {
    const notification = {
      ...notificationData,
      isImportant,
    };

    savedNotification = await prisma.notification.create({
      data: notification,
    });
  }

  if (userSockets.length > 0) {
    userSockets[0].emit("notification", savedNotification);
  }
};

const updateImportantNotificationTypes = async () => {
  const recentTimeframe = subDays(new Date(), 5);

  // Get all users
  const users = await prisma.user.findMany();

  for (const user of users) {
    const userId = user.id;

    // Find interaction counts by type for this user
    const interactionCountsByType = await prisma.notification.groupBy({
      by: ["type"],
      _sum: {
        interactionCount: true,
      },
      where: {
        userId: userId,
        lastInteractedAt: {
          gte: recentTimeframe,
        },
      },
    });

    // Determine which types are important for this user
    const importantTypes = interactionCountsByType
      .filter((group) => group._sum.interactionCount >= threshold)
      .map((group) => group.type);
  }
};

module.exports = { sendNotification, updateImportantNotificationTypes };
