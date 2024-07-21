import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingNotificationsCount, setPendingNotificationsCount] = useState(0);
  const { startLoading, isLoading, stopLoading } = useLoading();
  const [isNotificationsLoaded, setIsNotificationsLoaded] = useState(false);

  const fetchNotifications = async (type = "") => {
    startLoading();
    try {
      const query = type ? `?type=${type}` : "";
      const response = await fetch(`${API_KEY}/notifications${query}`, {
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
        setIsNotificationsLoaded(true);
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      stopLoading();
    }
  };

  const fetchPendingCount = async () => {
    startLoading();
    try {
      const response = await fetch(`${API_KEY}/notifications/pending/count`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingNotificationsCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching pending notifications count:", error);
    } finally {
      stopLoading();
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
      if (!isNotificationsLoaded) {
        fetchNotifications();
      }
      fetchPendingCount();
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

    newSocket.on("removeNotification", (notificationId) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    });

    newSocket.on("pendingNotificationCount", (count) => {
      setPendingNotificationsCount(count);
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

  const clearPendingCount = async () => {
    setPendingNotificationsCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        fetchNotifications,
        setNotifications,
        pendingNotificationsCount,
        clearPendingCount,
        isNotificationsLoaded,
      }}
    >
      {isLoading && <Loading />}
      {children}
    </SocketContext.Provider>
  );
};
