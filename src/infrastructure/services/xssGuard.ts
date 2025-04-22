// xssGuard.ts - XSS apsaugos funkcijos

import DOMPurify from 'dompurify';

/**
 * Dezinfekuoja string tipo reikšmę
 * @param value Tekstinė reikšmė
 * @returns Dezinfekuota saugi reikšmė
 */
export const sanitizeString = (value: string): string => {
  if (!value) return value;
  
  try {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [], // Neleidžiame jokių HTML žymų
      ALLOWED_ATTR: []  // Neleidžiame jokių atributų
    });
  } catch (error) {
    console.error('XSS dezinfekcijos klaida:', error);
    
    // Jei DOMPurify nepavyksta, bandome panaudoti paprastą regex
    return value.replace(/<[^>]*>/g, '');
  }
};

/**
 * Dezinfekuoja HTML turinį, paliekant tik saugius elementus
 * @param html HTML turinys
 * @param allowedTags Leidžiamos HTML žymos
 * @returns Dezinfekuotas HTML
 */
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
    return sanitizeString(html); // Jei nesiseka, grąžiname visiškai išvalytą tekstą
  }
};

/**
 * Rekursyviai dezinfekuoja objekto savybes
 * @param obj Objektas, kurį reikia dezinfekuoti
 * @returns Dezinfekuotas objektas
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // Jeigu tai yra masyvas, dezinfekuojame kiekvieną elementą
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  // Jeigu tai objektas, dezinfekuojame kiekvieną savybę
  const sanitizedObj: Record<string, any> = {};
  
  Object.entries(obj as Record<string, any>).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Dezinfekuojame tik string tipo reikšmes
      sanitizedObj[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      // Rekursyviai dezinfekuojame objektų savybes
      sanitizedObj[key] = sanitizeObject(value);
    } else {
      // Kitus tipus paliekame nepakeistus
      sanitizedObj[key] = value;
    }
  });
  
  return sanitizedObj as unknown as T;
};

/**
 * Pakeičia HTML specialius simbolius į jų saugias versijas
 * @param text Tekstas, kuriame reikia pakeisti specialius simbolius
 * @returns Tekstas su pakeistais specialiais simboliais
 */
export const escapeHTML = (text: string): string => {
  if (!text) return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Tikriname URL adreso saugumą
 * @param url URL adresas
 * @returns Saugus URL arba # jei URL nesaugus
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '#';
  
  // Leidžiame tik http:, https: ir mailto: protokolus
  const urlPattern = /^(?:(?:https?|mailto):\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  
  // Patikriname ar URL yra tinkamas
  if (urlPattern.test(url)) {
    // Jei URL neturi protokolo, pridedame https://
    if (!url.startsWith('http') && !url.startsWith('mailto:')) {
      return `https://${url}`;
    }
    return url;
  }
  
  return '#'; // Grąžiname saugią reikšmę, jei URL potencialiai pavojingas
};

// Eksportuojame visus metodus kartu
export const xssGuard = {
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl
};