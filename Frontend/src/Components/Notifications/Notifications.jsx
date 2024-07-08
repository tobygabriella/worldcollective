import React, { useEffect, useState } from "react";
import { useSocket } from "../Contexts/SocketContext";
import Loading from "../Loading/Loading.jsx";
import "./Notifications.css";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Notifications = () => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_KEY}/notifications`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.off("notification");
  }, [socket]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="notificationsPage">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((notif, index) => (
            <li key={index} className={notif.isRead ? "read" : "unread"}>
              {notif.content}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
