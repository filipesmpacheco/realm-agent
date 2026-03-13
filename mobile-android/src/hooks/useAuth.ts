import { useEffect, useState } from 'react';
import { getCurrentUser, subscribeToAuthChanges, type MockUser } from '../services/auth';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: MockUser };

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    getCurrentUser().then(user => {
      setState(user ? { status: 'authenticated', user } : { status: 'unauthenticated' });
    });

    const unsubscribe = subscribeToAuthChanges(user => {
      setState(user ? { status: 'authenticated', user } : { status: 'unauthenticated' });
    });

    return unsubscribe;
  }, []);

  return state;
}
