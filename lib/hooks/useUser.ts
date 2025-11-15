'use client';

import { useAuth } from '../contexts/AuthContext';

export function useUser() {
  const { user, isLoading } = useAuth();
  
  return {
    user,
    isLoading,
    tier: user?.tier,
    storiesRemaining: user?.storiesRemaining,
  };
}
