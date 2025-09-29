// features/posts/hooks/usePostsQueries.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { postApi, PostsQueryParams } from '../../../infrastructure/api/postApi';
import { logger } from '../../../shared/utils/logger';

// reuse or import shared types
export interface PostResponse {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useGetAllPosts = (queryParams?: PostsQueryParams) => {
  return useQuery({
    queryKey: ['posts', queryParams],
    queryFn: () => postApi.getAllPosts(queryParams),
    placeholderData: keepPreviousData, 
  });
};

export const useGetPost = (id?: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => {
      if (!id) throw new Error('id required');
      return postApi.getPost(id);
    },
    enabled: !!id,
  });
};
