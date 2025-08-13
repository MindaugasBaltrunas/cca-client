import { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { logger } from '../utils/logger';
import { getAccessToken } from '../../infrastructure/services/tokenStorage';

const AUTH_EXEMPT_ENDPOINTS = [
    API_CONFIG.ENDPOINTS.AUTH.SIGN_IN,
    API_CONFIG.ENDPOINTS.AUTH.SIGN_UP,
    API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN
];

const API_KEY_REQUIRED_ENDPOINTS = [
    API_CONFIG.ENDPOINTS.AUTH.ADMIN_SIGN_IN,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.SETUP,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.ENABLE,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.DISABLE,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.VERIFY
];

const extractEndpointIdentifier = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    const pathSegment = url.split('/').pop();
    if (!pathSegment) return undefined;
    
    return pathSegment.split('?')[0];
};

const matchesEndpoint = (url: string | undefined, endpoints: string[]): boolean => {
    const endpoint = extractEndpointIdentifier(url);
    if (!endpoint) return false;
    
    return endpoints.includes(endpoint);
};

export const applyCommonHeaders = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => ({
    ...config,
    headers: AxiosHeaders.from({
        ...config.headers,
        'Content-Type': config.headers['Content-Type'] || 'application/json',
        'X-API-Secret': API_CONFIG.API_SECRET
    })
});

export const applyAuthHeaders = async (
    config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
    if (config.url && matchesEndpoint(config.url, AUTH_EXEMPT_ENDPOINTS)) {
        return config;
    }

    try {
        const token = await getAccessToken();
        
        if (token) {
            return {
                ...config,
                headers: AxiosHeaders.from({
                    ...config.headers,
                    'Authorization': `Bearer ${token}`
                })
            };
        }
    } catch (error) {
        logger.error('Error getting access token for request:', error);
    }
    
    return config;
};

export const applyEndpointSpecificHeaders = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const updatedHeaders = { ...config.headers };

    const endpointIdentifier = extractEndpointIdentifier(config.url);
    if (endpointIdentifier) {
        updatedHeaders['X-API-Endpoint'] = endpointIdentifier;
    }
    
    if (config.url && matchesEndpoint(config.url, API_KEY_REQUIRED_ENDPOINTS)) {
        updatedHeaders['X-API-Key'] = API_CONFIG.API_KEY;
    }
    
    return {
        ...config,
        headers: AxiosHeaders.from(updatedHeaders)
    };
};

export const sanitizeRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (config.data && typeof config.data === 'object') {
        return {
            ...config,
            data: config.data
        };
    }
    
    return config;
};

export const standardizeApiUrl = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const originalUrl = config.url;
    
    const configWithOriginalEndpoint = {
        ...config,
        originalEndpoint: originalUrl
    };
    
    const apiUrl = '/api';
    
    return {
        ...configWithOriginalEndpoint,
        url: apiUrl
    };
};

export const composeAsyncInterceptors = (
    fns: Array<(config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> | InternalAxiosRequestConfig>
) => async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    let result = config;
    
    for (const fn of fns) {
        result = await fn(result);
    }
    
    return result;
};

export const requestInterceptor = async (
    config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
    try {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const processedConfig = await composeAsyncInterceptors([
            applyCommonHeaders,
            applyAuthHeaders,
            applyEndpointSpecificHeaders,
            sanitizeRequest,
            standardizeApiUrl
        ])(config);
        
        (processedConfig as any).requestId = requestId;
           
        return processedConfig;
    } catch (error) {
        logger.error('Request interceptor error:', error);
        return config;
    }
};

export const requestErrorHandler = (error: any): Promise<never> => {
    const requestId = (error.config as any)?.requestId;
    const endpoint = (error.config as any)?.originalEndpoint;
    
    logger.error(`Request failed ${requestId ? `[${requestId}]` : ''} ${endpoint ? `to ${endpoint}` : ''}:`, error);
    return Promise.reject(error);
};