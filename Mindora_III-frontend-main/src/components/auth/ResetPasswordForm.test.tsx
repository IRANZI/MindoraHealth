import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { resetPassword } from "@/lib/auth-api";

jest.mock("@/lib/auth-api", () => ({
  resetPassword: jest.fn(),
}));

const mockedResetPassword = resetPassword as jest.Mock;

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits the token and matching new password, then links to sign-in", async () => {
    mockedResetPassword.mockResolvedValueOnce({ message: "Password updated successfully" });
    const user = userEvent.setup();
    render(<ResetPasswordForm token="one-time-token" />);

    await user.type(screen.getByLabelText("New password"), "another-valid-password");
    await user.type(screen.getByLabelText("Confirm new password"), "another-valid-password");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(mockedResetPassword).toHaveBeenCalledWith("one-time-token", "another-valid-password");
    expect(await screen.findByRole("heading", { name: "You're all set." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute("href", "/login");
  });

  it("does not submit when the confirmation differs", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm token="one-time-token" />);

    await user.type(screen.getByLabelText("New password"), "another-valid-password");
    await user.type(screen.getByLabelText("Confirm new password"), "different-password");
    await user.click(screen.getByRole("button", { name: "Save new password" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(mockedResetPassword).not.toHaveBeenCalled();
  });
});
