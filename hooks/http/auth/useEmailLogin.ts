import { ApiError, postEmailLogin, type EmailLoginBody } from '@/lib/http/api';
import useAuthStore from '@/stores/auth.store';
import { useCallback, useState } from 'react';

export function useEmailLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (body: EmailLoginBody) => {
      setIsLoading(true);
      setError(null);
      try {
        const { session } = await postEmailLogin(body);
        await setSession(session);
      } catch (e) {
        const message =
          e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Sign in failed';
        setError(message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [setSession]
  );

  return { login, isLoading, error, setError };
}
