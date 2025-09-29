import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { logger } from "../../../shared/utils/logger";
import { createProcessPostResponse } from "../../../infrastructure/api/utils/postUtils";
import { postApi } from "../../../infrastructure/api/postApi";
import { handleApiResponse } from "../../../infrastructure/api/utils/apiUtils";

// Types
export interface PostResponse {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

interface CreatePostData {
    title: string;
    content: string;
}

interface UpdatePostData {
    id: string;
    title?: string;
    content?: string;
}

interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    error?: string;
}

// Response transformer function
export function createPostResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
        data: response.data,
        success: response.status >= 200 && response.status < 300,
        message: response.statusText
    };
}

export const usePostMutations = () => {
    const queryClient = useQueryClient();

    const processPostResponse = createProcessPostResponse(queryClient);

    // Create post mutation
    const createPostMutation = useMutation<PostResponse, Error, CreatePostData>({
        mutationFn: async (postData) => {
            const result = await postApi.createPost(postData);
            // Properly type the result - assuming postApi returns ApiResponse<PostResponse>
            return handleApiResponse(result, 'Post creation failed');
        },
        onSuccess: (data) => {
            logger.info('Post created successfully:', data.id);
            processPostResponse(data);

            // Invalidate and refetch posts list
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: Error) => {
            logger.error('Post creation failed:', error);
        },
    });

    // Update post mutation
    const updatePostMutation = useMutation<PostResponse, Error, UpdatePostData>({
        mutationFn: async (postData) => {
            const result = await postApi.updatePost(postData.id, postData);
            return handleApiResponse(result, 'Post update failed');
        },
        onSuccess: (data) => {
            logger.info('Post updated successfully:', data.id);
            processPostResponse(data);

            // Update specific post in cache
            queryClient.setQueryData(['posts', data.id], data);

            // Invalidate posts list to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: Error) => {
            logger.error('Post update failed:', error);
        },
    });

    // Delete post mutation
    const deletePostMutation = useMutation<void, Error, string>({
        mutationFn: async (postId) => {
            const result = await postApi.deletePost(postId);
            return handleApiResponse(result, 'Post deletion failed');
        },
        onSuccess: (_, postId) => {
            logger.info('Post deleted successfully:', postId);

            // Remove post from cache
            queryClient.removeQueries({ queryKey: ['posts', postId] });

            // Invalidate posts list
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error: Error) => {
            logger.error('Post deletion failed:', error);
        },
    });

    // Publish/unpublish post mutation
    // const togglePostStatusMutation = useMutation<PostResponse, Error, { id: string; isPublished: boolean }>({
    //     mutationFn: async ({ id, isPublished }) => {
    //         const result = await postApi.togglePostStatus(id, isPublished);
    //         return handleApiResponse(result, 'Post status toggle failed');
    //     },
    //     onSuccess: (data) => {
    //         logger.info('Post status toggled successfully:', data.id);
    //         processPostResponse(data);

    //         // Update specific post in cache
    //         queryClient.setQueryData(['posts', data.id], data);

    //         // Invalidate posts list
    //         queryClient.invalidateQueries({ queryKey: ['posts'] });
    //     },
    //     onError: (error: Error) => {
    //         logger.error('Post status toggle failed:', error);
    //     },
    // });

    return {
        createPostMutation,
        updatePostMutation,
        deletePostMutation,
        // togglePostStatusMutation,

        // Convenience methods for checking mutation states
        isCreating: createPostMutation.isPending,
        isUpdating: updatePostMutation.isPending,
        isDeleting: deletePostMutation.isPending,
        // isToggling: togglePostStatusMutation.isPending,

        // Any mutation is pending
        isLoading: createPostMutation.isPending ||
            updatePostMutation.isPending ||
            deletePostMutation.isPending 
            // togglePostStatusMutation.isPending,
    };
};