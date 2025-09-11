
// "use client";

// import { useState } from "react";
// import useSWR, { mutate } from "swr";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Loader2, Package, Truck, CheckCircle } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import OrderCollectionModal from "@/components/order-collection-modal";

// interface OrderItem {
//   id: string;
//   quantity: number;
//   productId: string;
//   productName: string;
//   productSize: string | null;
//   productColor: string | null;
//   variantId: string | null;
//   variantSize: string | null;
//   variantColor: string | null;
//   plugPrice: number;
//   supplierPrice: number;
// }

// interface Order {
//   orderId: string;
//   id: string;
//   orderTrackingId: string | null;
//   createdAt: string;
//   buyerName: string;
//   buyerEmail: string;
//   buyerPhone: string;
//   buyerAddress: string;
//   buyerState: string;
//   buyerLga: string;
//   orderItems: OrderItem[];
//   deliveryType: "home" | "terminal";
//   terminalAddress: string | null;
// }

// interface ApiResponse {
//   message: string;
//   data: Order[];
// }

// interface SupplierOrder {
//   address: string;
//   businessName: string;
//   directions: string | null;
//   lga: string;
//   phone: string;
//   state: string;
//   supplierId: string;
//   orderItems: Array<{
//     id: string;
//     plugPrice: number;
//     productColor: string | null;
//     productId: string;
//     productName: string;
//     productSize: string | null;
//     quantity: number;
//     supplierPrice: number;
//     variantColor: string | null;
//     variantId: string | null;
//     variantSize: string | null;
//   }>;
// }

// type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED";

// // SWR fetcher function
// const fetcher = async (url: string): Promise<ApiResponse> => {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error("Failed to fetch orders");
//   }
//   return response.json();
// };

// // Function to update order status
// const updateOrderStatus = async (
//   orderId: string,
//   newStatus: "SHIPPED" | "DELIVERED"
// ): Promise<void> => {
//   const endpoint =
//     newStatus === "SHIPPED"
//       ? "/api/admin/order/shipped"
//       : "/api/admin/order/delivered";

//   const response = await fetch(endpoint, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ orderId }),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to update order to ${newStatus}`);
//   }

//   return response.json();
// };

// export default function OrdersPage() {
//   const [activeTab, setActiveTab] = useState<OrderStatus>("PENDING");
//   const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
//   const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
//   const [selectedSupplierOrders, setSelectedSupplierOrders] = useState<
//     SupplierOrder[]
//   >([]);
//   const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
//   const { toast } = useToast();

//   // Generate SWR key for current tab
//   const swrKey = `/api/admin/order?orderStatus=${activeTab}`;

//   // Use SWR for data fetching
//   const {
//     data: ordersResponse,
//     error,
//     isLoading,
//     mutate: mutateOrders,
//   } = useSWR<ApiResponse>(swrKey, fetcher, {
//     revalidateOnFocus: false,
//     dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
//   });

//   const orders = ordersResponse?.data || [];

//   console.log("orders", orders);

//   const handleRowClick = async (orderId: string) => {

//      if (activeTab !== "PENDING") {
//        return;
//      }
//     setLoadingOrderDetails(true);
//     try {
//       const res = await fetch(`/api/admin/order/${orderId}`);
//       if (!res.ok) throw new Error("Failed to fetch order details");

//       const data = await res.json();
//       console.log("Order details:", data);

//       // Assuming the API returns supplier order data in the expected format
//       if (data.suppliers && Array.isArray(data.suppliers)) {
//         setSelectedSupplierOrders(data.suppliers);
//         setIsCollectionModalOpen(true);
//       } else {
//         toast({
//           title: "No Supplier Data",
//           description: "No supplier order details found for this order",
//           variant: "destructive",
//         });
//       }
//     } catch (err) {
//       console.error("Error fetching order details:", err);
//       toast({
//         title: "Error",
//         description: "Failed to fetch order details",
//         variant: "destructive",
//       });
//     } finally {
//       setLoadingOrderDetails(false);
//     }
//   };

//   // Handle order status update with optimistic updates
//   const handleUpdateOrderStatus = async (
//     orderId: string,
//     orderDbId: string,
//     newStatus: "SHIPPED" | "DELIVERED"
//   ) => {
//     setUpdatingOrders((prev) => new Set(prev).add(orderId));

//     try {
//       // Optimistic update - remove order from current list immediately
//       await mutateOrders(
//         (currentData) => {
//           if (!currentData) return currentData;
//           return {
//             ...currentData,
//             data: currentData.data.filter((order) => order.orderId !== orderId),
//           };
//         },
//         false // Don't revalidate immediately
//       );

//       // Perform the actual API call
//       await updateOrderStatus(orderDbId, newStatus);

