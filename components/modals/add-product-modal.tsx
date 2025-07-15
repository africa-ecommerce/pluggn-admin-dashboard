"use client"
import type React from "react"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export const PRODUCT_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "beauty_skincare", label: "Beauty & Skincare" },
]

interface Variation {
  id: string
  stock?: string | number
  size?: string
  color?: string
  [key: string]: any
}

export function AddProductModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    hasVariations: false,
    variations: [] as Variation[],
    size: "",
    color: "",
    stock: "",
    images: [] as File[],
    imageUrls: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFiles = (files: FileList) => {
    const currentImages = formData.images || []
    const newFiles = Array.from(files).filter(
      (file) =>
        (file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/webp" ||
          file.type === "image/svg+xml") &&
        file.size <= 5 * 1024 * 1024,
    )

    if (newFiles.length === 0) {
      alert("Only images under 5MB allowed")
      return
    }

    if (currentImages.length + newFiles.length > 3) {
      alert("Maximum 3 images allowed")
      newFiles.splice(3 - currentImages.length)
    }

    const newImages = [...currentImages, ...newFiles]
    const newImageUrls = [...(formData.imageUrls || []), ...newFiles.map((file) => URL.createObjectURL(file))]

    updateFormData("images", newImages)
    updateFormData("imageUrls", newImageUrls)
  }

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])]
    const newImageUrls = [...(formData.imageUrls || [])]

    URL.revokeObjectURL(newImageUrls[index])
    newImages.splice(index, 1)
    newImageUrls.splice(index, 1)

    updateFormData("images", newImages)
    updateFormData("imageUrls", newImageUrls)
  }

  const addVariation = () => {
    const newVariation = {
      id: `var-${Date.now()}`,
      size: "",
      color: "",
      stock: "",
    }
    updateFormData("variations", [...(formData.variations || []), newVariation])
  }

  const updateVariation = (index: number, field: string, value: string | number) => {
    const updatedVariations = [...(formData.variations || [])] as Variation[]
    if (field === "stock") {
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value === "" ? "" : Number(value),
      }
    } else {
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value,
      }
    }
    updateFormData("variations", updatedVariations)
  }

  const removeVariation = (index: number) => {
    const updatedVariations = [...(formData.variations || [])]
    updatedVariations.splice(index, 1)
    updateFormData("variations", updatedVariations)
  }

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1)
      if (currentStep === 0) {
        setCurrentStep(1)
      } else if (currentStep === 1 && formData.hasVariations) {
        setCurrentStep(3)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      if (currentStep === 3 && formData.hasVariations) {
        setCurrentStep(1)
      } else {
        setCurrentStep(currentStep - 1)
      }
    }
  }

  const steps = [
    { id: "category", title: "Category" },
    { id: "variations", title: "Variations" },
    { id: "details", title: "Details" },
    { id: "media", title: "Media" },
    { id: "review", title: "Review" },
  ]

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.category && formData.name && formData.price
      case 1:
        if (formData.hasVariations) {
          return (
            formData.variations &&
            formData.variations.length > 0 &&
            formData.variations.every((v: Variation) => v.stock !== undefined && v.stock !== "" && Number(v.stock) >= 1)
          )
        }
        return true
      case 2:
        return formData.stock && Number(formData.stock) >= 1
      case 3:
        return formData.images?.length > 0 || formData.imageUrls?.length > 0
      case 4:
        return (
          formData.category &&
          formData.name &&
          formData.price &&
          ((formData.images && formData.images.length > 0) || (formData.imageUrls && formData.imageUrls.length > 0))
        )
      default:
        return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Product data:", formData)

      // Reset form and close modal
      setFormData({
        category: "",
        name: "",
        price: "",
        description: "",
        hasVariations: false,
        variations: [],
        size: "",
        color: "",
        stock: "",
        images: [],
        imageUrls: [],
      })
      setCurrentStep(0)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: open ? 0 : "100%" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative flex h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-background shadow-xl md:h-[85vh] md:max-h-[700px] md:w-[95vw] md:max-w-2xl md:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background">
          <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="ghost" size="icon" onClick={goToPreviousStep} className="h-9 w-9 rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-lg font-semibold">Add Product</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="sticky top-[60px] z-10 border-b bg-background px-4 py-2 md:px-6">
          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-2 border-primary bg-background text-foreground"
                      : "border border-muted-foreground/30 bg-background text-muted-foreground",
                )}
              >
                {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs font-medium text-muted-foreground md:hidden">
            {steps[currentStep].title}
          </p>
        </div>

        {/* Form content */}
        <ScrollArea className="flex-1">
          <form onSubmit={handleSubmit}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "tween", duration: 0.3 }}
                className="h-full p-4 md:p-6"
              >
                {/* Step 1: Category */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="category">Product Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
                        <SelectTrigger id="category" className="h-12 text-base">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem key={category.value} value={category.value} className="text-xs md:text-sm">
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData("name", e.target.value)}
                        placeholder="e.g. Shea Butter Moisturizer"
                        maxLength={100}
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground">{formData.name?.length || 0}/100</p>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="price">Price (₦) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => updateFormData("price", e.target.value)}
                        placeholder="0.00"
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description">
                        Description <span className="text-gray-500">(Recommended)</span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => updateFormData("description", e.target.value)}
                          placeholder="Describe your product..."
                          className="min-h-[120px] text-base"
                          maxLength={1000}
                        />
                        <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                          {formData.description?.length || 0}/1000
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Variations */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="hasVariations"
                          checked={formData.hasVariations}
                          onCheckedChange={(checked) => updateFormData("hasVariations", checked)}
                        />
                        <Label htmlFor="hasVariations" className="font-medium">
                          Multiple Variations
                        </Label>
                      </div>
                      {formData.hasVariations && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addVariation}
                          className="h-9 bg-transparent"
                          type="button"
                        >
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      )}
                    </div>

                    {!formData.hasVariations ? (
                      <div className="rounded-xl border bg-muted/30 p-4 text-center">
                        <p className="text-muted-foreground">
                          This product will be managed as a single item with no variations.
                        </p>
                      </div>
                    ) : (formData.variations?.length || 0) === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center">
                        <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="mb-3 font-medium">No variations added</p>
                        <Button onClick={addVariation} type="button">
                          <Plus className="mr-2 h-4 w-4" /> Add First Variation
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.variations?.map((variation: Variation, index) => (
                          <div key={variation.id} className="rounded-xl border bg-muted/30 p-4">
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="font-medium">Variation {index + 1}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariation(index)}
                                className="text-destructive hover:text-destructive/80"
                                type="button"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            <div className="grid gap-4 grid-cols-2">
                              <div className="space-y-3">
                                <Label htmlFor={`size-${index}`}>Size *</Label>
                                <Input
                                  id={`size-${index}`}
                                  placeholder="e.g. XL, 250ml"
                                  value={variation.size || ""}
                                  onChange={(e) => updateVariation(index, "size", e.target.value)}
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label htmlFor={`color-${index}`}>Color *</Label>
                                <Input
                                  id={`color-${index}`}
                                  placeholder="e.g. Red"
                                  value={variation.color || ""}
                                  onChange={(e) => updateVariation(index, "color", e.target.value)}
                                  className="h-12 text-base"
                                />
                              </div>
                            </div>
                            <div className="space-y-3 mt-4">
                              <Label htmlFor={`stock-${index}`}>Stock *</Label>
                              <Input
                                id={`stock-${index}`}
                                type="number"
                                placeholder="1"
                                value={variation.stock === undefined ? "" : variation.stock}
                                onChange={(e) =>
                                  updateVariation(index, "stock", e.target.value === "" ? "" : Number(e.target.value))
                                }
                                className="h-12 text-base"
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Single Product Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h3 className="mb-3 text-sm font-medium">Single Product Details</h3>
                      <p className="text-sm text-muted-foreground">
                        These details will apply to this product since you're not using variations.
                      </p>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => updateFormData("size", e.target.value)}
                          placeholder="e.g. XL, 250ml"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => updateFormData("color", e.target.value)}
                          placeholder="e.g. Red"
                          className="h-12 text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => updateFormData("stock", e.target.value)}
                        placeholder="0"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Media */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label>Product Images *</Label>
                      <p className="text-sm text-muted-foreground">
                        Max 3 images (5MB each) - JPG, PNG, WEBP and SVG only
                      </p>
                      <div
                        ref={dropAreaRef}
                        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center transition-colors hover:border-primary hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg, image/png, image/svg+xml, image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        />
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Drag & drop images here</p>
                          <p className="text-sm text-muted-foreground">or click to browse files</p>
                        </div>
                        <Button variant="outline" size="lg" className="mt-2 bg-transparent" type="button">
                          Select Images
                        </Button>
                      </div>
                    </div>

                    {(formData.imageUrls?.length || 0) > 0 && (
                      <div className="space-y-3">
                        <Label>Uploaded Images ({formData.imageUrls?.length})</Label>
                        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                          {formData.imageUrls?.map((url, index) => (
                            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg">
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeImage(index)
                                }}
                                className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                type="button"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Review Your Product</h3>
                      <p className="text-muted-foreground">Check all details before submitting.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-xl border bg-muted/30 p-5">
                        <h4 className="mb-3 text-sm font-medium">Basic Information</h4>
                        <div className="grid gap-4 grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{formData.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-medium capitalize">{formData.category || "-"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Price</p>
                            <p className="font-medium">₦{formData.price || "0.00"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={goToPreviousStep} type="button" disabled={currentStep === 0}>
              Back
            </Button>
            <div className="flex items-center gap-3">
              {currentStep < steps.length - 1 ? (
                <Button onClick={goToNextStep} disabled={!isStepValid()} className="flex-1 md:flex-none" type="button">
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid()}
                  className="flex-1 md:flex-none"
                  type="button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
