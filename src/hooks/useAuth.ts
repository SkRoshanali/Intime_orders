'use client';

import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types/auth';

async function fetchMe(): Promise<User> {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  const data = await response.json();
  return data.user;
}

export function useAuth() {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isAuthenticated: !!query.data,
    error: query.error,
  };
}
