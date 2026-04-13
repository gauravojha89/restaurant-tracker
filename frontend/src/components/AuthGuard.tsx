import { useEffect, useState } from 'react';

// Allowlisted identities — GitHub usernames or Microsoft emails
const ALLOWED_USERS = ['gauravojha89', 'poojapandey90', 'gauravojha@hotmail.com', 'saloni-jain'];

interface AuthUser {
  userDetails: string; // GitHub username
  identityProvider: string;
}

interface AuthResponse {
  clientPrincipal: AuthUser | null;
}

type AuthState = 'loading' | 'unauthorized' | 'forbidden' | 'authorized';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetch('/.auth/me')
      .then((r) => r.json() as Promise<AuthResponse>)
      .then(({ clientPrincipal }) => {
        if (!clientPrincipal) {
          setAuthState('unauthorized');
          return;
        }
        const name = clientPrincipal.userDetails;
        setUsername(name);
        setAuthState(ALLOWED_USERS.includes(name) ? 'authorized' : 'forbidden');
      })
      .catch(() => setAuthState('unauthorized'));
  }, []);

  if (authState === 'loading') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-gray-500 text-sm">Loading WishBite…</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-sm w-full mx-4">
          <div className="text-5xl mb-4">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Wish<span className="text-primary-500">Bite</span>
          </h1>
          <p className="text-gray-500 text-sm mb-6">Your personal restaurant journal</p>
          <div className="flex flex-col gap-3">
            <a
              href="/.auth/login/github?post_login_redirect_uri=/"
              className="flex items-center justify-center gap-3 w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Sign in with GitHub
            </a>
            <a
              href="/.auth/login/aad?post_login_redirect_uri=/"
              className="flex items-center justify-center gap-3 w-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 23 23"><path d="M0 0h11v11H0zm12 0h11v11H12zM0 12h11v11H0zm12 0h11v11H12z"/></svg>
              Sign in with Microsoft
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'forbidden') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-sm w-full mx-4">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            <span className="font-medium text-gray-700">@{username}</span> is not on the guest list.
          </p>
          <a
            href="/.auth/logout"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors text-center"
          >
            Sign out
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
