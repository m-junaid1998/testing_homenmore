"use client";

import { useGetQuery, useCrudMutation, useUploadMutation } from "../api/apiSlice";
import { endpoints } from "../api/config";
import { useApiHandler, type ApiHandlerOptions } from "../api/useApiHandler";

export interface CreateReviewPayload {
  name: string;
  rating: number;
  comment: string;
  title?: string;
  photos?: File[];
}

export const useReview = (productId?: string | number) => {
  const [crudMutation, { isLoading: isCrudLoading }] = useCrudMutation();
  const [uploadMutation, { isLoading: isUploadLoading }] = useUploadMutation();
  const { handleApiCall } = useApiHandler();

  const isReviewMutationLoading = isCrudLoading || isUploadLoading;

  const reviewsQueryResult = useGetQuery(
    { endpoint: endpoints.reviewRoutes.getByProduct(productId || "") },
    { skip: !productId }
  );

  const { refetch: refetchReviews } = reviewsQueryResult;

  const createReview = async ( targetProductId: string | number, data: CreateReviewPayload, options?: ApiHandlerOptions ) => {
  const res = await handleApiCall( uploadMutation({
  endpoint: endpoints.reviewRoutes.create(targetProductId), method: "POST",  data}).unwrap(),
  { successMessage: "Review submitted successfully.",
     errorMessage: "Failed to submit review.",  ...options,
  });
  if (res?.success) { refetchReviews();} return res;};

  const deleteReviewByUser = async (reviewId: string | number, options?: ApiHandlerOptions) => {
    const res = await handleApiCall(
      crudMutation({
        endpoint: endpoints.reviewRoutes.deleteByUser(reviewId),
        method: "DELETE",
      }).unwrap(),
      {
        successMessage: "Review deleted successfully.",
        errorMessage: "Failed to delete review.",
        ...options,
      }
    );

    if (res?.success) {
      refetchReviews();
    }
    return res;
  };

  const deleteReviewByAdmin = async (reviewId: string | number, options?: ApiHandlerOptions) => {
    const res = await handleApiCall(
      crudMutation({
        endpoint: endpoints.reviewRoutes.deleteByAdmin(reviewId),
        method: "DELETE",
      }).unwrap(),
      {
        successMessage: "Review deleted by admin successfully.",
        errorMessage: "Failed to delete review.",
        ...options,
      }
    );

    if (res?.success) {
      refetchReviews();
    }
    return res;
  };

  return {
    reviewsQueryResult,
    reviews: reviewsQueryResult.data?.data || [],
    reviewsCount: reviewsQueryResult.data?.count || 0,

    isLoadingReviews: reviewsQueryResult.isLoading,
    isFetchingReviews: reviewsQueryResult.isFetching,
    isReviewMutationLoading,

    refetchReviews,
    createReview,
    deleteReviewByUser,
    deleteReviewByAdmin,
  };
};