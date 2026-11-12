import { fireEvent, render, screen } from "@testing-library/react";
import { TestQuiz } from "@/components/tests/TestQuiz";
import {
  getPatientScreeningRecords,
  patientScreeningRecordsStorageKey,
} from "@/lib/mock-data/screening-records";
import { getTestById, testResultStorageKey } from "@/lib/mock-data/tests";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { userId: "patient-123" } }),
}));

describe("TestQuiz", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockPush.mockClear();
  });

  it("saves a screening score to the signed-in patient's mock record", () => {
    const test = getTestById("gad7");
    if (!test) throw new Error("Expected GAD-7 test fixture.");
    render(<TestQuiz test={test} basePath="/screenings" />);

    for (let index = 0; index < test.items.length; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "Nearly every day" }));
      fireEvent.click(
        screen.getByRole("button", { name: index === test.items.length - 1 ? "Submit" : "Next" })
      );
    }

    expect(getPatientScreeningRecords("patient-123")).toMatchObject([
      { testId: "gad7", rawScore: 21, severity: "Severe" },
    ]);
    expect(window.localStorage.getItem(patientScreeningRecordsStorageKey("patient-123"))).toContain(
      '"rawScore":21'
    );
    expect(window.localStorage.getItem(testResultStorageKey("gad7", "patient-123"))).toBeTruthy();
    expect(mockPush).toHaveBeenCalledWith("/screenings/gad7/result");
  });
});
