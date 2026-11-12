import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { MindoraLogo } from "@/components/brand/MindoraLogo";
import { BackLink } from "@/components/public/BackLink";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col p-8 lg:p-14">
      <BackLink fallback="/login" className="mb-6" />
      <MindoraLogo />
      <ForgotPasswordForm />
    </div>
  );
}
