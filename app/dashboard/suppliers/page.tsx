"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Mail, Phone, User, Package } from "lucide-react"
import { AddProductModal } from "@/components/modals/add-product-modal"
import { SupplierProductsView } from "@/components/supplier-products-view"

interface Supplier {
  id: string
  name: string
  brandName: string
  email: string
  phone: string
  productsCount: number
  status: "active" | "inactive"
  joinedDate: string
}

// Mock fetcher function - replace with your actual API call
// const fetcher = async (url: string) => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000))

//   // Mock supplierData - replace with actual API call
//   return [
//     {
//       id: "1",
//       name: "John Doe",
//       brandName: "TechCorp",
//       email: "john@techcorp.com",
//       phone: "+1234567890",
//       productsCount: 15,
//       status: "active",
//       joinedDate: "2024-01-15",
//     },
//     {
//       id: "2",
//       name: "Jane Smith",
//       brandName: "Fashion Hub",
//       email: "jane@fashionhub.com",
//       phone: "+1234567891",
//       productsCount: 8,
//       status: "active",
//       joinedDate: "2024-02-20",
//     },
//     {
//       id: "3",
//       name: "Mike Johnson",
//       brandName: "Beauty Essentials",
//       email: "mike@beautyessentials.com",
//       phone: "+1234567892",
//       productsCount: 23,
//       status: "inactive",
//       joinedDate: "2024-01-10",
//     },
//   ] as Supplier[]
// }


const fetcher = (url: string) => fetch(url).then((res) => res.json());


export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")

  const { data: supplierData, error, isLoading } = useSWR("/api/admin/user/suppliers", fetcher)

  const filteredSuppliers =
    supplierData?.suppliers?.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplier.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const handleAddProduct = (supplierId: string) => {
    setSelectedSupplierId(supplierId)
    setShowAddProductModal(true)
  }

  const handleSupplierClick = (supplier) => {
    setSelectedSupplier(supplier)
  }

  const handleBackToSuppliers = () => {
    setSelectedSupplier(null)
  }

  if (selectedSupplier) {
    return <SupplierProductsView supplier={selectedSupplier} onBack={handleBackToSuppliers} />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers and their products</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search suppliers..."
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
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierData.suppliers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
        
        </Card>
       
      
      </div>

      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
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
              <p className="text-muted-foreground">Failed to load suppliers</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.supplier.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleSupplierClick(supplier)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{supplier.name}</h3>
                      
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {supplier.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {supplier.phone}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Brand: <span className="font-medium">{supplier.supplier.businessName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddProduct(supplier.supplier.id)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <AddProductModal supplierId={selectedSupplierId} open={showAddProductModal} onOpenChange={setShowAddProductModal} />
    </div>
  )
}
