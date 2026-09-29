"use client";
import { T } from "@/i18n/LanguageProvider";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
export default function ForgotPasswordPage() {
  return <AuthShell title="Need help signing in?" subtitle="Ask your programme administrator to reset your password. You do not need a verification code.">
    <Link className="sr-auth-link" href="/login"><T text={"Back to sign in"} /></Link>
  </AuthShell>;
}
