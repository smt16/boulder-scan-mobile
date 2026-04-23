export type AuthProvider = 'email' | 'google' | 'auth0';

/** Persisted app session after login. */
export interface Session {
  userId: string;
  email: string;
  displayName: string;
  provider: AuthProvider;
  accessToken?: string;
}

export interface LoginResponse {
  session: Session;
}

export interface GoogleAuthRequestBody {
  idToken: string;
  email?: string;
  displayName?: string;
  googleUserId?: string;
}

export interface EmailLoginBody {
  email: string;
  password: string;
}
