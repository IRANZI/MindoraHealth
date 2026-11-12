import { apiFetch } from "@/lib/api";
import {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from "@/lib/auth-api";

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
}));

const mockedApiFetch = apiFetch as jest.Mock;

describe("auth-api password reset helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requestPasswordReset", () => {
    it("calls POST /api/v1/auth/forgot-password with the given email", async () => {
      mockedApiFetch.mockResolvedValueOnce({
        message: "If that email exists, a reset link has been sent.",
      });

      const response = await requestPasswordReset("user@example.com");

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        }
      );
      expect(response).toEqual({
        message: "If that email exists, a reset link has been sent.",
      });
    });
  });

  describe("verifyResetToken", () => {
    it("calls GET /api/v1/auth/reset-password/verify with URI-encoded token", async () => {
      mockedApiFetch.mockResolvedValueOnce({ valid: true });

      const response = await verifyResetToken("test-token-123+abc==");

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password/verify?token=test-token-123%2Babc%3D%3D"
      );
      expect(response).toEqual({ valid: true });
    });
  });

  describe("resetPassword", () => {
    it("calls POST /api/v1/auth/reset-password with token and new password", async () => {
      mockedApiFetch.mockResolvedValueOnce({
        message: "Password updated successfully",
      });

      const response = await resetPassword("secure-token", "NewSecretPassword123!");

      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({
            token: "secure-token",
            newPassword: "NewSecretPassword123!",
          }),
        }
      );
      expect(response).toEqual({
        message: "Password updated successfully",
      });
    });
  });
});
