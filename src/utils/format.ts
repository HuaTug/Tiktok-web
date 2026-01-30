/**
 * Safely formats numbers (e.g. 1200 -> 1.2k)
 */
export const formatNumber = (num: number | string | undefined): string => {
  if (!num) return '0';
  const n = Number(num);
  if (isNaN(n)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(n);
};

/**
 * Safely returns a string, with a fallback
 */
export const safeString = (str: any, fallback: string = ''): string => {
  if (str === null || str === undefined || str === 'undefined') return fallback;
  return String(str);
};

export const formatUser = (user: any) => {
  return {
    name: user?.nickname || user?.username || "Cheese User",
    bio: user?.signature || "No bio yet.",
    followers: formatNumber(user?.followerCount || 0)
  }
}