//       // Mutate all related SWR keys to refresh data
//       await Promise.all([
//         mutate(`/api/admin/order?orderStatus=PENDING`),
//         mutate(`/api/admin/order?orderStatus=SHIPPED`),
//         mutate(`/api/admin/order?orderStatus=DELIVERED`),
//       ]);

//       toast({
//         title: "Success",
//         description: `Order ${orderId} has been moved to ${newStatus.toLowerCase()}.`,
//       });
//     } catch (error) {
//       // Revert optimistic update on error
//       await mutateOrders();

//       toast({
//         title: "Error",
//         description: `Failed to update order status. Please try again.`,
//         variant: "destructive",
//       });
//       console.error("Error updating order:", error);
//     } finally {
//       setUpdatingOrders((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(orderId);
//         return newSet;
//       });
//     }
//   };

//   const handleTabChange = (value: string) => {
//     setActiveTab(value as OrderStatus);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const calculateOrderTotal = (orderItems: OrderItem[]) => {
//     return orderItems.reduce(
//       (total, item) => total + item.plugPrice * item.quantity,
//       0
//     );
//   };

//   const getStatusBadge = (status: OrderStatus) => {
//     const statusConfig = {
//       PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Package },
//       SHIPPED: { color: "bg-blue-100 text-blue-800", icon: Truck },
//       DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
//     };

//     const config = statusConfig[status];
//     const Icon = config.icon;

//     return (
//       <Badge className={config.color}>
//         <Icon className="w-3 h-3 mr-1" />
//         {status}
//       </Badge>
//     );
//   };

//   // Handle error state
//   if (error) {
//     return (
//       <div className="container mx-auto p-6">
//         <div className="text-center py-8">
//           <p className="text-red-600 mb-4">Failed to load orders</p>
//           <Button onClick={() => mutateOrders()}>Retry</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold">Order Management</h1>
//         <p className="text-muted-foreground">Manage and track all orders</p>
//       </div>

