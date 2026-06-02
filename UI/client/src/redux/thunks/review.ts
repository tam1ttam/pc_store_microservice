import { createAsyncThunk } from "@reduxjs/toolkit";
import { reviewApi } from "../../services/api/reviewApi";
import type { ReviewResponse } from "../../services/api/reviewApi";

export const createReview = createAsyncThunk<
  ReviewResponse,
  { productId: string; orderId: string; rating: number; comment?: string },
  { rejectValue: string }
>("review/createReview", async (payload, { rejectWithValue }) => {
  try { return await reviewApi.createReview(payload); }
  catch (e: any) { return rejectWithValue(e?.message ?? "Lỗi tạo đánh giá"); }
});

export const updateReview = createAsyncThunk<
  ReviewResponse,
  { reviewId: string; rating: number; comment?: string },
  { rejectValue: string }
>("review/updateReview", async (payload, { rejectWithValue }) => {
  try { return await reviewApi.updateReview(payload.reviewId, payload); }
  catch (e: any) { return rejectWithValue(e?.message ?? "Lỗi cập nhật đánh giá"); }
});

export const deleteReview = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("review/deleteReview", async (reviewId, { rejectWithValue }) => {
  try { await reviewApi.deleteReview(reviewId); }
  catch (e: any) { return rejectWithValue(e?.message ?? "Lỗi xóa đánh giá"); }
});
