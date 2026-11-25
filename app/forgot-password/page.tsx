"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/lib/api/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotFoundMessage(null);
    setIsSubmitting(true);
    try {
      const result = await authService.requestPasswordReset(email.trim());
      setSentTo(result.email);
      toast.success("Password reset link sent to your email.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No account was found with this email address. Please contact the administration for assistance.";
      setNotFoundMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/coat.png" alt="Coat of Arms" width={56} height={56} className="mb-3 object-contain" />
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#001f54]">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Forgot password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your account email and we will send you a reset link.
          </p>
        </div>

        {sentTo ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                A password reset link has been sent to <strong>{sentTo}</strong>.
                Check your inbox and follow the link to create a new password.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {notFoundMessage ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{notFoundMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-[#001f54] hover:bg-[#003580]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
