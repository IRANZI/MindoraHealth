"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getTestById, scoreTest, testResultStorageKey } from "@/lib/mock-data/tests";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/public/BackLink";

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

function subscribe() {
  return () => undefined;
}

export function TestResultView({
  id,
  basePath = "/tests",
}: {
  id: string;
  basePath?: "/tests" | "/screenings";
}) {
  const test = getTestById(id);
  const { user } = useAuth();
  const storageKey = testResultStorageKey(
    id,
    basePath === "/screenings" ? user?.userId : undefined
  );
  const raw = useSyncExternalStore(
    subscribe,
    () =>
      test
        ? (basePath === "/screenings" && user?.userId
            ? window.localStorage
            : window.sessionStorage
          ).getItem(storageKey)
        : null,
    () => null
  );

  if (!test) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="font-semibold">This test could not be found.</p>
        <Button asChild className="mt-4" size="sm">
          <Link href={basePath}>Back to tests</Link>
        </Button>
      </div>
    );
  }

  if (!raw) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="font-semibold">No answers found for this test.</p>
        <p className="mt-2 text-sm text-[#6B7280]">
          Please take the test first to see your result.
        </p>
        <Button asChild className="mt-4">
          <Link href={`${basePath}/${id}`}>Take test</Link>
        </Button>
      </div>
    );
  }

  const answers = JSON.parse(raw) as Record<number, number>;
  const result = scoreTest(test, answers);
  const scoreLabel =
    test.scoreKind === "asrs"
      ? `${result.displayScore} / 6 primary indicators`
      : `Score: ${result.displayScore} / ${result.maxScore}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <BackLink fallback={basePath} className="mb-2" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{test.name}</h1>
      <p className="mt-6 text-4xl font-bold text-[#1A1A1A]">{scoreLabel}</p>
      <Badge className={`mt-4 ${severityColor[result.severity] ?? "bg-mindora-purple text-white"}`}>
        {result.severity}
      </Badge>
      <h2 className="mt-4 text-2xl font-bold">{result.label}</h2>
      {result.extras?.map((item) => (
        <p key={item.label} className="mt-2 text-sm text-[#6B7280]">
          {item.label}: {item.value}
        </p>
      ))}
      <p className="mt-4 leading-relaxed text-[#6B7280]">{result.interpretation}</p>

      {result.severity === "Extremely Severe" && (
        <section
          role="alert"
          className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 text-red-950"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
            <div>
              <h2 className="font-bold">You don&apos;t have to face this alone.</h2>
              <p className="mt-1 text-sm leading-relaxed">
                Your answers suggest very high distress. If you feel in immediate danger, contact
                emergency services or call Mindora&apos;s 24/7 crisis line now.
              </p>
              <Button asChild className="mt-4 bg-red-700 hover:bg-red-800">
                <a href="tel:0783974066">Call 0 783 974 066</a>
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="mt-8 rounded-xl border border-amber-200 bg-[#FFFBEB] p-4 text-sm leading-relaxed text-amber-900">
        This is a self-report screening tool and not a diagnostic instrument. It should not replace
        a clinical interview or professional assessment. If you are concerned about your results, we
        recommend speaking with a qualified mental health professional.
      </div>

      <div className="mt-8 rounded-xl bg-mindora-purple p-6 text-white">
        <p className="text-lg font-semibold">
          Connect with a therapist who specialises in this area
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-4 border-white bg-white text-mindora-purple hover:bg-white/90"
        >
          <Link href={`/therapists?specialisation=${encodeURIComponent(test.category)}`}>
            Find a Therapist
          </Link>
        </Button>
      </div>
    </div>
  );
}
