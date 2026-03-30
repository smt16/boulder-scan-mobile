import { useCallback, useState } from 'react';

import { postEmailLogin, type EmailLoginBody, MockHttpError } from '@/lib/http/mock-client';
import useAuthStore from '@/stores/auth.store';

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
          e instanceof MockHttpError ? e.message : e instanceof Error ? e.message : 'Sign in failed';
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
