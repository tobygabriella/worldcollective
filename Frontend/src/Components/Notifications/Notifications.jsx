import React, { useEffect, useState } from "react";
import { useSocket } from "../Contexts/SocketContext";
import Loading from "../Loading/Loading.jsx";
import useLoading from "../CustomHooks/useLoading.jsx";
import "./Notifications.css";
import AppHeader from "../Headers/AppHeader";
import { useNavigate } from "react-router-dom";
import CreateReviewModal from "../Review/CreateReviewModal.jsx";
import useReview from "../CustomHooks/useReview.jsx";

const API_KEY = import.meta.env.VITE_BACKEND_ADDRESS;

const Notifications = () => {
  const { notifications, markAsRead } = useSocket();
  const { startLoading, isLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const [currentSellerId, setCurrentSellerId] = useState(null);
  const [currentListingId, setCurrentListingId] = useState(null);
  const {
    isReviewModalOpen,
    openReviewModal,
    closeReviewModal,
    handleReviewSubmit,
    successMessage,
    errorMessage,
  } = useReview();

  useEffect(() => {
    startLoading();
    if (notifications.length > 0) {
      stopLoading();
    }
  }, [notifications]);

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
      markAsRead(notif.id);
    } catch (error) {
      console.error("Error interacting with notification:", error);
    }

    const isListingNotif =
      notif.type === "LIKE" ||
      notif.type === "PURCHASE" ||
      notif.type === "LIKE_PURCHASE";

    if (notif.type === "FOLLOW") {
      navigate(`/users/${notif.usernameTarget}`);
    } else if (isListingNotif) {
      navigate(`/listings/${notif.listingId}`);
    } else if (notif.type === "REVIEW_REMINDER") {
      setCurrentListingId(notif.listingId);
      setCurrentSellerId(notif.sellerId);
      openReviewModal();
    }
  };

  const renderNotifications = (notifications) => {
    return (
      <ul>
        {notifications.map((notif, index) => {
          const isListingNotif =
            notif.type === "LIKE" ||
            notif.type === "PURCHASE" ||
            notif.type === "LIKE_PURCHASE";
          return (
            <li
              key={index}
              className={`notificationItem ${notif.isRead ? "read" : "unread"}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notificationContent">
                {!notif.isRead && <span className="unreadIndicator"></span>}
                {isListingNotif && notif.listingImage && (
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
          );
        })}
      </ul>
    );
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
              {renderNotifications(importantNotifications)}
            </div>
          )}

          {otherNotifications.length > 0 && (
            <div className="otherNotifications">
              <h3>More</h3>
              {renderNotifications(otherNotifications)}
            </div>
          )}
        </div>
      )}
      <CreateReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        successMessage={successMessage}
        errorMessage={errorMessage}
        onSubmit={(review) =>
          handleReviewSubmit(currentListingId, currentSellerId, review)
        }
      />
    </div>
  );
};

export default Notifications;
