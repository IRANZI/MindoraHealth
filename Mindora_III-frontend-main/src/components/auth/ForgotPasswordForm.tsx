"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api";
import { requestPasswordReset } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    setApiError(null);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : "Could not request a reset link. Please try again."
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
      <span className="mb-4 inline-flex w-fit items-center rounded-full bg-mindora-purple-pale px-3 py-1 text-xs font-medium text-mindora-purple">
        Account recovery
      </span>
      <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your account email and we&apos;ll send instructions if an account matches it.
      </p>

      {submitted ? (
        <div
          role="status"
          className="mt-8 rounded-xl border border-mindora-purple/20 bg-mindora-purple-pale p-4 text-sm leading-relaxed text-mindora-purple-dark"
        >
          If that email exists, a reset link has been sent. Check your inbox and spam folder.
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="theodora@mindora.app"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {apiError && (
            <p role="alert" className="text-sm text-red-600">
              {apiError}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-mindora-purple hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
