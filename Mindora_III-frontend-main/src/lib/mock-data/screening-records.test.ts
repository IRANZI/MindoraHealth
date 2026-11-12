import {
  getPatientScreeningRecords,
  patientScreeningRecordsStorageKey,
  savePatientScreeningRecord,
} from "@/lib/mock-data/screening-records";
import { getTestById, scoreTest } from "@/lib/mock-data/tests";

describe("patient screening mock records", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves a scored screening under the signed-in patient's record", () => {
    const patientId = "patient-123";
    const test = getTestById("gad7");
    if (!test) throw new Error("Expected GAD-7 test fixture.");
    const answers = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [index, 2]));

    savePatientScreeningRecord(patientId, test, scoreTest(test, answers));

    expect(getPatientScreeningRecords(patientId)).toMatchObject([
      {
        testId: "gad7",
        testName: "Anxiety",
        category: "Anxiety",
        rawScore: 14,
        displayScore: "14",
        maxScore: "21",
        severity: "Moderate",
      },
    ]);
    expect(window.localStorage.getItem(patientScreeningRecordsStorageKey(patientId))).toContain(
      '"rawScore":14'
    );
    expect(getPatientScreeningRecords("another-patient")).toEqual([]);
  });

  it("keeps only the latest result per screening when the patient retakes it", () => {
    const test = getTestById("gad7");
    if (!test) throw new Error("Expected GAD-7 test fixture.");

    savePatientScreeningRecord("patient-123", test, scoreTest(test, { 0: 1 }));
    savePatientScreeningRecord("patient-123", test, scoreTest(test, { 0: 3 }));

    expect(getPatientScreeningRecords("patient-123")).toHaveLength(1);
    expect(getPatientScreeningRecords("patient-123")[0].rawScore).toBe(3);
  });
});
