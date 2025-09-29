import { logger } from "../../../shared/utils/logger";

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiResponse = <T>(
  response: ApiResponse<T>,
  errorMessage: string
): T => {
  if (!response.success) {
    const error = new Error(response.error || response.message || errorMessage);
    logger.error('API Error:', error);
    throw error;
  }

  if (!response.data) {
    const error = new Error('No data received from API');
    logger.error('API Error:', error);
    throw error;
  }

  return response.data;
};

export const createApiError = (
  message: string,
  status?: number,
  code?: string
): ApiError => ({
  message,
  status,
  code,
});

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === 'string';
};
