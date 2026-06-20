import { createContext, useContext, type ReactNode } from 'react';

import { useKakaoAuth } from '@/hooks/useKakaoAuth';

type AuthContextValue = ReturnType<typeof useKakaoAuth>;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useKakaoAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
