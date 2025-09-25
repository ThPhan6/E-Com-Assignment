import {
  getLocalStorageValues,
  formatCardNumber,
  formatExpiry,
} from "../helper";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("Helper Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.length = 0;
  });

  describe("getLocalStorageValues", () => {
    /**
     * BDD Scenario: Local Storage Retrieval
     *   Given data is stored in localStorage
     *   When the application needs to retrieve values
     *   Then the system should return the requested values
     *   And handle missing keys gracefully
     *   And support both specific keys and all keys
     */
    it("should return all localStorage values when no keys provided", () => {
      // Given: localStorage with multiple items
      mockLocalStorage.length = 2;
      mockLocalStorage.key
        .mockReturnValueOnce("token")
        .mockReturnValueOnce("user");
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "abc123";
        if (key === "user") return '{"id": 1}';
        return null;
      });

      // When: getting all localStorage values
      const result = getLocalStorageValues();

      // Then: it should return all key-value pairs
      expect(result).toEqual({
        token: "abc123",
        user: '{"id": 1}',
      });
    });

    it("should return specific keys when keys array is provided", () => {
      // Given: localStorage with multiple items
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === "token") return "abc123";
        if (key === "user") return '{"id": 1}';
        if (key === "settings") return '{"theme": "dark"}';
        return null;
      });

      // When: getting specific keys
      const result = getLocalStorageValues(["token", "settings"]);

      // Then: it should return only requested keys
      expect(result).toEqual({
        token: "abc123",
        settings: '{"theme": "dark"}',
      });
    });

    it("should return null for non-existent keys", () => {
      // Given: localStorage with some items
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: getting non-existent keys
      const result = getLocalStorageValues(["nonExistent", "anotherMissing"]);

      // Then: it should return null for missing keys
      expect(result).toEqual({
        nonExistent: null,
        anotherMissing: null,
      });
    });

    it("should handle empty keys array", () => {
      // Given: localStorage with items
      mockLocalStorage.length = 1;
      mockLocalStorage.key.mockReturnValue("token");
      mockLocalStorage.getItem.mockReturnValue("abc123");

      // When: getting values with empty keys array
      const result = getLocalStorageValues([]);

      // Then: it should return all values (same as no keys provided)
      expect(result).toEqual({ token: "abc123" });
    });
  });

  describe("formatCardNumber", () => {
    /**
     * BDD Scenario: Card Number Formatting
     *   Given a user enters a card number
     *   When they input the number
     *   Then the system should format it with dashes every 4 digits
     *   And remove non-digit characters
     *   And limit the length appropriately
     */
    it("should format card number with dashes every 4 digits", () => {
      // Given: a card number string
      const cardNumber = "1234567890123456";

      // When: formatting the card number
      const result = formatCardNumber(cardNumber);

      // Then: it should add dashes every 4 digits
      expect(result).toBe("1234-5678-9012-3456");
    });

    it("should remove non-digit characters before formatting", () => {
      // Given: a card number with spaces and dashes
      const cardNumber = "1234 5678-9012 3456";

      // When: formatting the card number
      const result = formatCardNumber(cardNumber);

      // Then: it should remove spaces and format correctly
      expect(result).toBe("1234-5678-9012-3456");
    });

    it("should limit result to 19 characters maximum", () => {
      // Given: a very long card number
      const cardNumber = "123456789012345678901234567890";

      // When: formatting the card number
      const result = formatCardNumber(cardNumber);

      // Then: it should be limited to 19 characters
      expect(result).toBe("1234-5678-9012-3456");
      expect(result.length).toBe(19);
    });

    it("should handle empty string", () => {
      // Given: an empty string
      const cardNumber = "";

      // When: formatting the card number
      const result = formatCardNumber(cardNumber);

      // Then: it should return empty string
      expect(result).toBe("");
    });

    it("should handle string with no digits", () => {
      // Given: a string with no digits
      const cardNumber = "abc-def-ghi";

      // When: formatting the card number
      const result = formatCardNumber(cardNumber);

      // Then: it should return empty string
      expect(result).toBe("");
    });

    it("should handle partial card numbers", () => {
      // Given: a partial card number
      const cardNumber = "1234567890";

      // When: formatting the card number
      const result = formatCardNumber(cardNumber);

      // Then: it should format what's available
      expect(result).toBe("1234-5678-90");
    });
  });

  describe("formatExpiry", () => {
    /**
     * BDD Scenario: Expiry Date Formatting
     *   Given a user enters an expiry date
     *   When they input the date
     *   Then the system should format it with a slash after 2 digits
     *   And remove non-digit characters
     *   And limit the length appropriately
     */
    it("should format expiry with slash after 2 digits", () => {
      // Given: an expiry string with 4 digits
      const expiry = "1234";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should add slash after 2 digits
      expect(result).toBe("12/34");
    });

    it("should handle expiry with less than 2 digits", () => {
      // Given: an expiry string with 1 digit
      const expiry = "1";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should return as is
      expect(result).toBe("1");
    });

    it("should handle expiry with exactly 2 digits", () => {
      // Given: an expiry string with 2 digits
      const expiry = "12";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should add slash and show as 12/
      expect(result).toBe("12/");
    });

    it("should remove non-digit characters before formatting", () => {
      // Given: an expiry string with non-digits
      const expiry = "12/34";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should remove non-digits and format
      expect(result).toBe("12/34");
    });

    it("should limit to 4 digits maximum", () => {
      // Given: an expiry string with more than 4 digits
      const expiry = "123456";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should limit to 4 digits
      expect(result).toBe("12/34");
    });

    it("should handle empty string", () => {
      // Given: an empty string
      const expiry = "";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should return empty string
      expect(result).toBe("");
    });

    it("should handle string with no digits", () => {
      // Given: a string with no digits
      const expiry = "abc/def";

      // When: formatting the expiry
      const result = formatExpiry(expiry);

      // Then: it should return empty string
      expect(result).toBe("");
    });
  });
});
