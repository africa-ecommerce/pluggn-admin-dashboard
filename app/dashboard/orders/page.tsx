// "use client"

// import { useState } from "react"
// import useSWR from "swr"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Skeleton } from "@/components/ui/skeleton"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Search, MoreHorizontal, ShoppingCart, Package, TrendingUp, DollarSign, Eye, RefreshCw } from "lucide-react"

// interface Order {
//   id: string
//   orderNumber: string
//   customer: string
//   supplier: string
//   plug: string
//   items: number
//   total: number
//   status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
//   paymentStatus: "pending" | "paid" | "failed" | "refunded"
//   createdAt: string
//   deliveryDate?: string
// }

// // Mock fetcher function
// const fetcher = async (url: string) => {
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   return [
//     {
//       id: "1",
//       orderNumber: "ORD-001234",
//       customer: "Alice Johnson",
//       supplier: "TechCorp",
//       plug: "John Doe",
//       items: 3,
//       total: 125000,
//       status: "processing",
//       paymentStatus: "paid",
//       createdAt: "2024-01-20T10:30:00Z",
//       deliveryDate: "2024-01-25",
//     },
//     {
//       id: "2",
//       orderNumber: "ORD-001235",
//       customer: "Bob Smith",
//       supplier: "Fashion Hub",
//       plug: "Jane Smith",
//       items: 1,
//       total: 45000,
//       status: "shipped",
//       paymentStatus: "paid",
//       createdAt: "2024-01-19T14:20:00Z",
//       deliveryDate: "2024-01-24",
//     },
//     {
//       id: "3",
//       orderNumber: "ORD-001236",
//       customer: "Carol Davis",
//       supplier: "Beauty Essentials",
//       plug: "Mike Johnson",
//       items: 2,
//       total: 89000,
//       status: "pending",
//       paymentStatus: "pending",
//       createdAt: "2024-01-21T09:15:00Z",
//     },
//   ] as Order[]
// }

// export default function OrdersPage() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const { data: orders, error, isLoading } = useSWR<Order[]>("/api/orders", fetcher)

//   const filteredOrders =
//     orders?.filter(
//       (order) =>
//         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         order.plug.toLowerCase().includes(searchTerm.toLowerCase()),
//     ) || []

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "pending":
//         return "bg-yellow-100 text-yellow-800"
//       case "confirmed":
//         return "bg-blue-100 text-blue-800"
//       case "processing":
//         return "bg-purple-100 text-purple-800"
//       case "shipped":
//         return "bg-indigo-100 text-indigo-800"
//       case "delivered":
//         return "bg-green-100 text-green-800"
//       case "cancelled":
//         return "bg-red-100 text-red-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   const getPaymentStatusColor = (status: string) => {
//     switch (status) {
//       case "paid":
//         return "bg-green-100 text-green-800"
//       case "pending":
//         return "bg-yellow-100 text-yellow-800"
//       case "failed":
//         return "bg-red-100 text-red-800"
//       case "refunded":
//         return "bg-gray-100 text-gray-800"
//       default:
//         return "bg-gray-100 text-gray-800"
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold">Order Management</h1>
//           <p className="text-muted-foreground">Track and manage all orders on the platform</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//             <Input
//               placeholder="Search orders..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10 w-64"
//             />
//           </div>
//           <Button variant="outline">
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Refresh
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             <ShoppingCart className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{orders?.length || 0}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
//             <Package className="h-4 w-4 text-yellow-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{orders?.filter((o) => o.status === "pending").length || 0}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
//             <TrendingUp className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{orders?.filter((o) => o.status === "delivered").length || 0}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-purple-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ₦{orders?.reduce((acc, o) => acc + o.total, 0).toLocaleString() || 0}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Orders Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>All Orders</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="space-y-4">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
//                   <Skeleton className="h-12 w-12 rounded" />
//                   <div className="space-y-2 flex-1">
//                     <Skeleton className="h-4 w-[200px]" />
//                     <Skeleton className="h-4 w-[150px]" />
//                   </div>
//                   <Skeleton className="h-9 w-[120px]" />
//                 </div>
//               ))}
//             </div>
//           ) : error ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">Failed to load orders</p>
//             </div>
//           ) : filteredOrders.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">No orders found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b text-left">
//                     <th className="pb-3 font-medium">ORDER</th>
//                     <th className="pb-3 font-medium">CUSTOMER</th>
//                     <th className="pb-3 font-medium">SUPPLIER</th>
//                     <th className="pb-3 font-medium">PLUG</th>
//                     <th className="pb-3 font-medium">ITEMS</th>
//                     <th className="pb-3 font-medium">TOTAL</th>
//                     <th className="pb-3 font-medium">STATUS</th>
//                     <th className="pb-3 font-medium">PAYMENT</th>
//                     <th className="pb-3 font-medium">ACTIONS</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredOrders.map((order) => (
//                     <tr key={order.id} className="border-b">
//                       <td className="py-4">
//                         <div>
//                           <p className="font-medium">{order.orderNumber}</p>
//                           <p className="text-sm text-muted-foreground">
//                             {new Date(order.createdAt).toLocaleDateString()}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="py-4">{order.customer}</td>
//                       <td className="py-4">{order.supplier}</td>
//                       <td className="py-4">{order.plug}</td>
//                       <td className="py-4">{order.items}</td>
//                       <td className="py-4">₦{order.total.toLocaleString()}</td>
//                       <td className="py-4">
//                         <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
//                       </td>
//                       <td className="py-4">
//                         <Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
//                       </td>
//                       <td className="py-4">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="sm">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem>
//                               <Eye className="h-4 w-4 mr-2" />
//                               View Details
//                             </DropdownMenuItem>
//                             <DropdownMenuItem>
//                               <RefreshCw className="h-4 w-4 mr-2" />
//                               Update Status
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }








