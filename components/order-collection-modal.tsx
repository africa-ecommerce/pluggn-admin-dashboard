"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Phone, Package, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addCheckedItem,
  removeCheckedItem,
  getAllCheckedItems,
  clearAllCheckedItems,
} from "@/lib/indexeddb";

interface OrderItem {
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
}

interface SupplierOrder {
  address: string;
  businessName: string;
  directions: string | null;
  lga: string;
  phone: string;
  state: string;
  supplierId: string;
  orderItems: OrderItem[];
}

interface OrderCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierOrders: SupplierOrder[];
  orderId: string
}

export default function OrderCollectionModal({
  isOpen,
  onClose,
  supplierOrders,
  orderId
}: OrderCollectionModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load checked items from IndexedDB on mount
  useEffect(() => {
    const loadCheckedItems = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const checkedItemsFromDB = await getAllCheckedItems();
        const checkedKeys = new Set(checkedItemsFromDB.map((item) => item.key));
        setCheckedItems(checkedKeys);
      } catch (error) {
        console.error("Error loading checked items:", error);
        toast({
          title: "Error",
          description: "Failed to load saved selections",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckedItems();
  }, [isOpen, toast]);

  const handleItemCheck = async (
    checked: boolean,
    item: OrderItem,
    supplierId: string
  ) => {
    const key = `${item.productId}-${
      item.variantId || "no-variant"
    }-${supplierId}`;

    try {
      if (checked) {
        await addCheckedItem({
          orderItemId: item.id,
          productId: item.productId,
          supplierId,
          productName: item.productName,
          quantity: item.quantity,
          supplierPrice: item.supplierPrice,
          productSize: item.productSize,
          productColor: item.productColor,
          variantSize: item.variantSize,
          variantColor: item.variantColor,
          variantId: item.variantId,
        });
        setCheckedItems((prev) => new Set(prev).add(key));
      } else {
        await removeCheckedItem(item.productId, supplierId, item.variantId);
        setCheckedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Error updating checked item:", error);
      toast({
        title: "Error",
        description: "Failed to update selection",
        variant: "destructive",
      });
    }
  };

  // const handleDone = async () => {
  //   setIsSubmitting(true);
  //   try {
  //     const allCheckedItems = await getAllCheckedItems();

  //     console.log("allCheckedItems", allCheckedItems)

  //     if (allCheckedItems.length === 0) {
  //       toast({
  //         title: "No Items Selected",
  //         description: "Please select at least one item to collect",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     const response = await fetch(`/api/admin/order/received/${orderId}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ items: allCheckedItems }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to submit collected items");
  //     }

  //     await clearAllCheckedItems();
  //     setCheckedItems(new Set());

  //     toast({
  //       title: "Success",
  //       description: `${allCheckedItems.length} items marked as collected`,
  //     });

  //     onClose();
  //   } catch (error) {
  //     console.error("Error submitting collected items:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to submit collected items",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleDone = async () => {
  setIsSubmitting(true);
  try {
    const allCheckedItems = await getAllCheckedItems();

    console.log("allCheckedItems", allCheckedItems);

    if (allCheckedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to collect",
        variant: "destructive",
      });
      return;
    }

    // ✅ Extract just the orderItemId values
    const orderItemIds = allCheckedItems.map((item) => item.orderItemId);

    const response = await fetch(`/api/admin/order/received/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // ✅ Backend will now receive { orderItemIds: ["id1", "id2", ...] }
      body: JSON.stringify({ orderItemIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit collected items");
    }

    await clearAllCheckedItems();
    setCheckedItems(new Set());

    toast({
      title: "Success",
      description: `${orderItemIds.length} items marked as collected`,
    });

    onClose();
  } catch (error) {
    console.error("Error submitting collected items:", error);
    toast({
      title: "Error",
      description: "Failed to submit collected items",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const formatItemDetails = (item: OrderItem) => {
    const details = [];
    if (item.productSize || item.variantSize) {
      details.push(item.productSize || item.variantSize);
    }
    if (item.productColor || item.variantColor) {
      details.push(item.productColor || item.variantColor);
    }
    return details.length > 0 ? `(${details.join(", ")})` : "";
  };

  const getTotalCheckedItems = () => checkedItems.size;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Collection Details
            {getTotalCheckedItems() > 0 && (
              <Badge variant="secondary">
                {getTotalCheckedItems()} items selected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading order details...
          </div>
        ) : (
          <div className="space-y-6">
            {supplierOrders.map((supplier, index) => (
              <Card key={supplier.supplierId}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {supplier.businessName}
                  </CardTitle>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{supplier.address}</div>
                        <div>
                          {supplier.lga}, {supplier.state}
                        </div>
                        {supplier.directions && (
                          <div className="italic mt-1">
                            Directions: {supplier.directions}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium">Order Items:</h4>
                    {supplier.orderItems.map((item) => {
                      const itemKey = `${item.productId}-${
                        item.variantId || "no-variant"
                      }-${supplier.supplierId}`;
                      const isChecked = checkedItems.has(itemKey);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleItemCheck(
                                !!checked,
                                item,
                                supplier.supplierId
                              )
                            }
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {item.productName} {formatItemDetails(item)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} • Supplier Price: ₦
                              {item.supplierPrice.toLocaleString()}
                              {item.variantId && (
                                <span> • Variant ID: {item.variantId}</span>
                              )}
                            </div>
                          </div>
                          {isChecked && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                {index < supplierOrders.length - 1 && <Separator />}
              </Card>
            ))}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            disabled={isSubmitting || getTotalCheckedItems() === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Done ({getTotalCheckedItems()} items)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
