import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@realm_agent_user';

export type MockUser = {
  email: string;
  displayName: string | null;
};

type Listener = (user: MockUser | null) => void;
const listeners = new Set<Listener>();

export function subscribeToAuthChanges(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(user: MockUser | null) {
  listeners.forEach(fn => fn(user));
}

export async function register(email: string, _password: string): Promise<void> {
  const user: MockUser = { email, displayName: null };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  notify(user);
}

export async function login(email: string, _password: string): Promise<void> {
  const user: MockUser = { email, displayName: null };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  notify(user);
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
  notify(null);
}

export async function getCurrentUser(): Promise<MockUser | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as MockUser;
}

export async function updateDisplayName(displayName: string): Promise<void> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return;
  const user: MockUser = { ...(JSON.parse(raw) as MockUser), displayName };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  notify(user);
}
