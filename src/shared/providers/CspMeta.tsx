import { useEffect } from 'react';
import { useNonce } from '../../core/hooks/useNonce';

/**
 * Injects Content Security Policy <meta> tag and example inline script via direct DOM manipulation.
 * This manual approach avoids peer dependency issues with React 19.
 */
export const CspMeta = (): null => {
  const nonce = useNonce(16);
  const apiUrl = process.env.REACT_APP_API_BASE_URL || '';

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    `connect-src 'self' ${apiUrl}`,
    "font-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    'upgrade-insecure-requests',
    'report-uri /csp-report-endpoint',
    "child-src 'none'"
  ].join('; ');

  useEffect(() => {
    let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', directives);

    const script = document.createElement('script');
    script.setAttribute('nonce', nonce);
    script.textContent = `console.log('CSP inline script allowed with nonce');`;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [directives, nonce]);

  return null;
};
