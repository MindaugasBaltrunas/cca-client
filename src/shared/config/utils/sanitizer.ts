import { sanitizeObject } from 'xss-safe-display';

export const sanitizeRequestData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  const sensitiveFields = ['password', 'confirmPassword', 'passwordConfirm', 'adminPassword'];
  const sanitizedData = { ...data };
  const preservedFields: Record<string, any> = {};
  sensitiveFields.forEach(field => {
    if (data[field] !== undefined) {
      preservedFields[field] = data[field];
      delete sanitizedData[field];
    }
  });
  const result = sanitizeObject(sanitizedData);
  return { ...result, ...preservedFields };
};

export const sanitizeResponseData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  return sanitizeObject(data);
};
