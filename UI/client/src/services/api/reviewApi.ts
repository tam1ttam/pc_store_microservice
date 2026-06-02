import ENDPOINT from "@/constants/endpoint";
import { get, post, put, del } from "../api.service";

export interface ReviewResponse {
  id: string;
  productId: string;
  identityUserId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRatingResponse {
  averageRating: number;
  reviewCount: number;
}

export const reviewApi = {
  getProductRating: (productId: string) =>
    get<ProductRatingResponse>(`${ENDPOINT.REVIEWS}/product/${productId}/rating`),

  getReviewsByProduct: (productId: string) =>
    get<ReviewResponse[]>(`${ENDPOINT.REVIEWS}/product/${productId}`),

  createReview: (payload: {
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
  }) => post<ReviewResponse>(ENDPOINT.REVIEWS, payload),

  updateReview: (reviewId: string, payload: { rating: number; comment?: string }) =>
    put<ReviewResponse>(`${ENDPOINT.REVIEWS}/${reviewId}`, payload),

  deleteReview: (reviewId: string) => del<void>(`${ENDPOINT.REVIEWS}/${reviewId}`),
};
