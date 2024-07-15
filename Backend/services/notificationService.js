const { PrismaClient } = require("@prisma/client");
const { subDays } = require("date-fns");
const prisma = new PrismaClient();
const schedule = require("node-schedule");
const { sendEmail } = require("../services/emailService");
const threshold = 5;
const scheduledJobs = new Map();
const pendingNotifications = new Map();

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
    //emit an event to remove old notification
    if (userSockets.length > 0) {
      userSockets[0].emit("removeNotification", existingNotification.id);
    }
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
          usernameTarget: uniqueUsersWhoLiked.join(", "), //update the username list
          isPending: true,
          isRead: false,
        },
      });
    } else if (notificationData.type === "FOLLOW") {
      // For FOLLOW notifications, update the existing notification with the new timestamp
      savedNotification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          createdAt: new Date(), // Update the timestamp
          isImportant,
          content: `@${notificationData.usernameTarget} followed you.`, // Update the content
          isPending: true,
          isRead: false,
        },
      });
    }
  } else {
    const notification = {
      ...notificationData,
      isImportant,
      isPending: true,
    };

    savedNotification = await prisma.notification.create({
      data: notification,
    });
  }

  const userActivePeriods = await prisma.userActivePeriods.findUnique({
    where: { userId },
  });

  if (!userActivePeriods) {
    if (userSockets.length > 0) {
      userSockets[0].emit("notification", savedNotification);
    }
    await prisma.notification.update({
      where: { id: savedNotification.id },
      data: { isPending: false },
    });
  }
  await scheduleNotifications(userId, savedNotification, io);
  // Emit pending notification count
  const pendingCount = await prisma.notification.count({
    where: {
      userId,
      isPending: true,
    },
  });
  if (userSockets.length > 0) {
    userSockets[0].emit("pendingNotificationCount", pendingCount);
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

const performKMeansClustering = async (userId, k = 3, maxIterations = 100) => {
  try {
    // Step 1: Fetch user activity data for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const activities = await prisma.userActivity.findMany({
      where: {
        userId,
        timestamp: {
          gte: oneWeekAgo, // Only include activities from the past week
        },
      },
    });

    // Step 2: Extract the hours from the activity timestamps
    const hours = activities.map((activity) =>
      new Date(activity.timestamp).getHours()
    );
    // Step 3: Initialize centroids (randomly select k unique hours)
    let centroids = [];
    while (centroids.length < k) {
      const randomHour = hours[Math.floor(Math.random() * hours.length)];
      if (!centroids.includes(randomHour)) {
        centroids.push(randomHour);
      }
    }

    // Helper function to calculate distance between two points (hours)
    const calculateDistance = (point, centroid) => Math.abs(point - centroid);

    // Helper function to update centroids
    const updateCentroids = (clusters) => {
      return clusters.map((cluster) => {
        if (cluster.length === 0) return 0; // Avoid division by zero
        const sum = cluster.reduce((acc, point) => acc + point, 0);
        return Math.round(sum / cluster.length);
      });
    };

    let clusters = [];
    let iterations = 0;

    while (iterations < maxIterations) {
      // Step 4: Assign each point to the nearest centroid
      clusters = Array.from({ length: k }, () => []);
      hours.forEach((hour) => {
        let minDistance = Infinity;
        let closestCentroid = 0;
        centroids.forEach((centroid, idx) => {
          const distance = calculateDistance(hour, centroid);
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = idx;
          }
        });
        clusters[closestCentroid].push(hour);
      });

      // Step 5: Update centroids based on the mean of assigned points
      const newCentroids = updateCentroids(clusters);

      // Check for convergence if centroids do not change
      if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) break;

      centroids = newCentroids;
      iterations++;
    }

    // Step 6: Determine the best hour from the largest cluster
    const bestCluster = clusters.reduce(
      (maxCluster, cluster) =>
        cluster.length > maxCluster.length ? cluster : maxCluster,
      clusters[0]
    );
    const bestHour = Math.round(
      bestCluster.reduce((acc, hour) => acc + hour, 0) / bestCluster.length
    );
    await prisma.userActivePeriods.upsert({
      where: { userId: userId },
      update: { mostActivePeriods: { set: [bestHour] } },
      create: {
        userId: userId,
        mostActivePeriods: { set: [bestHour] },
      },
    });
    return bestHour;
  } catch (error) {
    console.error("Error in K-means clustering:", error);
  }
};

const scheduleNotifications = async (userId, newNotification, io) => {
  const userSockets = Array.from(io.sockets.sockets.values()).filter(
    (socket) => socket.userId == userId
  );
  // Add the new notification to the pending list
  if (!pendingNotifications.has(userId)) {
    pendingNotifications.set(userId, []);
  }
  pendingNotifications.get(userId).push(newNotification);

  // Check if the job is already scheduled
  if (scheduledJobs.has(userId)) {
    return;
  }

  const bestHour = await performKMeansClustering(userId);

  const job = schedule.scheduleJob({hour: bestHour, minute:0}, async () => {
    const notifications = pendingNotifications.get(userId) || [];
    if (notifications.length > 0) {
      if (userSockets.length > 0) {
        notifications.forEach((notif) => {
          userSockets[0].emit("notification", notif);
        });
      } else if (userSockets.length === 0) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        if (user && user.email) {
          await sendEmail(
            user.email,
            "Missed Notifications- World Collective",
            `You have ${notifications.length} new notifications. Please log in to view them.`
          );
        }
      }

      await prisma.notification.updateMany({
        where: { userId, isPending: true },
        data: { isPending: false },
      });

      const pendingCount = await prisma.notification.count({
        where: {
          userId,
          isPending: true,
        },
      });
      if (userSockets.length > 0) {
        userSockets[0].emit("pendingNotificationCount", pendingCount);
      }
      // Clear the pending notifications
      pendingNotifications.set(userId, []);
    }
    // Remove the job from the map after it has run
    scheduledJobs.delete(userId);
  });

  // Store the scheduled job
  scheduledJobs.set(userId, job);
};

// Function to clear scheduled job
const clearScheduledJob = (userId) => {
  if (scheduledJobs.has(userId)) {
    const job = scheduledJobs.get(userId);
    job.cancel();
    scheduledJobs.delete(userId);
  }
};

module.exports = {
  sendNotification,
  updateImportantNotificationTypes,
  performKMeansClustering,
  scheduleNotifications,
  clearScheduledJob,
};
