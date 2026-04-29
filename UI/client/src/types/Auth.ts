import { z } from 'zod';

// Schema cho Credentials
export const CredentialsSchema = z.object({
  userName: z.string().min(4, 'Tên người dùng phải có ít nhất 4 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

// Schema cho LoginResponse
export const LoginResponseSchema = z.object({
  code: z.number(),
  result: z.object({
    token: z.string(),
    authenticated: z.boolean(),
  }),
});

// Schema cho RegisterCredentials
export const RegisterCredentialsSchema = z.object({
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

// Schema cho RegisterResponse
export const RegisterResponseSchema = z.object({
  code: z.number(),
  message: z.string(),
  result: z.object({
    userId: z.string(),
    email: z.string(),
    otp: z.string(),
    verified: z.string(),
    message: z.string(),
    message2: z.string(),
  }),
});

export const CheckTokenValidResponseSchema = z.object({
  code: z.number(),
  result: z.object({
    valid: z.boolean(),
  }),
});



// Xuất kiểu dữ liệu từ schema
export type Credentials = z.infer<typeof CredentialsSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterCredentials = z.infer<typeof RegisterCredentialsSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type CheckTokenValidResponse = z.infer<typeof CheckTokenValidResponseSchema>;
