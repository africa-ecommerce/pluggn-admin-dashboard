"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(true); // Changed to true by default
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Auto-show success message when redirected from homepage
  useEffect(() => {
    setSuccess("Verification code sent to admin email!");
    setCountdown(60); // Start countdown immediately
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    setIsSendingOtp(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Verification code sent to admin email!");
        setOtpSent(true);
        setCountdown(60); // 60 seconds cooldown
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Login successful! Redirecting...");
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push("/dashboard/suppliers");
        }, 1000);
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-[#fef1e6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OTP Sending Status */}
            {isSendingOtp && (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertDescription className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending verification code...
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn't receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={sendOtp}
                disabled={countdown > 0 || isSendingOtp}
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : isSendingOtp
                  ? "Sending..."
                  : "Resend Code"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-700 text-center">
              🔒 This is a secure admin area. The verification code expires in
              10 minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
