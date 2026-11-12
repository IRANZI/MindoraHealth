import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { requestPasswordReset } from "@/lib/auth-api";

jest.mock("@/lib/auth-api", () => ({
  requestPasswordReset: jest.fn(),
}));

const mockedRequestPasswordReset = requestPasswordReset as jest.Mock;

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests a reset and shows a non-enumerating confirmation", async () => {
    mockedRequestPasswordReset.mockResolvedValueOnce({
      message: "If that email exists, a reset link has been sent.",
    });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(mockedRequestPasswordReset).toHaveBeenCalledWith("person@example.com");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If that email exists, a reset link has been sent."
    );
  });

  it("displays API errors instead of showing success", async () => {
    mockedRequestPasswordReset.mockRejectedValueOnce(new Error("Service unavailable"));
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email"), "person@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset link" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not request a reset link. Please try again."
    );
  });
});
