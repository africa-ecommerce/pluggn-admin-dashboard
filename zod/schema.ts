import * as z from "zod";

const variationSchema = z.object({
  id: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().or(z.string()).optional(),
});
  
export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(1000).optional(),
  size: z.string().optional(),
  price: z.number().min(1, "Price is required"),
  stock: z.number().optional(),
  color: z.string().optional(),
  hasVariations: z.boolean(),
  variations: z.array(variationSchema),
  images: z.array(z.instanceof(File)),
  imageUrls: z.array(z.string()),
});

export const updateProductFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(1000).optional(),
  size: z.string().optional(),
  price: z.number().min(1, "Price is required"),
  stock: z.number().optional(),
  color: z.string().optional(),
  hasVariations: z.boolean(),
  variations: z.array(variationSchema),
  images: z.array(z.instanceof(File)).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export type UpdateFormData = z.infer<typeof updateProductFormSchema>;

// Export the type that exactly matches the schema
export type ProductFormData = z.infer<typeof productFormSchema>;
