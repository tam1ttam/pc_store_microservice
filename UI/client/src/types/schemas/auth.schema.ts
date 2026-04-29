import { z } from "zod";

export const roleSchema = z.object({
  name: z.enum(["ADMIN", "USER", "GUEST"]),
  description: z.string().optional(),
});

export const userSchema = z.object({
  id: z.string(),
  userName: z.string().min(4, "Tên người dùng phải có ít nhất 4 ký tự"),
  firstName: z.string().min(1, "Họ không được để trống"),
  lastName: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, "Số điện thoại gồm 10 số và bắt đầu bằng 0"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  roles: z.array(roleSchema),
});

export const loginRequestSchema = z.object({
  userName: z.string().min(4, "Tên người dùng phải có ít nhất 4 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const loginResponseSchema = z.object({
  code: z.number(),
  result: z.object({
    token: z.string(),
    authenticated: z.boolean(),
  }),
});

export const registerRequestSchema = userSchema.omit({
  id: true,
  roles: true
}).extend({
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(8, "Mật khẩu không được quá 8 ký tự")
});

export const registerResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  result: z.object({
    userId: z.string(),
    email: z.string().email(),
  }),
});

export const userResponseSchema = z.object({
  code: z.number(),
  result: userSchema,
});

export const loginCredentialsSchema = z.object({
  userName: z.string().min(4, 'Tên người dùng phải có ít nhất 4 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const checkTokenValidResponseSchema = z.object({
  code: z.number(),
  result: z.object({
    valid: z.boolean(),
  }),
});

export const logoutResponseSchema = z.object({
  code: z.number(),
});

export const registerCredentialsSchema = z.object({
  userName: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .trim()
    .refine(val => val.length > 0, {
      message: 'Tên đăng nhập không được để trống'
    }),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(8, 'Mật khẩu không được quá 8 ký tự')
    .trim()
    .refine(val => val.length > 0, {
      message: 'Mật khẩu không được để trống'
    }),
  firstName: z.string()
    .min(1, 'Họ không được để trống'),
  lastName: z.string()
    .min(1, 'Tên không được để trống'),
  email: z.string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  phoneNumber: z.string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^0[0-9]{9}$/, 'Số điện thoại gồm 10 số và bắt đầu bằng 0'),
});

export type Role = z.infer<typeof roleSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type CheckTokenValidResponse = z.infer<typeof checkTokenValidResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
