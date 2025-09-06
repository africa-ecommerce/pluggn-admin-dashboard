

"use client";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Package,
  TrendingUp,
} from "lucide-react";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { EditProductModal } from "@/components/modals/edit-product-modal";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  category: string;
  images: string[];
  supplierId: string;
  size: string;
  color: string;
  sold: number;
  stock: number;
  plugsCount: number;
  createdAt: string;
  updatedAt: string;
  variations: any[];
  supplier: {
    businessName: string;
    pickupLocation: {
      lga: string;
      state: string;
    };
    image: string | null;
  };
}

interface ApiResponse {
  message: string;
  data: Product[];
}

interface SupplierProductsViewProps {
  supplier: any;
  onBack: () => void;
}

// Fetcher for products
const productsFetcher = async (url: string): Promise<Product[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const result: ApiResponse = await response.json();
  return result.data;
};

export function SupplierProductsView({
  supplier,
  onBack,
}: SupplierProductsViewProps) {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const {
    data: products,
    error,
    isLoading,
    mutate,
  } = useSWR<Product[]>(
    `/api/admin/product/${supplier.supplier.id}`,
    productsFetcher
  );

  console.log("products", products)

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`/api/admin/product/${supplier.supplier.id}/${productToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      // Refresh the products list
      mutate();
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const calculateProductStock = (product: Product): number => {
    if (product.variations && product.variations.length > 0) {
      return product.variations.reduce(
        (total, variation) => total + (variation.stock || 0),
        0
      );
    }
    return product.stock;
  };

  const totalStock =
    products?.reduce((acc, p) => acc + calculateProductStock(p), 0) || 0;

  const totalRevenue =
    products?.reduce((acc, p) => acc + p.sold * p.price, 0) || 0;
  const totalSold = products?.reduce((acc, p) => acc + p.sold, 0) || 0;
  const totalPlugs = products?.reduce((acc, p) => acc + p.plugsCount, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {supplier.businessName || supplier.name || "Supplier Products"}
          </h1>
          <p className="text-muted-foreground">
            {supplier.email && `${supplier.email} • `}
            {supplier.supplier.pickupLocation &&
              `${supplier.supplier.pickupLocation.lga}, ${supplier.supplier.pickupLocation.state}`}
          </p>
        </div>
        <Button onClick={() => setShowAddProductModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-9 w-[100px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load products</p>
              <p className="text-sm text-red-600 mt-2">{error.message}</p>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No products found</p>
              <Button onClick={() => setShowAddProductModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">PRODUCT</th>
                    <th className="pb-3 font-medium">PRICE</th>
                    <th className="pb-3 font-medium">STOCK</th>
                    <th className="pb-3 font-medium">PLUGS</th>
                    <th className="pb-3 font-medium">SOLD</th>
                    <th className="pb-3 font-medium">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    return (
                      <tr key={product.id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                product.images[0] ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={product.name}
                              className="h-10 w-10 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          ₦{product.price.toLocaleString()}
                        </td>
                        <td className="py-4">
                          <span
                            className={
                              calculateProductStock(product) < 10
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {calculateProductStock(product)}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1">
                            <span>{product.plugsCount}</span>
                          </div>
                        </td>
                        <td className="py-4">{product.sold}</td>
                        <td className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AddProductModal
        supplierId={supplier.supplier.id}
        open={showAddProductModal}
        onOpenChange={setShowAddProductModal}
      />
      {selectedProduct && (
        <EditProductModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          productId={selectedProduct.id}
          itemData={selectedProduct}
        supplierId={supplier.supplier.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
