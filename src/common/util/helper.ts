/**
 * Generates a code with a prefix and a random number/string
 * Example: generateCode('BRND') -> BRND-123456
 */
export const generateCode = (prefix: string): string => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
  return `${prefix}-${random}`;
};

/**
 * Simple slugify function
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

/**
 * Converts a string to a Date object (DateConvertor)
 */
export const DateConvertor = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Converts a time string (HH:mm or HH:mm:ss) to a Date object (TimeConvertor)
 */
export const TimeConvertor = (timeString: string): Date | null => {
  if (!timeString) return null;
  
  // Handle both : and :: if user meant that, but usually HH:mm
  const parts = timeString.split(/:+/).map(Number);
  const [hours, minutes, seconds] = parts;
  
  const date = new Date();
  if (isNaN(hours)) return null;
  
  date.setHours(hours);
  date.setMinutes(minutes || 0);
  date.setSeconds(seconds || 0);
  date.setMilliseconds(0);
  
  return isNaN(date.getTime()) ? null : date;
};
