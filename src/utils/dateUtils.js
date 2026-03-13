/**
 * Calculate the age in days from a date string to today.
 */
export function ageDays(dateStr) {
  const created = new Date(dateStr);
  const now = new Date();
  const diffMs = now - created;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate average age in days for a list of tickets.
 */
export function averageAge(tickets) {
  if (tickets.length === 0) return 0;
  const total = tickets.reduce((sum, t) => sum + ageDays(t.created), 0);
  return Math.round(total / tickets.length);
}

/**
 * Format a date string as "MMM DD, YYYY".
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
