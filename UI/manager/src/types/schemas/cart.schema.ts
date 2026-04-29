import { z } from "zod";
import { productSchema } from "./product.schema";

export const cartItemSchema = z.object({
  product: productSchema,
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
});

export const cartCountResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  result: z.array(cartItemSchema),
});

export const cartResponseSchema = z.object({
  code: z.number(),
  message: z.string().optional(),
  result: z.object({
    success: z.boolean(),
  }),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type CartCountResponse = z.infer<typeof cartCountResponseSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
