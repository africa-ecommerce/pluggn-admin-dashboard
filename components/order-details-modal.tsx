"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Pause, Play, RotateCcw, User, MapPin, Phone, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ConfirmationModal from "./confirmation-modal"

interface OrderItem {
  id: string
  plugPrice: number
  productColor: string | null
  productId: string
  productName: string
  productSize: string | null
  quantity: number
  supplierPrice: number
  variantColor: string | null
  variantId: string | null
  variantSize: string | null
}

interface Supplier {
  address: string
  businessName: string
  directions: string | null
  lga: string
  phone: string
  state: string
  supplierId: string
  orderItems: OrderItem[]
}

interface OrderDetails {
  buyer: {
    name: string
    email: string
    phone: string
    address: string
    state: string
  }
  createdAt: string
  deliveryFee: number
  deliveryType: "home" | "terminal"
  orderId: string
  orderNumber: string
  status: string
  suppliers: Supplier[]
}

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string | null
}

interface PausedItem {
  orderItemId: string
  quantity: number
}

export default function OrderDetailsModal({ isOpen, onClose, orderId }: OrderDetailsModalProps) {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [pausedItems, setPausedItems] = useState<PausedItem[]>([])
  const [loadingPaused, setLoadingPaused] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    description: string
    action: () => Promise<void>
    variant?: "default" | "destructive"
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  })
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
      fetchPausedItems()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    if (!orderId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/order/${orderId}`)
      if (!response.ok) throw new Error("Failed to fetch order details")

      const data = await response.json()
      setOrderDetails(data)

      // Initialize quantities for all items
      const initialQuantities: Record<string, number> = {}
      data.suppliers?.forEach((supplier: Supplier) => {
        supplier.orderItems.forEach((item: OrderItem) => {
          initialQuantities[item.id] = 1
        })
      })
      setQuantities(initialQuantities)
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPausedItems = async () => {
    if (!orderId) return

    setLoadingPaused(true)
    try {
      const response = await fetch(`/api/admin/order/paused/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setPausedItems(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching paused items:", error)
    } finally {
      setLoadingPaused(false)
    }
  }

  const isItemPaused = (itemId: string) => {
    return pausedItems.some((item) => item.orderItemId === itemId)
  }

  const handlePauseToggle = async (itemId: string, maxQuantity: number) => {
    const isPaused = isItemPaused(itemId)
    const quantity = quantities[itemId] || 1

    if (quantity > maxQuantity) {
      toast({
        title: "Invalid Quantity",
        description: `Quantity cannot exceed ${maxQuantity}`,
        variant: "destructive",
      })
      return
    }

    const action = async () => {
      setActionLoading(itemId)
      try {
        const endpoint = isPaused ? "/api/admin/order/unpause" : "/api/admin/order/pause"
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderItemId: itemId, quantity }),
        })

        if (!response.ok) throw new Error(`Failed to ${isPaused ? "unpause" : "pause"} item`)

        await fetchPausedItems() // Refresh paused items
        toast({
          title: "Success",
          description: `Item ${isPaused ? "unpaused" : "paused"} successfully`,
        })
      } catch (error) {
        console.error(`Error ${isPaused ? "unpausing" : "pausing"} item:`, error)
        toast({
          title: "Error",
          description: `Failed to ${isPaused ? "unpause" : "pause"} item`,
          variant: "destructive",
        })
      } finally {
        setActionLoading(null)
      }
    }

    setConfirmModal({
      isOpen: true,
      title: `${isPaused ? "Unpause" : "Pause"} Item`,
      description: `Are you sure you want to ${isPaused ? "unpause" : "pause"} ${quantity} unit(s) of this item?`,
      action,
    })
  }

  const handleReturn = async (itemId: string, maxQuantity: number) => {
    const quantity = quantities[itemId] || 1

    if (quantity > maxQuantity) {
      toast({
        title: "Invalid Quantity",
        description: `Quantity cannot exceed ${maxQuantity}`,
        variant: "destructive",
      })
      return
    }

    const action = async () => {
      setActionLoading(itemId)
      try {
        const response = await fetch("/api/admin/order/return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderItemId: itemId, quantity }),
        })

        if (!response.ok) throw new Error("Failed to return item")

        toast({
          title: "Success",
          description: "Item returned successfully",
        })

        // Refresh order details
        await fetchOrderDetails()
      } catch (error) {
        console.error("Error returning item:", error)
        toast({
          title: "Error",
          description: "Failed to return item",
          variant: "destructive",
        })
      } finally {
        setActionLoading(null)
      }
    }

    setConfirmModal({
      isOpen: true,
      title: "Return Item",
      description: `Are you sure you want to return ${quantity} unit(s) of this item?`,
      action,
      variant: "destructive",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details - {orderDetails?.orderNumber || orderId}
              {(loading || loadingPaused) && <Loader2 className="w-4 h-4 animate-spin" />}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading order details...
            </div>
          ) : orderDetails ? (
            <div className="space-y-6">
              {/* Buyer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Buyer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{orderDetails.buyer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{orderDetails.buyer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{orderDetails.buyer.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        <div>{orderDetails.buyer.address}</div>
                        <div className="text-muted-foreground">{orderDetails.buyer.state}</div>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Delivery: </span>
                      <Badge variant="outline">
                        {orderDetails.deliveryType === "home" ? "Home Delivery" : "Terminal Pickup"}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Order Date: </span>
                      {formatDate(orderDetails.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items by Supplier */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                {orderDetails.suppliers.map((supplier, supplierIndex) => (
                  <Card key={supplier.supplierId}>
                    <CardHeader>
                      <CardTitle className="text-base">{supplier.businessName}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {supplier.address}, {supplier.lga}, {supplier.state}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {supplier.orderItems.map((item, itemIndex) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.productName}</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {item.productSize && <div>Size: {item.productSize}</div>}
                                  {item.productColor && <div>Color: {item.productColor}</div>}
                                  <div>Quantity: {item.quantity}</div>
                                  <div>Price: ₦{item.plugPrice.toLocaleString()}</div>
                                  <div>Total: ₦{(item.plugPrice * item.quantity).toLocaleString()}</div>
                                </div>
                                {isItemPaused(item.id) && (
                                  <Badge variant="secondary" className="mt-2">
                                    Paused
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-col gap-3 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor={`quantity-${item.id}`} className="text-xs">
                                    Qty:
                                  </Label>
                                  <Input
                                    id={`quantity-${item.id}`}
                                    type="number"
                                    min="1"
                                    max={item.quantity}
                                    value={quantities[item.id] || 1}
                                    onChange={(e) =>
                                      setQuantities((prev) => ({
                                        ...prev,
                                        [item.id]: Number.parseInt(e.target.value) || 1,
                                      }))
                                    }
                                    className="w-16 h-8 text-xs"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePauseToggle(item.id, item.quantity)}
                                    disabled={actionLoading === item.id}
                                    className="flex-1"
                                  >
                                    {actionLoading === item.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : isItemPaused(item.id) ? (
                                      <Play className="w-3 h-3" />
                                    ) : (
                                      <Pause className="w-3 h-3" />
                                    )}
                                    <span className="ml-1 text-xs">{isItemPaused(item.id) ? "Unpause" : "Pause"}</span>
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReturn(item.id, item.quantity)}
                                    disabled={actionLoading === item.id}
                                    className="flex-1"
                                  >
                                    {actionLoading === item.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <RotateCcw className="w-3 h-3" />
                                    )}
                                    <span className="ml-1 text-xs">Return</span>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Delivery Fee:</span>
                    <span>₦{orderDetails.deliveryFee.toLocaleString()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Status:</span>
                    <Badge>{orderDetails.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Failed to load order details</div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
      />
    </>
  )
}
