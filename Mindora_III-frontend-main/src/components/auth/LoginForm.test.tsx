import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockPush = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({ login: mockLogin, logout: mockLogout });
  });

  async function submitCredentials(email: string, password: string) {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
  }

  it("authenticates with the backend and routes a client to the client dashboard", async () => {
    mockLogin.mockResolvedValueOnce({ role: "PATIENT" });

    await submitCredentials("client@example.test", "client-password");

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/today"));
    expect(mockLogin).toHaveBeenCalledWith("client@example.test", "client-password");
  });

  it("routes a therapist to the therapist dashboard based on the backend role", async () => {
    mockLogin.mockResolvedValueOnce({ role: "THERAPIST" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Therapist" }));
    await user.type(screen.getByLabelText("Email"), "therapist@example.test");
    await user.type(screen.getByLabelText("Password"), "therapist-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/therapist"));
  });

  it("routes an admin to the real admin dashboard based on the backend role", async () => {
    mockLogin.mockResolvedValueOnce({ role: "ADMIN" });

    await submitCredentials("admin@example.test", "admin-password");

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
  });

  it("keeps Client and Therapist choices without displaying mock credentials or an Admin option", () => {
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: "Client" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Therapist" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.queryByRole("button", { name: "Admin" })).not.toBeInTheDocument();
    expect(screen.queryByText(/client\.demo@example\.test/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/therapist\.demo@example\.test/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sample (client|therapist) credentials/i)).not.toBeInTheDocument();
  });

  it("rejects a client account when Therapist sign-in is selected", async () => {
    mockLogin.mockResolvedValueOnce({ role: "PATIENT" });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Therapist" }));
    await user.type(screen.getByLabelText("Email"), "client@example.test");
    await user.type(screen.getByLabelText("Password"), "client-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This account is not registered as a Therapist."
    );
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("routes an authenticated admin to the real dashboard even if Client is selected", async () => {
    mockLogin.mockResolvedValueOnce({ role: "ADMIN" });

    await submitCredentials("admin@example.test", "admin-password");

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("shows a real authentication error when sign-in fails", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    await submitCredentials("person@example.test", "wrong-password");

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
