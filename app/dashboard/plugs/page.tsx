"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  User,
  Zap,
  TrendingUp,
  DollarSign,
  Eye,
  Ban,
  CheckCircle,
} from "lucide-react";

interface Plug {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalEarnings: number;
  totalOrders: number;
  rating: number;
  status: "active" | "inactive" | "suspended" | "pending";
  joinedDate: string;
  lastActive: string;
  verificationStatus: "verified" | "pending" | "rejected";
}

// Mock fetcher function
const fetcher = async (url: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      location: "Lagos, Nigeria",
      totalEarnings: 125000,
      totalOrders: 45,
      rating: 4.8,
      status: "active",
      joinedDate: "2024-01-15",
      lastActive: "2024-01-20",
      verificationStatus: "verified",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      location: "Abuja, Nigeria",
      totalEarnings: 89000,
      totalOrders: 32,
      rating: 4.6,
      status: "active",
      joinedDate: "2024-02-01",
      lastActive: "2024-01-19",
      verificationStatus: "verified",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1234567892",
      location: "Port Harcourt, Nigeria",
      totalEarnings: 45000,
      totalOrders: 18,
      rating: 4.2,
      status: "pending",
      joinedDate: "2024-01-25",
      lastActive: "2024-01-18",
      verificationStatus: "pending",
    },
  ] as Plug[];
};

export default function PlugsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: plugs,
    error,
    isLoading,
  } = useSWR<Plug[]>("/api/plugs", fetcher);

  const filteredPlugs =
    plugs?.filter(
      (plug) =>
        plug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plug.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plug.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plug Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all plugs on the platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search plugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plugs</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plugs?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plugs</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plugs?.filter((p) => p.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plugs?.reduce((acc, p) => acc + p.totalOrders, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦
              {plugs
                ?.reduce((acc, p) => acc + p.totalEarnings, 0)
                .toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plugs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Plugs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-9 w-[120px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load plugs</p>
            </div>
          ) : filteredPlugs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No plugs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">PLUG</th>
                    <th className="pb-3 font-medium">LOCATION</th>
                    <th className="pb-3 font-medium">ORDERS</th>
                    <th className="pb-3 font-medium">EARNINGS</th>
                    <th className="pb-3 font-medium">RATING</th>
                    <th className="pb-3 font-medium">STATUS</th>
                    <th className="pb-3 font-medium">VERIFICATION</th>
                    <th className="pb-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlugs.map((plug) => (
                    <tr key={plug.id} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{plug.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {plug.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-sm">{plug.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {plug.phone}
                        </p>
                      </td>
                      <td className="py-4">{plug.totalOrders}</td>
                      <td className="py-4">
                        ₦{plug.totalEarnings.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">
                            {plug.rating}
                          </span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={getStatusColor(plug.status)}>
                          {plug.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge
                          className={getVerificationColor(
                            plug.verificationStatus
                          )}
                        >
                          {plug.verificationStatus}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
