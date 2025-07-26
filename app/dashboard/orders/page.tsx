"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, ShoppingCart, Package, TrendingUp, DollarSign, Eye, RefreshCw } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  customer: string
  supplier: string
  plug: string
  items: number
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  createdAt: string
  deliveryDate?: string
}

// Mock fetcher function
const fetcher = async (url: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return [
    {
      id: "1",
      orderNumber: "ORD-001234",
      customer: "Alice Johnson",
      supplier: "TechCorp",
      plug: "John Doe",
      items: 3,
      total: 125000,
      status: "processing",
      paymentStatus: "paid",
      createdAt: "2024-01-20T10:30:00Z",
      deliveryDate: "2024-01-25",
    },
    {
      id: "2",
      orderNumber: "ORD-001235",
      customer: "Bob Smith",
      supplier: "Fashion Hub",
      plug: "Jane Smith",
      items: 1,
      total: 45000,
      status: "shipped",
      paymentStatus: "paid",
      createdAt: "2024-01-19T14:20:00Z",
      deliveryDate: "2024-01-24",
    },
    {
      id: "3",
      orderNumber: "ORD-001236",
      customer: "Carol Davis",
      supplier: "Beauty Essentials",
      plug: "Mike Johnson",
      items: 2,
      total: 89000,
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2024-01-21T09:15:00Z",
    },
  ] as Order[]
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { data: orders, error, isLoading } = useSWR<Order[]>("/api/orders", fetcher)

  const filteredOrders =
    orders?.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.plug.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Track and manage all orders on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.filter((o) => o.status === "pending").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.filter((o) => o.status === "delivered").length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{orders?.reduce((acc, o) => acc + o.total, 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded" />
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
              <p className="text-muted-foreground">Failed to load orders</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">ORDER</th>
                    <th className="pb-3 font-medium">CUSTOMER</th>
                    <th className="pb-3 font-medium">SUPPLIER</th>
                    <th className="pb-3 font-medium">PLUG</th>
                    <th className="pb-3 font-medium">ITEMS</th>
                    <th className="pb-3 font-medium">TOTAL</th>
                    <th className="pb-3 font-medium">STATUS</th>
                    <th className="pb-3 font-medium">PAYMENT</th>
                    <th className="pb-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">{order.customer}</td>
                      <td className="py-4">{order.supplier}</td>
                      <td className="py-4">{order.plug}</td>
                      <td className="py-4">{order.items}</td>
                      <td className="py-4">₦{order.total.toLocaleString()}</td>
                      <td className="py-4">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="py-4">
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
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
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Update Status
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
  )
}
