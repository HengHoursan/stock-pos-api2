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
