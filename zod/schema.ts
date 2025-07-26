import * as z from "zod";

const variationSchema = z.object({
  id: z.string(),
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().or(z.string()).optional(),
});
  
export const productFormSchema = z
  .object({
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
    minPrice: z.number().min(0, "Min price must be positive"),
    maxPrice: z.number().min(0, "Max price must be positive"),
  })
  .refine(
    (data) => {
      // Validate that minPrice is not greater than maxPrice
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Min price cannot be greater than max price",
      path: ["minPrice"],
    }
  );


export const updateProductFormSchema = z
  .object({
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
    minPrice: z.number().min(0, "Min price must be positive"),
    maxPrice: z.number().min(0, "Max price must be positive"),
  })
  .refine(
    (data) => {
      // Validate that minPrice is not greater than maxPrice
      if (data.minPrice && data.maxPrice) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Min price cannot be greater than max price",
      path: ["minPrice"],
    }
  );


export type UpdateFormData = z.infer<typeof updateProductFormSchema>;

// Export the type that exactly matches the schema
export type ProductFormData = z.infer<typeof productFormSchema>;
