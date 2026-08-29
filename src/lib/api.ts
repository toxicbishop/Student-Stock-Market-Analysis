/**
 * src/lib/api.ts
 * --------------
 * Shared fetch helpers that inject the Firebase ID token into every
 * authenticated API request.
 */

import { auth } from '../firebase';

/**
 * Returns `{ Authorization: 'Bearer <token>', 'Content-Type': 'application/json' }`
 * for the currently signed-in Firebase user.
 *
 * Throws if no user is authenticated so callers surface an error early
 * rather than sending unauthenticated requests.
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user — cannot build auth headers.');
  }
  const token = await user.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}
