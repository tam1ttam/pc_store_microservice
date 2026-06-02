import { z } from "zod";
import { userSchema } from "./auth.schema";
import { productSchema } from "./product.schema";

export const orderItemSchema = z.object({
  product: productSchema,
  quantity: z.number(),
});

export const orderSchema = z.object({
  id: z.string(),
  customer: userSchema,
  shipAddress: z.string(),
  orderDate: z.string(),
  items: z.array(orderItemSchema),
  totalPrice: z.number(),
  orderStatus: z.string(),
  isPaid: z.boolean(),
  paid: z.boolean().optional(),
});

export const orderResponseSchema = z.object({
  code: z.number(),
  result: z.array(orderSchema),
});

export const orderAdminSchema = z.object({
  code: z.number(),
  result: z.object({
    content: z.array(orderSchema),
    pageable: z.object({
      pageNumber: z.number(),
      pageSize: z.number(),
      sort: z.object({
        empty: z.boolean(),
        sorted: z.boolean(),
        unsorted: z.boolean()
      }),
      offset: z.number(),
      paged: z.boolean(),
      unpaged: z.boolean()
    }),
    totalPages: z.number(),
    totalElements: z.number(),
    last: z.boolean(),
    size: z.number(),
    number: z.number(),
    sort: z.object({
      empty: z.boolean(),
      sorted: z.boolean(),
      unsorted: z.boolean()
    }),
    numberOfElements: z.number(),
    first: z.boolean(),
    empty: z.boolean()
  })
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrderAdmin = z.infer<typeof orderAdminSchema>;
