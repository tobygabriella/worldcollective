import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";

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
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No userId found in localStorage");
      return;
    }

    const newSocket = io(`${API_KEY}`, {
      query: { userId },
    });

    newSocket.on("connect", () => {
      fetchNotifications();
    });

    newSocket.on("notification", (notification) => {
      if (notification.userId === parseInt(userId)) {
        const formattedNotification = {
          ...notification,
          timeAgo: formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          }),
        };
        setNotifications((prev) => [formattedNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.readyState === 1) {
        newSocket.close();
      }
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_KEY}/notifications/${id}/mark-as-read`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
       setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
