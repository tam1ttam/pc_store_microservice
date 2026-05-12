import { z } from "zod";
import { userSchema } from "./auth.schema";

export const sortSchema = z.object({
  empty: z.boolean(),
  sorted: z.boolean(),
  unsorted: z.boolean(),
});

export const pageableSchema = z.object({
  sort: sortSchema,
  offset: z.number().min(0),
  pageNumber: z.number().min(0),
  pageSize: z.number().min(1),
  paged: z.boolean(),
  unpaged: z.boolean(),
});

export const customerContentSchema = z.object({
  content: z.array(userSchema),
  pageable: pageableSchema,
  last: z.boolean(),
  totalElements: z.number().min(0),
  totalPages: z.number().min(0),
  size: z.number().min(0),
  number: z.number().min(0),
  sort: sortSchema,
  first: z.boolean(),
  numberOfElements: z.number().min(0),
  empty: z.boolean(),
});

export const listCustomerResponseSchema = z.object({
  result: customerContentSchema,
  code: z.number(),
});

export type Sort = z.infer<typeof sortSchema>;
export type Pageable = z.infer<typeof pageableSchema>;
export type CustomerContent = z.infer<typeof customerContentSchema>;
export type ListCustomerResponse = z.infer<typeof listCustomerResponseSchema>;
