"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { MindoraLogo } from "@/components/brand/MindoraLogo";
import { BackLink } from "@/components/public/BackLink";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const token = useSearchParams().get("token");

  return (
    <div className="flex min-h-screen flex-col p-8 lg:p-14">
      <BackLink fallback="/login" className="mb-6" />
      <MindoraLogo />
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">This reset link is incomplete.</h1>
          <p className="mt-2 text-muted-foreground">Request a new link to reset your password.</p>
          <Button asChild className="mt-8 w-full" size="lg">
            <Link href="/forgot-password">Request a reset link</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
