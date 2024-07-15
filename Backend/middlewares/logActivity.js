const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @param {string} activityType
 */
const logActivity = (activityType) => {
  return async (req, res, next) => {
    const userId = req.user?.id;

    if (userId) {
      try {
        // Check if the user exists in the database
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!userExists) {
          console.error(`User with ID ${userId} does not exist.`);
          return next();
        }

        // Log the activity
        await prisma.userActivity.create({
          data: {
            userId: userId,
            activityType: activityType || req.method + " " + req.originalUrl,
            timestamp: new Date(),
          },
        });
      } catch (error) {
        console.error("Error logging activity:", error);
      }
    } else {
      console.error("No userId found in request");
    }

    next();
  };
};

module.exports = logActivity;