//       <Tabs
//         value={activeTab}
//         onValueChange={handleTabChange}
//         className="w-full"
//       >
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="PENDING" className="flex items-center gap-2">
//             <Package className="w-4 h-4" />
//             Pending
//           </TabsTrigger>
//           <TabsTrigger value="SHIPPED" className="flex items-center gap-2">
//             <Truck className="w-4 h-4" />
//             Shipped
//           </TabsTrigger>
//           <TabsTrigger value="DELIVERED" className="flex items-center gap-2">
//             <CheckCircle className="w-4 h-4" />
//             Delivered
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value={activeTab} className="mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 {getStatusBadge(activeTab)}
//                 Orders ({orders.length})
//                 {(isLoading || loadingOrderDetails) && (
//                   <Loader2 className="w-4 h-4 animate-spin ml-2" />
//                 )}
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {isLoading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="w-6 h-6 animate-spin mr-2" />
//                   Loading orders...
//                 </div>
//               ) : orders.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No {activeTab.toLowerCase()} orders found.
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Order ID</TableHead>
//                         <TableHead>Customer</TableHead>
//                         <TableHead>Items</TableHead>
//                         <TableHead>Total(excluding delivery fee)</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Location</TableHead>
//                         {activeTab !== "DELIVERED" && (
//                           <TableHead>Actions</TableHead>
//                         )}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {orders.map((order) => (
//                         <TableRow
//                           key={order.id}
//                           onClick={() => handleRowClick(order.id)}
//                            className={`${activeTab === "PENDING" ? "cursor-pointer hover:bg-muted/50" : "cursor-default"}`}
//                         >
//                           <TableCell className="font-medium">
//                             {order.orderId}
//                           </TableCell>
//                           <TableCell>
//                             <div>
//                               <div className="font-medium">
//                                 {order.buyerName}
//                               </div>
//                               <div className="text-sm text-muted-foreground">
//                                 {order.buyerEmail}
//                               </div>
//                               <div className="text-sm text-muted-foreground">
//                                 {order.buyerPhone}
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="space-y-1">
//                               {order.orderItems.map((item, index) => (
//                                 <div key={item.id} className="text-sm">
//                                   {item.productName} x{item.quantity}
//                                   {item.productSize && (
//                                     <span className="text-muted-foreground">
//                                       {" "}
//                                       ({item.productSize})
//                                     </span>
//                                   )}
//                                   {item.productColor && (
//                                     <span className="text-muted-foreground">
//                                       {" "}
//                                       - {item.productColor}
//                                     </span>
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           </TableCell>
//                           <TableCell className="font-medium">
//                             ₦
//                             {calculateOrderTotal(
//                               order.orderItems
//                             ).toLocaleString()}
//                           </TableCell>
//                           <TableCell>{formatDate(order.createdAt)}</TableCell>
//                           <TableCell>
//                             <div className="text-sm">
//                               {order.deliveryType === "terminal" ? (
//                                 <div className="italic text-muted-foreground">
//                                   Terminal: {order.terminalAddress}
//                                 </div>
//                               ) : (
//                                 <>
//                                   <div>{order.buyerAddress}</div>
//                                   <div className="text-muted-foreground">
//                                     {order.buyerLga}, {order.buyerState}
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           </TableCell>
//                           {activeTab !== "DELIVERED" && (
//                             <TableCell onClick={(e) => e.stopPropagation()}>
//                               {activeTab === "PENDING" && (
//                                 <Button
//                                   size="sm"
//                                   onClick={() =>
//                                     handleUpdateOrderStatus(
//                                       order.orderId,
//                                       order.id,
//                                       "SHIPPED"
//                                     )
//                                   }
//                                   disabled={updatingOrders.has(order.orderId)}
//                                 >
//                                   {updatingOrders.has(order.orderId) ? (
//                                     <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                                   ) : (
//                                     <Truck className="w-4 h-4 mr-2" />
//                                   )}
//                                   Mark as Shipped
//                                 </Button>
//                               )}
//                               {activeTab === "SHIPPED" && (
//                                 <Button
//                                   size="sm"
//                                   onClick={() =>
//                                     handleUpdateOrderStatus(
//                                       order.orderId,
//                                       order.id,
//                                       "DELIVERED"
//                                     )
//                                   }
//                                   disabled={updatingOrders.has(order.orderId)}
//                                 >
//                                   {updatingOrders.has(order.orderId) ? (
//                                     <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                                   ) : (
//                                     <CheckCircle className="w-4 h-4 mr-2" />
//                                   )}
//                                   Mark as Delivered
//                                 </Button>
//                               )}
//                             </TableCell>
//                           )}
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       <OrderCollectionModal
//         isOpen={isCollectionModalOpen}
//         onClose={() => setIsCollectionModalOpen(false)}
//         supplierOrders={selectedSupplierOrders}
//       />
//     </div>
//   );
// }









"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
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
import { Loader2, Package, Truck, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import OrderCollectionModal from "@/components/order-collection-modal";
import OrderDetailsModal from "@/components/order-details-modal";
import ConfirmationModal from "@/components/confirmation-modal";


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
  deliveryType: "home" | "terminal";
  terminalAddress: string | null;
}

interface ApiResponse {
  message: string;
  data: Order[];
}

interface SupplierOrder {
  address: string;
  businessName: string;
  directions: string | null;
  lga: string;
  phone: string;
  state: string;
  supplierId: string;
  orderItems: Array<{
    id: string;
    plugPrice: number;
    productColor: string | null;
    productId: string;
    productName: string;
    productSize: string | null;
    quantity: number;
    supplierPrice: number;
    variantColor: string | null;
    variantId: string | null;
    variantSize: string | null;
  }>;
}

type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED";

// SWR fetcher function
const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
};

// Function to update order status
const updateOrderStatus = async (
  orderId: string,
  newStatus: "SHIPPED" | "DELIVERED"
): Promise<void> => {
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

  return response.json();
};

