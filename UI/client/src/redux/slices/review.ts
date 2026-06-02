import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createReview, updateReview, deleteReview } from "../thunks/review";
import type { ReviewResponse, ProductRatingResponse } from "../services/api/reviewApi";

export interface ReviewState {
  byProduct: Record<string, ProductRatingResponse>;
  byId: Record<string, ReviewResponse>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ReviewState = {
  byProduct: {},
  byId: {},
  status: "idle",
  error: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    setProductRating(
      state,
      action: PayloadAction<{ productId: string; rating: ProductRatingResponse }>
    ) {
      state.byProduct[action.payload.productId] = action.payload.rating;
    },
    setReviews(state, action: PayloadAction<ReviewResponse[]>) {
      for (const r of action.payload) state.byId[r.id] = r;
    },
    clearReviewError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(createReview.fulfilled, (s, a) => { s.status = "succeeded"; s.byId[a.payload.id] = a.payload; })
      .addCase(createReview.rejected, (s, a) => { s.status = "failed"; s.error = (a.payload as string) ?? "Không thể gửi đánh giá"; })
      .addCase(updateReview.fulfilled, (s, a) => { s.byId[a.payload.id] = a.payload; })
      .addCase(deleteReview.fulfilled, (s, a) => { delete s.byId[a.meta.arg]; });
  },
});

export const { setProductRating, setReviews, clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
