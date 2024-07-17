import React, { useState, useEffect } from "react";
import { calculateTimeRemaining } from "../utils/calculateTimeRemaining";

const Countdown = ({ endTime }) => {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(endTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(endTime);
      setTimeRemaining(remaining);
      if (remaining.total <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="countdown">
      {timeRemaining.total > 0 ? (
        <span>
          {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m{" "}
          {timeRemaining.seconds}s
        </span>
      ) : (
        <span>Auction ended</span>
      )}
    </div>
  );
};

export default Countdown;
