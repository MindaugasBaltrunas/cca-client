import { QueryClient } from "@tanstack/react-query";

import { logger } from "../../../shared/utils/logger";
import { Post } from "../postApi";

export const createProcessPostResponse = (queryClient: QueryClient) => {
  return (postData: Post) => {
    try {
      // Update the specific post in cache
      queryClient.setQueryData(['posts', postData.id], postData);
      
      // Update the post in the all posts cache if it exists
      queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) => {
        if (!oldPosts) return oldPosts;
        
        const postIndex = oldPosts.findIndex(p => p.id === postData.id);
        if (postIndex >= 0) {
          // Update existing post
          const updatedPosts = [...oldPosts];
          updatedPosts[postIndex] = postData;
          return updatedPosts;
        } else {
          // Add new post to the beginning of the list
          return [postData, ...oldPosts];
        }
      });
      
      logger.info('Post cache updated successfully:', postData.id);
    } catch (error) {
      logger.error('Failed to update post cache:', error);
    }
  };
};

export const removePostFromCache = (queryClient: QueryClient, postId: string) => {
  try {
    // Remove specific post from cache
    queryClient.removeQueries({ queryKey: ['posts', postId] });
    
    // Remove from all posts cache
    queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) => {
      if (!oldPosts) return oldPosts;
      return oldPosts.filter(p => p.id !== postId);
    });
    
    logger.info('Post removed from cache:', postId);
  } catch (error) {
    logger.error('Failed to remove post from cache:', error);
  }
};

export const optimisticallyUpdatePost = (
  queryClient: QueryClient,
  postId: string,
  updates: Partial<Post>
) => {
  try {
    // Optimistically update specific post
    queryClient.setQueryData(['posts', postId], (oldPost: Post | undefined) => {
      if (!oldPost) return oldPost;
      return { ...oldPost, ...updates };
    });
    
    // Optimistically update in all posts list
    queryClient.setQueryData(['posts'], (oldPosts: Post[] | undefined) => {
      if (!oldPosts) return oldPosts;
      
      return oldPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      );
    });
    
    logger.info('Post optimistically updated:', postId);
  } catch (error) {
    logger.error('Failed to optimistically update post:', error);
  }
};

export const invalidatePostQueries = (queryClient: QueryClient, postId?: string) => {
  try {
    if (postId) {
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    }
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    
    logger.info('Post queries invalidated', postId ? `for post: ${postId}` : '');
  } catch (error) {
    logger.error('Failed to invalidate post queries:', error);
  }
};