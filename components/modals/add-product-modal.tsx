"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, truncateText } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import { type ProductFormData, productFormSchema } from "@/zod/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRODUCT_CATEGORIES, categoryRecommendations } from "@/app/constant";
import { Badge } from "../ui/badge";
import { ColorPicker } from "./color-picker";
import { PREDEFINED_COLORS, type ColorOption } from "@/lib/colors";


interface Variation {
  id: string;
  stock?: string | number;
  size?: string;
  color?: string;
  [key: string]: any;
}

export function AddProductModal({
  open,
  onOpenChange,
  supplierId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit: formSubmit, // Rename handleSubmit to formSubmit
    formState: { errors },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      size: "",
      price: 0,
      stock: 0,
      minPrice: 0, // Add this
      maxPrice: 0, // Add this
      colors: [],
      hasVariations: false,
      variations: [],
      images: [],
      imageUrls: [],
    },
  });

  const formData = watch();

  const addProduct = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      data.images.forEach((file: File) => {
        formData.append("images", file);
      });

      const { images, imageUrls, ...jsonData } = data;
      formData.append("productData", JSON.stringify(jsonData));

      const response = await fetch(`/api/admin/product/${supplierId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorResult = await response.json();
        console.error("Server error:", errorResult);

        return null;
      }

      const result = await response.json();

      // Close modal and reset form on success
      onOpenChange(false);
      reset();
      setCurrentStep(0);

      return result;
    } catch (error) {
      console.error("Submission error:", error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle drag and drop for images
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea || !open) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.add("border-primary");
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove("border-primary");
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropArea.classList.remove("border-primary");

      if (e.dataTransfer?.files) {
        handleFiles(e.dataTransfer.files);
      }
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("dragleave", handleDragLeave);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, [open]);

  // Reset step when modal closes
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleFiles = (files: FileList) => {
    const currentImages = formData.images || [];
    const newFiles = Array.from(files).filter(
      (file) =>
        (file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "image/webp" ||
          file.type === "image/svg+xml") &&
        file.size <= 5 * 1024 * 1024
    );

    if (newFiles.length === 0) {
      return;
    }

    if (currentImages.length + newFiles.length > 3) {
      newFiles.splice(3 - currentImages.length);
    }

    const newImages = [...currentImages, ...newFiles];
    const newImageUrls = [
      ...(formData.imageUrls || []),
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ];

    setValue("images", newImages);
    setValue("imageUrls", newImageUrls);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    const newImageUrls = [...(formData.imageUrls || [])];

    URL.revokeObjectURL(newImageUrls[index]);
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);

    setValue("images", newImages);
    setValue("imageUrls", newImageUrls);
  };

  const addVariation = () => {
    const newVariation = {
      id: `var-${Date.now()}`,
      size: "",
      colors: [],
      stock: "",
    };

    setValue("variations", [...(formData.variations || []), newVariation]);
  };

  const updateVariation = (
    index: number,
    field: string,
    value: string | number | string[]
  ) => {
    const updatedVariations = [...(formData.variations || [])] as Variation[];

    // Handle nested dimensions fields
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      if (parent === "dimensions") {
        updatedVariations[index] = {
          ...updatedVariations[index],
          dimensions: {
            ...(updatedVariations[index].dimensions || {}),
            [child]: value,
          },
        };
      }
    } else if (field === "stock") {
      // Special handling for stock field to handle empty string
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value === "" ? "" : Number(value),
      };
    } else {
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value,
      };
    }

    setValue("variations", updatedVariations);
  };

  const removeVariation = (index: number) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations.splice(index, 1);

    setValue("variations", updatedVariations);
  };

  // Updated step navigation logic
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);

      // If we're on the first step (category) and variations are enabled,
      // go directly to variations step (step 1)
      if (currentStep === 0) {
        setCurrentStep(1);
      }
      // If we're on variations step and variations are enabled,
      // skip the single product details step
      else if (currentStep === 1 && formData.hasVariations) {
        setCurrentStep(3); // Skip to media step
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setDirection(-1);

      // If we're on media step and variations are enabled,
      // go back to variations step
      if (currentStep === 3 && formData.hasVariations) {
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

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
  };

  const steps = [
    { id: "category", title: "Category" },
    { id: "variations", title: "Variations" },
    { id: "details", title: "Details" },
    { id: "media", title: "Media" },
    { id: "review", title: "Review" },
  ];

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Category step
        return (
          !!formData.category &&
          !errors.category &&
          !!formData.name &&
          !errors.name &&
          !!formData.price &&
          !errors.price &&
          !!formData.minPrice && // Add this
          !errors.minPrice && // Add this
          !!formData.maxPrice && // Add this
          !errors.maxPrice // Add this
        );
      case 1: // Variations step
        if (formData.hasVariations) {
          // Check if at least one variation exists and has required fields
          return (
            formData.variations &&
            formData.variations.length > 0 &&
            formData.variations.every(
              (v: Variation) =>
                v.stock !== undefined && v.stock !== "" && Number(v.stock) >= 1
            )
          );
        }
        return true; // If no variations, this step is valid
      case 2: // Single product details
        return !errors.stock && formData.stock! >= 1;
      case 3: // Media step
        return (
          (formData.images?.length > 0 || formData.imageUrls?.length > 0) &&
          !errors.images
        );
      case 4: // Review step
        const baseValidation =
          !!formData.category &&
          !!formData.name &&
          !!formData.price &&
          !errors.price &&
          ((formData.images && formData.images.length > 0) ||
            (formData.imageUrls && formData.imageUrls.length > 0));
        return baseValidation;
      default:
        return false;
    }
  };

  // Ensure we have valid data before submitting
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If hasVariations is false, make sure variations is an empty array
    if (!formData.hasVariations) {
      setValue("variations", []);
    }

    if (formData.hasVariations) {
      // When variations are enabled, reset single product fields
      setValue("size", "");
      setValue("colors", []);
      setValue("stock", undefined);
    }

    // Force validation using the submit function from your form hook
    try {
      await formSubmit(addProduct)(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // If modal is not open, render nothing but ensure hooks are called
  if (!open) return null;

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
        {/* Header with swipe indicator for mobile */}
        <div className="sticky top-0 z-10 bg-background">
          <div className="flex items-center justify-between border-b px-4 py-3 md:px-6">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousStep}
                  className="h-9 w-9 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Back</span>
                </Button>
              )}
              <h2 className="text-lg font-semibold">Add Product</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 rounded-full"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Progress indicator - simplified for mobile */}
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
                    : "border border-muted-foreground/30 bg-background text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  index + 1
                )}
                <span className="sr-only">{step.title}</span>
              </div>
            ))}
          </div>
          <p className="mt-1 text-center text-xs font-medium text-muted-foreground md:hidden">
            {steps[currentStep].title}
          </p>
        </div>

        {/* Form content with swipe gestures */}
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
                {/* Step 1: Category - Now includes price field */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="category">Product Category *</Label>
                      <Select
                        {...register("category")}
                        onValueChange={(value) => setValue("category", value)}
                        defaultValue={formData.category}
                      >
                        <SelectTrigger id="category" className="h-12 text-base">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="z-[200]">
                          {PRODUCT_CATEGORIES.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="text-xs md:text-sm"
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.category.message}
                        </p>
                      )}
                    </div>

                    {formData.category && (
                      <div className="rounded-xl border bg-muted/30 p-4">
                        <h3 className="mb-3 text-sm font-medium">
                          Category Recommendations
                        </h3>
                        <ul className="space-y-3">
                          {(
                            categoryRecommendations as Record<string, string[]>
                          )[formData.category]?.map((req, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                              <span className="text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="e.g. Shea Butter Moisturizer"
                        maxLength={100}
                        className="h-12 text-base"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formData.name?.length || 0}/100 (Long names will be
                        truncated in display)
                      </p>
                    </div>

                    {/* Price field moved to first step */}
                    <div className="space-y-3">
                      <Label htmlFor="price">Price (₦) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register("price", {
                          valueAsNumber: true, // Convert to number automatically
                        })}
                        placeholder="0.00"
                        className="h-12 text-base"
                      />
                      {errors.price && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="minPrice">Min Price (₦) *</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register("minPrice", {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          className="h-12 text-base"
                        />
                        {errors.minPrice && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.minPrice.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="maxPrice">Max Price (₦) *</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          {...register("maxPrice", {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          className="h-12 text-base"
                        />
                        {errors.maxPrice && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.maxPrice.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="description">
                        Description{" "}
                        <span className="text-gray-500">
                          (Strongly Recommended)
                        </span>
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="description"
                          {...register("description")}
                          placeholder="Describe your product..."
                          className="min-h-[120px] text-base"
                          maxLength={1000}
                        />
                        {/* Character counter */}
                        <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                          {formData.description?.length || 0}/1000
                        </div>
                      </div>
                      {errors.description && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Variations - Enhanced with sticky Add button */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="hasVariations"
                          checked={formData.hasVariations}
                          onCheckedChange={(checked) =>
                            setValue("hasVariations", checked)
                          }
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
                          className="h-9"
                          type="button"
                        >
                          <Plus className="mr-1 h-4 w-4" /> Add
                        </Button>
                      )}
                    </div>

                    {/* Remove the sticky button section and keep the original structure */}
                    {!formData.hasVariations ? (
                      <div className="rounded-xl border bg-muted/30 p-4 text-center">
                        <p className="text-muted-foreground">
                          This product will be managed as a single item with no
                          variations.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          You'll be able to set stock in the next step.
                        </p>
                      </div>
                    ) : (formData.variations?.length || 0) === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 p-8 text-center">
                        <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="mb-3 font-medium">No variations added</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add variations with different sizes, colors and stock
                          levels.
                        </p>
                        <Button onClick={addVariation} type="button">
                          <Plus className="mr-2 h-4 w-4" /> Add First Variation
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b pb-4 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addVariation}
                            className="h-9 w-full"
                            type="button"
                          >
                            <Plus className="mr-1 h-4 w-4" /> Add Variation
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {formData.variations?.map(
                            (variation: Variation, index) => (
                              <div
                                key={variation.id}
                                className="rounded-xl border bg-muted/30 p-4"
                              >
                                <div className="mb-4 flex items-center justify-between">
                                  <h3 className="font-medium">
                                    Variation {index + 1}
                                  </h3>
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
                                  <div className="space-y-3 pb-4">
                                    <Label htmlFor={`size-${index}`}>
                                      Size *
                                    </Label>
                                    <Input
                                      id={`size-${index}`}
                                      placeholder="e.g. XL, 250ml, 32 inches"
                                      value={variation.size || ""}
                                      onChange={(e) =>
                                        updateVariation(
                                          index,
                                          "size",
                                          e.target.value
                                        )
                                      }
                                      className="h-12 text-base"
                                    />
                                  </div>

                                  <div className="space-y-3 pb-4">
                                    <Label htmlFor={`color-${index}`}>
                                      Colors *
                                    </Label>
                                    <ColorPicker
                                      selectedColors={variation.colors || []}
                                      onColorsChange={(colors) =>
                                        updateVariation(index, "colors", colors)
                                      }
                                      placeholder="Select colors..."
                                      className="z-[110]"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <Label htmlFor={`stock-${index}`}>
                                    Stock *
                                  </Label>
                                  <Input
                                    id={`stock-${index}`}
                                    type="number"
                                    placeholder="1"
                                    value={
                                      variation.stock === undefined
                                        ? ""
                                        : variation.stock
                                    }
                                    onChange={(e) =>
                                      updateVariation(
                                        index,
                                        "stock",
                                        e.target.value === ""
                                          ? ""
                                          : Number(e.target.value)
                                      )
                                    }
                                    className="h-12 text-base"
                                    required
                                  />
                                  {variation.stock !== "" &&
                                    variation.stock !== undefined &&
                                    Number(variation.stock) < 1 && (
                                      <p className="text-xs text-red-500">
                                        Stock must be at least 1
                                      </p>
                                    )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {formData.hasVariations &&
                      formData.variations?.length > 0 && (
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-blue-800 dark:text-blue-300">
                          <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">
                              When using variations, each variation must have
                              stock specified. You'll skip the general product
                              details step.
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Step 3: Single Product Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="rounded-lg bg-muted/30 p-4">
                      <h3 className="mb-3 text-sm font-medium">
                        Single Product Details
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        These details will apply to this product since you're
                        not using variations.
                      </p>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="size">Size</Label>
                        <Input
                          id="size"
                          {...register("size")}
                          placeholder="e.g. XL, 250ml, 32 inches"
                          className="h-12 text-base"
                        />
                        {errors.size && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.size.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="color">Colors</Label>
                        <ColorPicker
                          selectedColors={formData.colors || []}
                          onColorsChange={(colors) =>
                            setValue("colors", colors)
                          }
                          placeholder="Select colors..."
                          className="z-[110]"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        {...register("stock", {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                        className="h-12 text-base"
                      />
                      {errors.stock && (
                        <p className="text-xs text-red-500 mt-1">
                          Stock must be at least 1
                        </p>
                      )}
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
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-800 dark:text-blue-300">
                        <div className="flex items-start gap-2">
                          <ImageIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">
                            <strong>Note:</strong> The first image you upload
                            will be used as the main product image.
                          </p>
                        </div>
                      </div>
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
                          onChange={handleFileInputChange}
                        />
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">Drag & drop images here</p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse files
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="lg"
                          className="mt-2 bg-transparent"
                          type="button"
                        >
                          Select Images
                        </Button>
                      </div>
                    </div>

                    {(formData.imageUrls?.length || 0) > 0 && (
                      <div className="space-y-3">
                        <Label>
                          Uploaded Images ({formData.imageUrls?.length})
                          {formData.imageUrls?.length > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              • First image is main image
                            </span>
                          )}
                        </Label>
                        <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                          {formData.imageUrls?.map((url, index) => (
                            <div
                              key={index}
                              className="group relative aspect-square overflow-hidden rounded-lg"
                            >
                              {index === 0 && (
                                <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs text-white z-10">
                                  Main
                                </div>
                              )}
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
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
                      <h3 className="text-lg font-medium">
                        Review Your Product
                      </h3>
                      <p className="text-muted-foreground">
                        Check all details before submitting. You can go back to
                        edit any section.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border bg-muted/30 p-5">
                        <h4 className="mb-3 text-sm font-medium">
                          Basic Information
                        </h4>
                        <div className="grid gap-4 grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Name
                            </p>
                            <p className="font-medium truncate capitalize">
                              {truncateText(formData.name) || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Category
                            </p>
                            <p className="font-medium capitalize">
                              {formData.category || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Price Range
                            </p>
                            <p className="font-medium">
                              ₦{formData.minPrice || "0.00"} - ₦
                              {formData.maxPrice || "0.00"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Base Price
                            </p>
                            <p className="font-medium">
                              ₦{formData.price || "0.00"}
                            </p>
                          </div>
                          <div className="col-span-2 w-full">
                            <div className="rounded-xl border bg-muted/30 w-full p-5">
                              <h4 className="mb-3 text-sm font-medium">
                                Description
                              </h4>
                              <ScrollArea className="max-h-[200px] w-full overflow-y-auto overflow-x-hidden rounded-md border p-2">
                                <p className="text-muted-foreground leading-relaxed break-all word-wrap overflow-wrap-anywhere hyphens-auto text-sm">
                                  {formData.description ||
                                    "No description provided"}
                                </p>
                              </ScrollArea>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!formData.hasVariations && (
                        <div className="rounded-xl border bg-muted/30 p-5">
                          <h4 className="mb-3 text-sm font-medium">
                            Product Specifications
                          </h4>
                          <div className="grid gap-4 grid-cols-2">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Stock
                              </p>
                              <p className="font-medium">
                                {formData.stock || "0"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Colors
                              </p>
                              {formData.colors && formData.colors.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formData.colors.map((colorValue) => {
                                    const color = PREDEFINED_COLORS.find(
                                      (c) => c.value === colorValue
                                    );
                                    return (
                                      <Badge
                                        key={colorValue}
                                        variant="secondary"
                                        className="flex items-center gap-1 text-xs"
                                      >
                                        <div
                                          className="h-2 w-2 rounded-full border border-gray-300"
                                          style={{
                                            backgroundColor:
                                              color?.hex || "#gray",
                                          }}
                                        />
                                        {color?.name || colorValue}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="font-medium">-</p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Size
                              </p>
                              <p className="font-medium capitalize">
                                {formData.size || "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.hasVariations &&
                        (formData.variations?.length || 0) > 0 && (
                          <div className="rounded-xl border bg-muted/30 p-5">
                            <h4 className="mb-3 text-sm font-medium">
                              Variations ({formData.variations?.length})
                            </h4>
                            <div className="space-y-3">
                              {formData.variations?.map(
                                (variation: Variation, index) => (
                                  <div
                                    key={variation.id}
                                    className="rounded-lg border p-3"
                                  >
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Variation
                                        </p>
                                        <p className="font-medium capitalize">
                                          {variation.size ||
                                          variation.colors?.length
                                            ? [
                                                variation.size,
                                                variation.colors?.join(", "),
                                              ]
                                                .filter(Boolean)
                                                .join(" / ")
                                            : `Variation ${index + 1}`}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Stock
                                        </p>
                                        <p className="font-medium">
                                          {variation.stock}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Size
                                        </p>
                                        <p className="font-medium capitalize">
                                          {variation.size || "-"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">
                                          Colors
                                        </p>
                                        {variation.colors &&
                                        variation.colors.length > 0 ? (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {variation.colors.map(
                                              (colorValue) => {
                                                const color =
                                                  PREDEFINED_COLORS.find(
                                                    (c) =>
                                                      c.value === colorValue
                                                  );
                                                return (
                                                  <Badge
                                                    key={colorValue}
                                                    variant="secondary"
                                                    className="flex items-center gap-1 text-xs"
                                                  >
                                                    <div
                                                      className="h-2 w-2 rounded-full border border-gray-300"
                                                      style={{
                                                        backgroundColor:
                                                          color?.hex || "#gray",
                                                      }}
                                                    />
                                                    {color?.name || colorValue}
                                                  </Badge>
                                                );
                                              }
                                            )}
                                          </div>
                                        ) : (
                                          <p className="font-medium">-</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {(formData.imageUrls?.length || 0) > 0 && (
                        <div className="rounded-xl border bg-muted/30 p-5">
                          <h4 className="mb-3 text-sm font-medium">
                            Images ({formData.imageUrls?.length})
                          </h4>
                          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                            {formData.imageUrls?.map((url, index) => (
                              <div
                                key={index}
                                className="aspect-square overflow-hidden rounded-lg"
                              >
                                <img
                                  src={url || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </form>
        </ScrollArea>

        {/* Footer with floating action on mobile */}
        <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur-sm md:p-6">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => goToPreviousStep()}
              className=""
              type="button"
              disabled={currentStep === 0}
            >
              Back
            </Button>
            <div className="flex items-center gap-3">
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={goToNextStep}
                  disabled={!isStepValid()}
                  className="flex-1 md:flex-none"
                  type="button"
                >
                  Continue <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex-1 md:flex-none"
                  type="button"
                >
                  {isSubmitting ? "Adding Product..." : "Add Product"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
