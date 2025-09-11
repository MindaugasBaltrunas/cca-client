import { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from './utils/apiUtils';
import http, { apiClient } from '../../shared/http';
import { POSTS_ROUTES } from '../../shared/config/postsRoutes';
import { logger } from '../../shared/utils/logger';
import { 
  sanitizeString, 
  sanitizeObject 
} from 'xss-safe-display';

export const API_ENDPOINT_HEADER = 'X-API-Endpoint';

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  isPublished?: boolean;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  isPublished?: boolean;
}

export type PostsQueryParams = {
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
  authorId?: string;
  isPublished?: boolean;
};

// Helper functions
function createApiResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
  return {
    data: response.data,
    success: response.status >= 200 && response.status < 300,
    message: response.statusText,
  };
}

function handleApiError<T>(error: unknown, context: string): ApiResponse<T> {
  logger.error(`${context}:`, error);
  
  if (error instanceof AxiosError) {
    return {
      data: {} as T, // or undefined if your ApiResponse allows it
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
    };
  }
  
  return {
    data: {} as T, // or undefined if your ApiResponse allows it
    success: false,
    message: error instanceof Error ? error.message : 'Unknown error occurred',
  };
}

function validateId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0;
}

function validateCreatePostData(data: CreatePostData): string | null {
  if (!data.title?.trim()) return 'Title is required';
  if (!data.content?.trim()) return 'Content is required';
  return null;
}

// API methods
export const postApi = {
  createPost: async (data: CreatePostData): Promise<ApiResponse<Post>> => {
    try {
      const validationError = validateCreatePostData(data);
      if (validationError) {
        return {
          data: {} as Post,
          success: false,
          message: validationError,
        };
      }

      const safeData = sanitizeObject(data);
      logger.debug('Creating post', { title: safeData.title });
      
      const response = await apiClient.post<Post>(
        POSTS_ROUTES.BASE_URL,
        safeData,
        {
          headers: {
            [API_ENDPOINT_HEADER]: POSTS_ROUTES.ENDPOINTS.CREATE
          }
        }
      );
      
      logger.info('Post created successfully', { postId: response.data.id });
      return createApiResponse(response);
    } catch (error) {
      return handleApiError(error, 'Create post error');
    }
  },

  updatePost: async (id: string, data: UpdatePostData): Promise<ApiResponse<Post>> => {
    try {
      if (!validateId(id)) {
        return {
          data: {} as Post,
          success: false,
          message: 'Invalid post ID provided',
        };
      }

      const safeData = sanitizeObject({ ...data, id }); // Include id in payload
      logger.debug('Updating post', { postId: id, updates: Object.keys(data) });
      
      const response = await apiClient.put<Post>(
        POSTS_ROUTES.BASE_URL,
        safeData,
        {
          headers: {
            [API_ENDPOINT_HEADER]: POSTS_ROUTES.ENDPOINTS.UPDATE
          }
        }
      );
      
      logger.info('Post updated successfully', { postId: id });
      return createApiResponse(response);
    } catch (error) {
      return handleApiError(error, 'Update post error');
    }
  },

  deletePost: async (id: string): Promise<ApiResponse<void>> => {
    try {
      if (!validateId(id)) {
        return {
          data: undefined as any,
          success: false,
          message: 'Invalid post ID provided',
        };
      }

      logger.debug('Deleting post', { postId: id });
      
      const response = await apiClient.delete<void>(
        POSTS_ROUTES.BASE_URL,
        {
          headers: {
            [API_ENDPOINT_HEADER]: POSTS_ROUTES.ENDPOINTS.DELETE
          },
          data: { id } // Send id in request body for DELETE
        }
      );
      
      logger.info('Post deleted successfully', { postId: id });
      return createApiResponse(response);
    } catch (error) {
      return handleApiError(error, 'Delete post error');
    }
  },

  getPost: async (id: string): Promise<ApiResponse<Post>> => {
    try {
      if (!validateId(id)) {
        return {
          data: {} as Post,
          success: false,
          message: 'Invalid post ID provided',
        };
      }

      logger.debug('Fetching post', { postId: id });
      
      const response = await apiClient.get<Post>(
        POSTS_ROUTES.BASE_URL,
        {
          headers: {
            [API_ENDPOINT_HEADER]: POSTS_ROUTES.ENDPOINTS.GET_BY_ID
          },
          params: { id }
        }
      );
      
      return createApiResponse(response);
    } catch (error) {
      return handleApiError(error, 'Get post error');
    }
  },

  getAllPosts: async (params: PostsQueryParams = {}): Promise<ApiResponse<Post[]>> => {
    try {
      const safeParams = sanitizeObject(params);
      logger.debug('Fetching all posts', { safeParams });
       const response =  await http.get(POSTS_ROUTES.ENDPOINTS.GET_ALL, { ...safeParams });
      // const response = await apiClient.get<Post[]>(
      //   POSTS_ROUTES.BASE_URL,
      //   {
      //     headers: {
      //       [API_ENDPOINT_HEADER]: POSTS_ROUTES.ENDPOINTS.GET_ALL
      //     },
      //     params: safeParams
      //   }
      // );
      
      logger.debug('Posts fetched successfully', { count: response.data.length });
      return createApiResponse(response);
    } catch (error) {
      return handleApiError(error, 'Get all posts error');
    }
  },

  // togglePostStatus: async (id: string, isPublished: boolean): Promise<ApiResponse<Post>> => {
  //   try {
  //     if (!validateId(id)) {
  //       return {
  //         data: null,
  //         success: false,
  //         message: 'Invalid post ID provided',
  //         code: 400,
  //       };
  //     }

  //     logger.debug('Toggling post status', { postId: id, isPublished });
      
  //     const response = await apiClient.put<Post>(
  //       POSTS_ROUTES.ENDPOINTS.UPDATE(id), 
  //       { isPublished: Boolean(isPublished) }
  //     );
      
  //     logger.info('Post status toggled successfully', { postId: id, isPublished });
  //     return createApiResponse(response);
  //   } catch (error) {
  //     return handleApiError(error, 'Toggle post status error');
  //   }
  // },

  // // Additional utility methods
  // publishPost: async (id: string): Promise<ApiResponse<Post>> => {
  //   return postApi.togglePostStatus(id, true);
  // },

  // unpublishPost: async (id: string): Promise<ApiResponse<Post>> => {
  //   return postApi.togglePostStatus(id, false);
  // },

  // getPostsByAuthor: async (authorId: string, params: PostsQueryParams = {}): Promise<ApiResponse<Post[]>> => {
  //   try {
  //     if (!validateId(authorId)) {
  //       return {
  //         data: [] as Post[],
  //         success: false,
  //         message: 'Invalid author ID provided',
  //       };
  //     }

  //     const safeParams = sanitizeObject({ ...params, authorId });
  //     logger.debug('Fetching posts by author', { authorId, params: safeParams });
      
  //     const response = await apiClient.get<Post[]>(
  //       POSTS_ROUTES.ENDPOINTS.GET_BY_AUTHOR(authorId),
  //       { params: safeParams }
  //     );
      
  //     logger.debug('Author posts fetched successfully', { 
  //       authorId, 
  //       count: response.data.length 
  //     });
  //     return createApiResponse(response);
  //   } catch (error) {
  //     return handleApiError(error, 'Get posts by author error');
  //   }
  // },
};