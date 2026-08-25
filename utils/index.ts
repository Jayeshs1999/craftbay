/** Format a date string to a human-readable format */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Truncate a string to maxLength */
export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

/** Format a price in INR */
export function formatPrice(amount: number): string {
  return "Rs." + amount.toLocaleString("en-IN");
}