import { isTokenValid } from "../tokenHelper";

describe("Token Helper Functions", () => {
  describe("isTokenValid", () => {
    /**
     * BDD Scenario: Token Validation
     *   Given a JWT token
     *   When the system needs to validate it
     *   Then it should check the token format and expiration
     *   And return true for valid tokens
     *   And return false for invalid or expired tokens
     */
    it("should return false when token is null", () => {
      // Given: a null token
      const token = "";

      // When: checking if token is valid
      const result = isTokenValid(token);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return false when token is empty string", () => {
      // Given: an empty string token
      const token = "";

      // When: checking if token is valid
      const result = isTokenValid(token);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return false when token is undefined", () => {
      // Given: an undefined token
      const token = "";

      // When: checking if token is valid
      const result = isTokenValid(token);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return true for valid non-expired token", () => {
      // Given: a valid JWT token that expires in 1 hour
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: futureTimestamp })
      )}.signature`;

      // When: checking if token is valid
      const result = isTokenValid(validToken);

      // Then: it should return true
      expect(result).toBe(true);
    });

    it("should return false for expired token", () => {
      // Given: an expired JWT token (expired 1 hour ago)
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: pastTimestamp })
      )}.signature`;

      // When: checking if token is valid
      const result = isTokenValid(expiredToken);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return false for token expiring exactly now", () => {
      // Given: a token that expires exactly now
      const nowTimestamp = Math.floor(Date.now() / 1000);
      const expiringToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ exp: nowTimestamp })
      )}.signature`;

      // When: checking if token is valid
      const result = isTokenValid(expiringToken);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return false for malformed JWT token", () => {
      // Given: a malformed JWT token
      const malformedToken = "invalid.jwt.token";

      // When: checking if token is valid
      const result = isTokenValid(malformedToken);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return false for token with invalid JSON payload", () => {
      // Given: a token with invalid JSON in payload
      const invalidJsonToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid-json.signature";

      // When: checking if token is valid
      const result = isTokenValid(invalidJsonToken);

      // Then: it should return false
      expect(result).toBe(false);
    });

    it("should return false for token without exp field", () => {
      // Given: a token without expiration field
      const noExpToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: "user123" })
      )}.signature`;

      // When: checking if token is valid
      const result = isTokenValid(noExpToken);

      // Then: it should return false
      expect(result).toBe(false);
    });
  });
});
