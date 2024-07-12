import React, { useEffect, useState } from "react";
import { useSocket } from "../Contexts/SocketContext";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";
import "./Notifications.css";
import AppHeader from "../Headers/AppHeader";
import { useNavigate } from "react-router-dom";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Notifications = () => {
  const { notifications, markAsRead } = useSocket();
  const { isLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

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

  const handleNotificationClick = async (notif) => {
    try {
      await fetch(`${API_KEY}/notifications/${notif.id}/interact`, {
        method: "PUT",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    } catch (error) {
      console.error("Error interacting with notification:", error);
    }

    if (notif.type === "FOLLOW") {
      navigate(`/users/${notif.usernameTarget}`);
    } else if (
      notif.type === "LIKE" ||
      notif.type === "PURCHASE" ||
      notif.type === "LIKE_PURCHASE"
    ) {
      navigate(`/listings/${notif.listingId}`);
    }
  };

  const importantNotifications = notifications.filter(
    (notif) => notif.isImportant
  );
  const otherNotifications = notifications.filter(
    (notif) => !notif.isImportant
  );

  return (
    <div className="notificationsPage">
      <AppHeader />
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <div>
          {importantNotifications.length > 0 && (
            <div className="importantNotifications">
              <h3>Priority</h3>
              <ul>
                {importantNotifications.map((notif, index) => (
                  <li
                    key={index}
                    className={`notificationItem ${
                      notif.isRead ? "read" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notificationContent">
                      {!notif.isRead && (
                        <span className="unreadIndicator"></span>
                      )}
                      {(notif.type === "LIKE" ||
                        notif.type === "LIKE_PURCHASE" ||
                        notif.type === "PURCHASE") &&
                        notif.listingImage && (
                          <img
                            src={notif.listingImage}
                            alt="Listing"
                            className="notificationImage"
                          />
                        )}
                      {notif.type === "FOLLOW" && (
                        <div className="profileCircle"></div>
                      )}
                      <p>{notif.content}</p>
                    </div>
                    <span className="notificationTime">{notif.timeAgo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {otherNotifications.length > 0 && (
            <div className="otherNotifications">
              <h3>More</h3>
              <ul>
                {otherNotifications.map((notif, index) => (
                  <li
                    key={index}
                    className={`notificationItem ${
                      notif.isRead ? "read" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notificationContent">
                      {!notif.isRead && (
                        <span className="unreadIndicator"></span>
                      )}
                      {(notif.type === "LIKE" ||
                        notif.type === "LIKE_PURCHASE" ||
                        notif.type === "PURCHASE") &&
                        notif.listingImage && (
                          <img
                            src={notif.listingImage}
                            alt="Listing"
                            className="notificationImage"
                          />
                        )}
                      {notif.type === "FOLLOW" && (
                        <div className="profileCircle"></div>
                      )}
                      <p>{notif.content}</p>
                    </div>
                    <span className="notificationTime">{notif.timeAgo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
