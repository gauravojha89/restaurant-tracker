import { useEffect, useState } from 'react';

// Allowlisted GitHub usernames — add wife's username here when ready
const ALLOWED_USERS = ['gauravojha89'];

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
          <a
            href="/.auth/login/github?post_login_redirect_uri=/"
            className="block w-full bg-gray-900 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-colors text-center"
          >
            Sign in with GitHub
          </a>
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