"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Truck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  quantity: number;
  productId: string;
  productName: string;
  productSize: string | null;
  productColor: string | null;
  variantId: string | null;
  variantSize: string | null;
  variantColor: string | null;
  plugPrice: number;
  supplierPrice: number;
}

interface Order {
  orderId: string;
  id: string;
  orderTrackingId: string | null;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerState: string;
  buyerLga: string;
  orderItems: OrderItem[];
}

interface ApiResponse {
  message: string;
  data: Order[];
}

type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("PENDING");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchOrders = async (status: OrderStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/order?orderStatus=${status}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data: ApiResponse = await response.json();
      setOrders(data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "SHIPPED" | "DELIVERED"
  ) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId));

console.log("now", JSON.stringify({ orderId }))

    try {
      const endpoint =
        newStatus === "SHIPPED"
          ? "/api/admin/order/shipped"
          : "/api/admin/order/delivered";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update order to ${newStatus}`);
      }

      // Remove the order from current list
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));

      toast({
        title: "Success",
        description: `Order ${orderId} has been moved to ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update order status. Please try again.`,
        variant: "destructive",
      });
      console.error("Error updating order:", error);
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as OrderStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateOrderTotal = (orderItems: OrderItem[]) => {
    return orderItems.reduce(
      (total, item) => total + item.plugPrice * item.quantity,
      0
    );
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Package },
      SHIPPED: { color: "bg-blue-100 text-blue-800", icon: Truck },
      DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">Manage and track all orders</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="PENDING" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="SHIPPED" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Shipped
          </TabsTrigger>
          <TabsTrigger value="DELIVERED" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusBadge(activeTab)}
                Orders ({orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {activeTab.toLowerCase()} orders found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        {activeTab !== "DELIVERED" && (
                          <TableHead>Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderId}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.buyerName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.buyerEmail}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.buyerPhone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.orderItems.map((item, index) => (
                                <div key={item.id} className="text-sm">
                                  {item.productName} x{item.quantity}
                                  {item.productSize && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({item.productSize})
                                    </span>
                                  )}
                                  {item.productColor && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      - {item.productColor}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ₦
                            {calculateOrderTotal(
                              order.orderItems
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{order.buyerAddress}</div>
                              <div className="text-muted-foreground">
                                {order.buyerLga}, {order.buyerState}
                              </div>
                            </div>
                          </TableCell>
                          {activeTab !== "DELIVERED" && (
                            <TableCell>
                              {activeTab === "PENDING" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus(order.orderId, "SHIPPED")
                                  }
                                  disabled={updatingOrders.has(order.orderId)}
                                >
                                  {updatingOrders.has(order.orderId) ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Truck className="w-4 h-4 mr-2" />
                                  )}
                                  Mark as Shipped
                                </Button>
                              )}
                              {activeTab === "SHIPPED" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    updateOrderStatus(
                                      order.orderId,
                                      "DELIVERED"
                                    )
                                  }
                                  disabled={updatingOrders.has(order.orderId)}
                                >
                                  {updatingOrders.has(order.orderId) ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                  )}
                                  Mark as Delivered
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
