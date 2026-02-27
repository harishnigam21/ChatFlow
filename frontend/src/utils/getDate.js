import { formatDistanceToNow } from "date-fns";

export const getDaysBetween = (dateString) => {
  if (!dateString) return "";

  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};
export const separateTime = (dateString) => {
  const dateObj = new Date(dateString);
  // Get Time in AM/PM format
  const timeOnly = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return timeOnly;
};
export const formatDateCustom = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const options = { day: "numeric", month: "short", weekday: "short" };
  const parts = new Intl.DateTimeFormat("en-GB", options).formatToParts(d);
  const pf = (type) => parts.find((p) => p.type === type).value;
  return `${pf("day")} ${pf("month")}, ${pf("weekday")}`;
};

export const matchTime = (dateString) => {
  const scheduledDate = new Date(dateString);
  const now = new Date();
  return now.getTime() > scheduledDate.getTime();
};
export const formatChatMessageDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
  if (diffInDays < 7) {
    return date.toLocaleTimeString('en-US', { weekday: 'long' }).split(' ')[0];
    // Returns: "Monday", "Tuesday", etc.
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};