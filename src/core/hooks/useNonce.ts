import { useMemo } from 'react';

export function useNonce(length = 16): string {
  return useMemo(() => {
    const array = new Uint8Array(length);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array)
      .map(b => b.toString(36).padStart(2, '0'))
      .join('')
      .substring(0, length);
  }, [length]);
}