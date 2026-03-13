import type { Realm } from '../types/realm';

const API_BASE = __DEV__ ? 'http://localhost:4000' : 'https://your-production-url.com';

export async function fetchRealms(): Promise<Realm[]> {
  const response = await fetch(`${API_BASE}/api/realms`);
  if (!response.ok) {
    throw new Error(`Failed to fetch realms: ${response.status}`);
  }
  const data = await response.json() as { realms: Realm[] };
  return data.realms;
}
