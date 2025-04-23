import DOMPurify from 'dompurify';

export const sanitizeString = (value: string): string => {
  if (!value) return value;
  
  try {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
  } catch (error) {
    console.error('XSS dezinfekcijos klaida:', error);
    
    return value.replace(/<[^>]*>/g, '');
  }
};

export const sanitizeHTML = (
  html: string, 
  allowedTags: string[] = ['b', 'i', 'u', 'p', 'span', 'br']
): string => {
  if (!html) return '';
  
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['class', 'style']
    });
  } catch (error) {
    console.error('HTML dezinfekcijos klaida:', error);
    return sanitizeString(html); 
  }
};

export const sanitizeObject = <T>(obj: T): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  const sanitizedObj: Record<string, any> = {};
  
  Object.entries(obj as Record<string, any>).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitizedObj[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitizedObj[key] = sanitizeObject(value);
    } else {
      sanitizedObj[key] = value;
    }
  });
  
  return sanitizedObj as unknown as T;
};

export const escapeHTML = (text: string): string => {
  if (!text) return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '#';
  
  const urlPattern = /^(?:(?:https?|mailto):\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  
  if (urlPattern.test(url)) {
    if (!url.startsWith('http') && !url.startsWith('mailto:')) {
      return `https://${url}`;
    }
    return url;
  }
  
  return '#'; 
};

export const xssGuard = {
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl
};