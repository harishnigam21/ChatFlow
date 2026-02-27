import { useEffect, useState } from "react";
import { formatDistanceToNow } from 'date-fns';
export const useTimeAgo = (dateString) => {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    // If no date, don't start the timer
    if (!dateString) {
      setTimeAgo("");
      return;
    }

    const updateTime = () => {
      setTimeAgo(formatDistanceToNow(new Date(dateString), { addSuffix: true }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [dateString]); // Hook stays active, but logic waits for dateString

  return timeAgo;
};