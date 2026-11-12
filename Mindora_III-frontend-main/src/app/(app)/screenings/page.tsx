import Link from "next/link";
import { Clock, FlaskConical, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TESTS } from "@/lib/mock-data/tests";
import { ScreeningHistory } from "@/components/tests/ScreeningHistory";

export default function ScreeningTestsPage() {
  return (
    <div className="min-h-full bg-[#eae6f4] px-6 py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm text-muted-foreground">
          <Link href="/today" className="hover:text-mindora-purple">
            Today
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Screening tests</span>
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Screening tests</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The same screening questionnaires available on Mindora&apos;s public site, now part of
          your check-in. They can help you reflect, but do not replace a professional diagnosis.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-mindora-purple">
            <FlaskConical className="h-3.5 w-3.5" />
            Validated screeners
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-mindora-purple">
            <ShieldCheck className="h-3.5 w-3.5" />
            Not a diagnosis
          </span>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTS.map((test) => (
            <article
              key={test.id}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-[7px_7px_16px_#cbc4de,-7px_-7px_16px_#fdfbff]"
            >
              <h2 className="text-lg font-bold">{test.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {test.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm font-medium text-mindora-purple">
                <span>{test.frequency}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {test.durationMinutes} min
                </span>
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={`/screenings/${test.id}`}>Start screening</Link>
              </Button>
            </article>
          ))}
        </div>
        <ScreeningHistory />
      </div>
    </div>
  );
}
