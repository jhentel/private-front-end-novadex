export function formatEpochToUTCDate(epoch: number): string {
  const date = new Date(epoch * 1000);

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

  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");

  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
}

export const formatTimeAgo = (timestamp: number) => {
  if (timestamp === 0) return "0s";

  // Normalize timestamp to milliseconds
  const normalizedTimestamp =
    timestamp > 10000000000
      ? timestamp // Already in milliseconds (13 digits)
      : timestamp * 1000; // Convert from seconds to milliseconds (10 digits)

  const now = new Date();
  const past = new Date(normalizedTimestamp);

  // Check if date is in the future (invalid date)
  if (past > now) {
    // Handle invalid/future dates by returning a default value
    return "Invalid date";
  }

  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ${hours % 24}h`;

  // DIFF CALENDAR MONTHS AND YEARS
  let years = now.getFullYear() - past.getFullYear();
  let months = now.getMonth() - past.getMonth();
  let daysDiff = now.getDate() - past.getDate();

  if (daysDiff < 0) {
    months -= 1;
    // GET LAST DAY OF PREVIOUS MONTH
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    daysDiff += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) return `${years}y ${months}mo`;
  return `${months}mo ${daysDiff}d`;
};
