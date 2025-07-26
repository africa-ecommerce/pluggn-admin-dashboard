"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Zap,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with your app.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">Export Report</Button>
          <Button>View Analytics</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Suppliers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plugs</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,678</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦45.2M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/suppliers">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Suppliers
              </Button>
            </Link>
            <Link href="/dashboard/plugs">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Zap className="mr-2 h-4 w-4" />
                Manage Plugs
              </Button>
            </Link>
            <Link href="/dashboard/orders">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Orders
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New supplier registered
                  </p>
                  <p className="text-sm text-gray-500">
                    TechCorp joined the platform
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  2m ago
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Large order placed
                  </p>
                  <p className="text-sm text-gray-500">
                    Order #12345 worth ₦250,000
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  5m ago
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Low stock alert
                  </p>
                  <p className="text-sm text-gray-500">
                    5 products running low on inventory
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  10m ago
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New plug verified
                  </p>
                  <p className="text-sm text-gray-500">
                    John Doe completed verification
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  15m ago
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge className="bg-green-100 text-green-800">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Gateway</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  Degraded
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Supplier Approvals</span>
                <Badge variant="secondary">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Plug Verifications</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dispute Reports</span>
                <Badge className="bg-red-100 text-red-800">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Response Time</span>
                <span className="text-sm font-medium">245ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-sm font-medium">2,341</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
