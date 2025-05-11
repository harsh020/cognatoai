"use client"

import { useRouter, useSearchParams } from 'next/navigation';

export function useQueryRouter() {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const push = (path, { preserveQuery = false, additionalQuery = {} } = {}) => {
    const params = new URLSearchParams();

    if (preserveQuery) {
      currentSearchParams.forEach((value, key) => {
        params.set(key, value);
      });
    }

    Object.entries(additionalQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });

    const fullPath = params.toString() ? `${path}?${params.toString()}` : path;
    router.push(fullPath);
  };

  return push;
}
