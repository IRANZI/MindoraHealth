"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiError } from "@/lib/api";
import { resetPassword } from "@/lib/auth-api";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = async ({ password: newPassword }: ResetPasswordFormValues) => {
    setApiError(null);
    try {
      await resetPassword(token, newPassword);
      setSubmitted(true);
    } catch (error) {
      setApiError(
        error instanceof ApiError
          ? error.message
          : "Could not reset your password. Request a new reset link and try again."
      );
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <span className="mb-4 inline-flex w-fit items-center rounded-full bg-mindora-purple-pale px-3 py-1 text-xs font-medium text-mindora-purple">
          Password updated
        </span>
        <h1 className="text-3xl font-bold tracking-tight">You&apos;re all set.</h1>
        <p className="mt-2 text-muted-foreground">
          Your password has been changed. Sign in with your new password to continue.
        </p>
        <Button asChild className="mt-8 w-full" size="lg">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
      <span className="mb-4 inline-flex w-fit items-center rounded-full bg-mindora-purple-pale px-3 py-1 text-xs font-medium text-mindora-purple">
        Create a new password
      </span>
      <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-2 text-muted-foreground">
        Choose a new password. This single-use reset link expires after 15 minutes.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            showStrength
            value={password}
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm new password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {apiError && (
          <p role="alert" className="text-sm text-red-600">
            {apiError}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Updating password..." : "Save new password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need another link?{" "}
        <Link href="/forgot-password" className="font-semibold text-mindora-purple hover:underline">
          Request a new reset
        </Link>
      </p>
    </div>
  );
}
