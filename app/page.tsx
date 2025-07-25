import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Users, Package, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Supplier Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage your suppliers, track products, and monitor performance all
            in one place. Secure admin access with email verification.
          </p>
          <Link href="/login">
            <Button size="lg" className="px-8 py-3 text-lg">
              <Shield className="mr-2 h-5 w-5" />
              Admin Login
            </Button>
          </Link>
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
                Manage all your suppliers in one place. View contact
                information, track performance, and maintain relationships.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Product Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor inventory levels, track product variations, manage
                pricing, and handle stock across all suppliers.
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
                Get insights into sales performance, supplier metrics, and
                inventory analytics with comprehensive reporting.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Shield className="mr-2 h-5 w-5" />
              Secure Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-blue-700">
              This dashboard uses secure email-based authentication. Upon login,
              a verification code will be sent to the registered admin email
              address.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
