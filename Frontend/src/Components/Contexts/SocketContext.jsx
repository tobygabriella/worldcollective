import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

   const fetchNotifications = async () => {
     try {
       const response = await fetch(`${API_KEY}/notifications`, {
         method: "GET",
         credentials: "include",
         headers: {
           Authorization: `Bearer ${localStorage.getItem("token")}`,
         },
       });
       if (response.ok) {
         const data = await response.json();
         setNotifications(data);
         setUnreadCount(data.filter((notif) => !notif.isRead).length);
       } else {
         throw new Error("Failed to fetch notifications");
       }
     } catch (error) {
       console.error("Error fetching notifications:", error);
     }
   };

  useEffect(() => {
    const newSocket = io(`${API_KEY}`, {
      query: { userId: localStorage.getItem("userId") },
    });
    setSocket(newSocket);

    fetchNotifications();

    newSocket.on("notification", (notification) => {
      if (notification.userId === parseInt(localStorage.getItem("userId"))) {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    newSocket.on("connect", () => {
      fetchNotifications(); // Fetch unread notifications on reconnect
    });

   return () => {
     newSocket.close();
   };
  }, []);



  const markAsRead = async () => {
    try {
      await fetch(`${API_KEY}/notifications/mark-as-read`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, notifications, unreadCount, markAsRead }}
    >
      {children}
    </SocketContext.Provider>
  );
};
