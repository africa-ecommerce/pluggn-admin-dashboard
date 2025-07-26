"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Users, Package, BarChart3, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HomePage() {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const sendOtp = async () => {
    setIsSendingOtp(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login page after successfully sending OTP
        router.push("/login");
      } else {
        setError(data.error || "Failed to send verification code");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Comprehensive admin panel for managing suppliers, plugs, orders, and
            platform analytics
          </p>
          
          {/* Error Message */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50 max-w-md mx-auto">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg" 
            onClick={sendOtp}
            disabled={isSendingOtp}
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending Code...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                Admin Login
              </>
            )}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Supplier Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage all suppliers on the platform. Approve registrations,
                monitor performance, and handle disputes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor and manage both suppliers and plugs. Handle
                verifications, suspensions, and user support.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get comprehensive insights into platform performance, user
                behavior, revenue analytics, and operational metrics.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Shield className="mr-2 h-5 w-5" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-blue-700">
              This admin dashboard uses secure email-based authentication. Only
              authorized administrators can access the platform management
              tools.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}