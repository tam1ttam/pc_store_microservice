import { z } from "zod";

export const cartItemSchema = z.object({
    id: z.number(),
    productId: z.string(),
    productName: z.string(),
    productPrice: z.number(),
    productImage: z.string().optional(),
    quantity: z.number().min(1),
    subtotal: z.number(),
});

export const cartResponseSchema = z.object({
    code: z.number(),
    message: z.string().optional(),
    result: z.object({
        id: z.number(),
        identityUserId: z.string(),
        items: z.array(cartItemSchema),
        totalItems: z.number(),
        totalPrice: z.number(),
    }),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type CartResponse = z.infer<typeof cartResponseSchema>;
