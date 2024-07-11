import React, { useEffect, useState } from "react";
import { useSocket } from "../Contexts/SocketContext";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";
import "./Notifications.css";
import AppHeader from "../Headers/AppHeader";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Notifications = () => {
  const { notifications, markAsRead } = useSocket();
  const { isLoading, stopLoading } = useLoading();

  useEffect(() => {
    if (notifications.length > 0) {
      stopLoading();
    }
  }, [notifications]);

  useEffect(() => {
    const timer = setTimeout(() => {
      markAsRead();
    }, 2000);

    return () => clearTimeout(timer);
  }, [markAsRead]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="notificationsPage">
      <AppHeader />
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul>
          {notifications.map((notif, index) => (
            <li
              key={index}
              className={`notificationItem ${notif.isRead ? "read" : "unread"}`}
            >
              <div className="notificationContent">
                {!notif.isRead && <span className="unreadIndicator"></span>}
                <p>{notif.content}</p>
              </div>
              <span className="notificationTime">{notif.timeAgo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
