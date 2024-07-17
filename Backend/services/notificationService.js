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

  const notification = {
    ...notificationData,
    isImportant,
  };
  const savedNotification = await prisma.notification.create({
    data: notification,
  });

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
