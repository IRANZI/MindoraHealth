import { render, screen } from "@testing-library/react";
import { TestResultView } from "@/components/tests/TestResult";
import { testResultStorageKey } from "@/lib/mock-data/tests";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "patient-id" } }),
}));

describe("TestResultView", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("shows crisis support for an extremely severe screening result", () => {
    const answers = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [index, 3]));
    window.sessionStorage.setItem(
      testResultStorageKey("dass21-depression", "patient-id"),
      JSON.stringify(answers)
    );

    render(<TestResultView id="dass21-depression" basePath="/screenings" />);

    expect(screen.getByRole("alert")).toHaveTextContent("You don't have to face this alone.");
    expect(screen.getByRole("link", { name: "Call 0 783 974 066" })).toHaveAttribute(
      "href",
      "tel:0783974066"
    );
  });
});
