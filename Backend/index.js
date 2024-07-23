require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const listingRoutes = require("./routes/listings");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");
const auctionRoute = require("./routes/runAuction");
const cartRoutes = require("./routes/cart");
const schedule = require("node-schedule");
const fetch = require("node-fetch");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
const port = 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);
app.locals.io = io;

app.use(authRoutes);
app.use(listingRoutes);
app.use(notificationRoutes);
app.use(userRoutes);
app.use(auctionRoute);
app.use(cartRoutes);

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    socket.disconnect(true);
    return;
  }
  socket.userId = userId;

  socket.on("disconnect", () => {
    delete socket.userId;
  });
});
// Import services to run background tasks
const {
  updateImportantNotificationTypes,
} = require("./services/notificationService");
setInterval(updateImportantNotificationTypes, 60 * 1000);

const scheduleDailyAuctions = () => {
  schedule.scheduleJob({ hour: 23, minute: 59 }, async () => {
    try {
      const response = await fetch("http://localhost:3002/run-daily-auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error processing daily auctions:", error);
    }
  });
};

scheduleDailyAuctions();
server.listen(port, () => {});
