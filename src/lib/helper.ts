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
