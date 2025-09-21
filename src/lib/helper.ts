/**
 * Get values from localStorage.
 * @param keys - Array of keys to retrieve. If empty, get all values.
 * @returns An object with key-value pairs.
 */
export const getLocalStorageValues = (
  keys: string[] = []
): Record<string, string | null> => {
  const result: Record<string, string | null> = {};

  if (keys.length === 0) {
    // Get all keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) result[key] = localStorage.getItem(key);
    }
  } else {
    keys.forEach((key) => {
      result[key] = localStorage.getItem(key);
    });
  }

  return result;
};

// Helper function to format card number
export const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1-");
  return formatted.slice(0, 19); // Limit to 19 characters (16 digits + 3 dashes)
};

// Helper function to format expiry
export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 2) {
    return digits.slice(0, 2) + "/" + digits.slice(2, 4);
  }
  return digits;
};