// Function to cancel order
const cancelOrder = async (orderId: string): Promise<void> => {
  const response = await fetch("/api/admin/order/cancelled", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    throw new Error("Failed to cancel order");
  }

  return response.json();
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("PENDING");
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set());
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedSupplierOrders, setSelectedSupplierOrders] = useState<
    SupplierOrder[]
  >([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [orderId, setOrderId] = useState("")
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  });
  const [orderDetailsModal, setOrderDetailsModal] = useState<{
    isOpen: boolean;
    orderId: string | null;
  }>({
    isOpen: false,
    orderId: null,
  });
  const { toast } = useToast();

  // Generate SWR key for current tab
  const swrKey = `/api/admin/order?orderStatus=${activeTab}`;

  // Use SWR for data fetching
  const {
    data: ordersResponse,
    error,
    isLoading,
    mutate: mutateOrders,
  } = useSWR<ApiResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
  });

  const orders = ordersResponse?.data || [];

  console.log("orders", orders);

  const handleRowClick = async (orderId: string) => {
    if (activeTab === "PENDING") {
      setLoadingOrderDetails(true);
      try {
        const res = await fetch(`/api/admin/order/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order details");

        const data = await res.json();
        console.log("Order details:", data);

        if (data.suppliers && Array.isArray(data.suppliers)) {
          setSelectedSupplierOrders(data.suppliers);
          setIsCollectionModalOpen(true);
          setOrderId(orderId)
        } else {
          toast({
            title: "No Supplier Data",
            description: "No supplier order details found for this order",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      } finally {
        setLoadingOrderDetails(false);
      }
    } else if (activeTab === "DELIVERED") {
      setOrderDetailsModal({
        isOpen: true,
        orderId: orderId,
      });
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    orderDbId: string,
    newStatus: "SHIPPED" | "DELIVERED"
  ) => {
    const statusText = newStatus.toLowerCase();
    const action = async () => {
      setUpdatingOrders((prev) => new Set(prev).add(orderId));

      try {
        await mutateOrders((currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            data: currentData.data.filter((order) => order.orderId !== orderId),
          };
        }, false);

        await updateOrderStatus(orderDbId, newStatus);

        await Promise.all([
          mutate(`/api/admin/order?orderStatus=PENDING`),
          mutate(`/api/admin/order?orderStatus=SHIPPED`),
          mutate(`/api/admin/order?orderStatus=DELIVERED`),
        ]);

        toast({
          title: "Success",
          description: `Order ${orderId} has been moved to ${statusText}.`,
        });
      } catch (error) {
        await mutateOrders();
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

    setConfirmationModal({
      isOpen: true,
      title: `Mark as ${newStatus === "SHIPPED" ? "Shipped" : "Delivered"}`,
      description: `Are you sure you want to move this order to ${statusText}?`,
      action,
    });
  };

  const handleCancelOrder = async (orderId: string, orderDbId: string) => {
    const action = async () => {
      setUpdatingOrders((prev) => new Set(prev).add(orderId));

      try {
        await mutateOrders((currentData) => {
          if (!currentData) return currentData;
          return {
            ...currentData,
            data: currentData.data.filter((order) => order.orderId !== orderId),
          };
        }, false);

        await cancelOrder(orderDbId);

        await Promise.all([
          mutate(`/api/admin/order?orderStatus=PENDING`),
          mutate(`/api/admin/order?orderStatus=SHIPPED`),
          mutate(`/api/admin/order?orderStatus=DELIVERED`),
        ]);

        toast({
          title: "Success",
          description: `Order ${orderId} has been cancelled.`,
        });
      } catch (error) {
        await mutateOrders();
        toast({
          title: "Error",
          description: `Failed to cancel order. Please try again.`,
          variant: "destructive",
        });
        console.error("Error cancelling order:", error);
      } finally {
        setUpdatingOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }
    };

    setConfirmationModal({
      isOpen: true,
      title: "Cancel Order",
      description: "Are you sure you want to cancel this order?",
      action,
      variant: "destructive",
    });
  };

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

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load orders</p>
          <Button onClick={() => mutateOrders()}>Retry</Button>
        </div>
      </div>
    );
  }

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
                {(isLoading || loadingOrderDetails) && (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
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
                        <TableHead>Total(excluding delivery fee)</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Location</TableHead>
                        {activeTab !== "DELIVERED" && (
                          <TableHead>Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.id}
                          onClick={() => handleRowClick(order.id)}
                          className={`${
                            activeTab === "PENDING" || activeTab === "DELIVERED"
                              ? "cursor-pointer hover:bg-muted/50"
                              : "cursor-default"
                          }`}
                        >
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
                              {order.deliveryType === "terminal" ? (
                                <div className="italic text-muted-foreground">
                                  Terminal: {order.terminalAddress}
                                </div>
                              ) : (
                                <>
                                  <div>{order.buyerAddress}</div>
                                  <div className="text-muted-foreground">
                                    {order.buyerLga}, {order.buyerState}
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                          {activeTab !== "DELIVERED" && (
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {activeTab === "PENDING" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        order.orderId,
                                        order.id,
                                        "SHIPPED"
                                      )
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
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleCancelOrder(order.orderId, order.id)
                                    }
                                    disabled={updatingOrders.has(order.orderId)}
                                  >
                                    {updatingOrders.has(order.orderId) ? (
                                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                      <X className="w-4 h-4 mr-2" />
                                    )}
                                    Mark as Cancelled
                                  </Button>
                                </div>
                              )}
                              {activeTab === "SHIPPED" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateOrderStatus(
                                      order.orderId,
                                      order.id,
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

      <OrderCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        supplierOrders={selectedSupplierOrders}
        orderId={orderId}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmationModal.action}
        title={confirmationModal.title}
        description={confirmationModal.description}
        variant={confirmationModal.variant}
      />

      <OrderDetailsModal
        isOpen={orderDetailsModal.isOpen}
        onClose={() => setOrderDetailsModal({ isOpen: false, orderId: null })}
        orderId={orderDetailsModal.orderId}
      />
    </div>
  );
}
