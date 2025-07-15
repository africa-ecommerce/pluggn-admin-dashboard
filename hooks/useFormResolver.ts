import { useForm, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema, ZodType } from "zod";

export function useFormResolver<T extends Record<string, any>>(
  formFn: (data: T) => Promise<any>,
  schema: ZodSchema<T>,
  onSuccess?: (data: any) => void,
  defaultValues?: DefaultValues<T> // ✅ proper type here
) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (formData: T) => {
    try {
      const result = await formFn(formData);
      if (result !== null) {
        form.reset();
        if (onSuccess) onSuccess(result);
        return { success: true, data: result, error: null };
      }
      return { success: false, data: null, error: "Operation failed" };
    } catch (error) {
      console.error("Form submission error:", error);
      return { success: false, data: null, error };
    }
  };

  return {
    form: {
      ...form,
      submit: form.handleSubmit(handleSubmit),
      errors: form.formState.errors,
      isSubmitting: form.formState.isSubmitting,
    },
  };
}
