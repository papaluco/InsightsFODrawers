/**
 * Formats report run dates into human-readable strings based on proximity to "now".
 * Logic: Today (Full), Yesterday (Period), Last Week (Day), etc.
 */
export const formatLastRun = (dateInput: string | Date | null): string => {
  if (!dateInput) return 'Never';
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  
  // 1. Determine Time of Day Period
  const hour = date.getHours();
  let period = "Night";
  if (hour >= 5 && hour < 12) period = "Morning";
  else if (hour >= 12 && hour < 17) period = "Afternoon";
  else if (hour >= 17 && hour < 21) period = "Evening";

  const isToday = date.toDateString() === now.toDateString();
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 2. Formatting Branches
  if (isToday) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  }

  if (isYesterday) {
    return `Yesterday ${period}`;
  }

  if (diffDays < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `Last ${dayName} ${period}`;
  }

  const isOldYear = date.getFullYear() < now.getFullYear();
  if (isOldYear) {
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${period}`;
  }

  return `${date.toLocaleDateString('en-US', { month: 'short' })} - ${date.getDate()} ${period}`;
};