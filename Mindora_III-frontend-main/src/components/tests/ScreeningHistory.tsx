"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import {
  getPatientScreeningRecordsSnapshot,
  subscribeToPatientScreeningRecords,
  type PatientScreeningRecord,
} from "@/lib/mock-data/screening-records";

const severityColor: Record<string, string> = {
  Normal: "bg-[#16A34A] text-white",
  Minimal: "bg-[#16A34A] text-white",
  Mild: "bg-[#D97706] text-white",
  Moderate: "bg-[#EA580C] text-white",
  Severe: "bg-[#DC2626] text-white",
  "Extremely Severe": "bg-[#991B1B] text-white",
  Subclinical: "bg-[#16A34A] text-white",
  Extreme: "bg-[#991B1B] text-white",
  "Not consistent": "bg-[#16A34A] text-white",
  Consistent: "bg-[#EA580C] text-white",
};

export function ScreeningHistory() {
  const { user } = useAuth();
  const userId = user?.userId;
  const snapshot = useSyncExternalStore(
    (onChange) => (userId ? subscribeToPatientScreeningRecords(userId, onChange) : () => undefined),
    () => (userId ? getPatientScreeningRecordsSnapshot(userId) : "[]"),
    () => "[]"
  );
  const records = JSON.parse(snapshot) as PatientScreeningRecord[];

  return (
    <section className="mt-10 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold">Your saved screening results</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Mock records are saved in this browser only and are not synced to Mindora&apos;s backend.
      </p>
      {records.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Your completed screening results will appear here.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-border">
          {records.map((record) => (
            <li
              key={record.testId}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">{record.testName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Score: {record.displayScore} / {record.maxScore} ·{" "}
                  {new Date(record.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={severityColor[record.severity] ?? "bg-mindora-purple text-white"}>
                  {record.severity}
                </Badge>
                <Link
                  href={`/screenings/${record.testId}/result`}
                  className="text-sm font-semibold text-mindora-purple hover:underline"
                >
                  View result
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
