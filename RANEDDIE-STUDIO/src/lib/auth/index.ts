/**
 * Authentication placeholder.
 *
 * The MVP is deliberately single-user and local: there is no sign-in, and no
 * data leaves the browser. This module defines the shape the rest of the app
 * codes against so adding a real provider (Auth.js, Clerk, Supabase) means
 * implementing `AuthProvider` and swapping `getAuthProvider()`.
 *
 * Nothing here grants access to anything — it exists so the UI has a stable
 * `useSession()`-shaped read.
 */

export interface StudioUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  plan: 'free' | 'creator' | 'pro' | 'studio'
}

export interface Session {
  user: StudioUser
  /** `local` means "no authentication is configured", not "signed out". */
  status: 'local' | 'authenticated' | 'unauthenticated'
}

export interface AuthProvider {
  readonly id: string
  getSession(): Promise<Session>
  signIn?(): Promise<void>
  signOut?(): Promise<void>
}

export const LOCAL_USER: StudioUser = {
  id: 'local-user',
  name: 'Local Studio',
  email: null,
  avatarUrl: null,
  plan: 'free',
}

class LocalAuthProvider implements AuthProvider {
  readonly id = 'local'
  async getSession(): Promise<Session> {
    return { user: LOCAL_USER, status: 'local' }
  }
}

let provider: AuthProvider = new LocalAuthProvider()

export const getAuthProvider = () => provider
export const setAuthProvider = (next: AuthProvider) => {
  provider = next
}
