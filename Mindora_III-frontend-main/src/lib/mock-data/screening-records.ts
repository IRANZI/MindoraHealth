import type { TestDefinition, TestResult } from "@/lib/mock-data/tests";

export interface PatientScreeningRecord {
  testId: string;
  testName: string;
  category: TestDefinition["category"];
  rawScore: number;
  displayScore: string;
  maxScore: string;
  severity: TestResult["severity"];
  label: string;
  completedAt: string;
}

const STORAGE_PREFIX = "mindora-patient-screening-records-";
const UPDATED_EVENT = "mindora:patient-screening-records-updated";

export function patientScreeningRecordsStorageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getPatientScreeningRecordsSnapshot(userId: string) {
  return window.localStorage.getItem(patientScreeningRecordsStorageKey(userId)) ?? "[]";
}

export function getPatientScreeningRecords(userId: string): PatientScreeningRecord[] {
  const parsed: unknown = JSON.parse(getPatientScreeningRecordsSnapshot(userId));
  if (!Array.isArray(parsed)) {
    throw new Error(`Saved screening records for ${userId} are not a list.`);
  }
  return parsed as PatientScreeningRecord[];
}

export function savePatientScreeningRecord(
  userId: string,
  test: TestDefinition,
  result: TestResult
) {
  const records = getPatientScreeningRecords(userId);
  const record: PatientScreeningRecord = {
    testId: test.id,
    testName: test.name,
    category: test.category,
    rawScore: result.rawScore,
    displayScore: result.displayScore,
    maxScore: result.maxScore,
    severity: result.severity,
    label: result.label,
    completedAt: new Date().toISOString(),
  };
  const updatedRecords = [
    record,
    ...records.filter((savedRecord) => savedRecord.testId !== test.id),
  ];
  const key = patientScreeningRecordsStorageKey(userId);
  window.localStorage.setItem(key, JSON.stringify(updatedRecords));
  window.dispatchEvent(new CustomEvent(UPDATED_EVENT, { detail: { key } }));
}

export function subscribeToPatientScreeningRecords(userId: string, onChange: () => void) {
  const key = patientScreeningRecordsStorageKey(userId);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) onChange();
  };
  const onUpdate = (event: Event) => {
    if ((event as CustomEvent<{ key: string }>).detail.key === key) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(UPDATED_EVENT, onUpdate);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UPDATED_EVENT, onUpdate);
  };
}
