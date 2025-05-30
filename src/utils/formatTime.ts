import { formatDistanceToNow } from "date-fns";

// Format timestamps to human readable format
export const formatTime = (timestamp: number) => {
  if (!timestamp) return "N/A";
  const formatted = formatDistanceToNow(new Date(timestamp * 1000), {
    addSuffix: true,
  });
  return formatted === "less than a minute ago" ? "just now" : formatted;
};

export const getTimeInfo = (timestamp: number | string) => {
  // Handle string dates (like "Sat Mar 29 19:27:06 +0000 2025")
  const parsedTimestamp =
    typeof timestamp === "string" && isNaN(Number(timestamp))
      ? new Date(timestamp).getTime()
      : Number(timestamp);

  const pastDate = new Date(parsedTimestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  // Determine formatted time
  let formattedTime;
  if (diffInSeconds < 60) {
    formattedTime = "Just Now";
  } else if (diffInSeconds < 3600) {
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    formattedTime = `${diffInMinutes}m`;
  } else if (diffInSeconds < 86400) {
    const diffInHours = Math.floor(diffInSeconds / 3600);
    formattedTime = `${diffInHours}h`;
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[pastDate.getMonth()];
    const day = pastDate.getDate();
    formattedTime = `${month} ${day}`;
  }

  // Determine next update interval based on content age
  let nextUpdateInterval;
  if (diffInSeconds < 3600) {
    nextUpdateInterval = 60000;
  } else if (diffInSeconds < 86400) {
    nextUpdateInterval = 300000;
  } else {
    nextUpdateInterval = null;
  }

  return { formattedTime, nextUpdateInterval };
};

/**
 * Formats a date as a relative time string (e.g., "28y" for 28 years ago)
 * @param dateInput - ISO date string, timestamp number, or Date object
 * @returns Formatted relative time string
 */
export function formatRelativeTime(dateInput: string | number | Date): string {
  // Handle different input types
  const date =
    dateInput instanceof Date
      ? dateInput
      : typeof dateInput === "number"
        ? new Date(dateInput)
        : new Date(dateInput);

  const now = new Date();

  // Make sure the date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  // Calculate time difference in milliseconds
  const diffMs = now.getTime() - date.getTime();

  // Convert to different time units
  const diffSec = diffMs / 1000;
  const diffMin = diffSec / 60;
  const diffHour = diffMin / 60;
  const diffDay = diffHour / 24;
  const diffWeek = diffDay / 7;
  const diffMonth = diffDay / 30.44; // Average days in a month
  const diffYear = diffDay / 365.25; // Account for leap years

  // Return the appropriate format based on the difference
  if (diffYear >= 1) {
    return `${Math.floor(diffYear)}y`;
  } else if (diffMonth >= 1) {
    return `${Math.floor(diffMonth)}mo`;
  } else if (diffWeek >= 1) {
    return `${Math.floor(diffWeek)}w`;
  } else if (diffDay >= 1) {
    return `${Math.floor(diffDay)}d`;
  } else if (diffHour >= 1) {
    return `${Math.floor(diffHour)}h`;
  } else if (diffMin >= 1) {
    return `${Math.floor(diffMin)}m`;
  } else {
    return "now";
  }
}