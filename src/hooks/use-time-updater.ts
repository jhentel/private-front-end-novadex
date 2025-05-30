import { useEffect, useState } from "react";
import { getTimeInfo } from "@/utils/formatTime";

const useTimeUpdater = (timestamp: string | number | undefined) => {
  const [timeDisplay, setTimeDisplay] = useState(() => {
    if (!timestamp) return "";
    return getTimeInfo(timestamp).formattedTime;
  });

  useEffect(() => {
    if (!timestamp) return;

    const updateTime = () => {
      const { formattedTime, nextUpdateInterval } = getTimeInfo(timestamp);
      setTimeDisplay(formattedTime);

      if (nextUpdateInterval) {
        timeoutId = setTimeout(updateTime, nextUpdateInterval);
      }
    };

    let timeoutId = setTimeout(updateTime, 1000);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timestamp]);

  return timeDisplay;
};

export default useTimeUpdater;