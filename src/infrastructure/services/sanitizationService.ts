import { sanitizeObject, sanitizeString } from './xssGuard';

const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'passwordConfirm',
  'adminPassword'
];

const extractSensitiveValues = <T extends object>(data: T): Partial<T> => {
  return Object.keys(data).reduce((result, key) => {
    if (SENSITIVE_FIELDS.includes(key) && data[key as keyof T] !== undefined) {
      return { ...result, [key]: data[key as keyof T] };
    }
    return result;
  }, {} as Partial<T>);
};

const removeSensitiveFields = <T extends object>(data: T): T => {
  return Object.keys(data).reduce((result, key) => {
    if (SENSITIVE_FIELDS.includes(key)) {
      return { ...result, [key]: '' };
    }
    return { ...result, [key]: data[key as keyof T] };
  }, {} as T);
};

const restoreSensitiveValues = <T extends object>(
  sanitizedData: T, 
  sensitiveValues: Partial<T>
): T => {
  return { ...sanitizedData, ...sensitiveValues };
};

export const sanitizeRequestData = <T extends object>(data: T): T => {

  const sensitiveValues = extractSensitiveValues(data);

  const preparedData = removeSensitiveFields(data);

  const sanitizedData = sanitizeObject(preparedData) as T;

  return restoreSensitiveValues(sanitizedData, sensitiveValues);
};

export const sanitizeValue = (value: string): string => sanitizeString(value);

export const sanitizeValues = (values: string[]): string[] => 
  values.map(sanitizeString);

export const sanitizeFields = <T extends Record<string, any>>(
  data: T, 
  fields?: (keyof T)[]
): T => {
  const keysToSanitize = fields || Object.keys(data);
  
  return Object.keys(data).reduce((result, key) => {
    const value = data[key];
    
    if (keysToSanitize.includes(key as keyof T)) {
      if (typeof value === 'string') {
        return { ...result, [key]: sanitizeString(value) };
      }
    }
    
    return { ...result, [key]: value };
  }, {} as T);
};