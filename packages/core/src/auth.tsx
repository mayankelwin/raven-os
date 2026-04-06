import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNexusCollection } from './nexus';
import { RavenCrypt } from './nexus/crypto';
import { RavenStorage } from './storage';

/**
 * Auth Symmetry (V34)
 * Unified Identity Engine for Raven-Os.
 */

interface RavenUser {
  id: string;
  email: string;
  name?: string;
  lastLogin: number;
}

interface AuthState {
  user: RavenUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const RavenAuthContext = createContext<{
  state: AuthState;
  signUp: (email: string, pass: string, name?: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

export const RavenAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  const { data: users, add: addUser } = useNexusCollection<any>('users');

  // 1. Session Recovery
  useEffect(() => {
    const restore = async () => {
      const saved = await RavenStorage.get<RavenUser>('raven_session');
      if (saved) {
        setState({ user: saved, isAuthenticated: true, loading: false });
      } else {
        setState((prev: AuthState) => ({ ...prev, loading: false }));
      }
    };
    restore();
  }, []);

  // 2. Sign Up (with E2EE Hashing)
  const signUp = useCallback(async (email: string, pass: string, name?: string) => {
    const key = await RavenCrypt.deriveKey(pass);
    const passHash = await RavenCrypt.encrypt({ pass, salt: 'raven-auth' }, key);
    
    const newUser = {
      email,
      name: name || email.split('@')[0],
      passHash, // In production, we'd store a different derivative
      lastLogin: Date.now()
    };

    addUser(newUser);
    
    // Auto-login
    const userWithId = { ...newUser, id: Math.random().toString() };
    await RavenStorage.set('raven_session', userWithId);
    setState({ user: userWithId as any, isAuthenticated: true, loading: false });
  }, [addUser]);

  // 3. Sign In (Verification Logic)
  const signIn = useCallback(async (email: string, pass: string) => {
    const found = users.find(u => u.email === email);
    if (!found) throw new Error('User not found.');

    const key = await RavenCrypt.deriveKey(pass);
    try {
      // If we can decrypt the hash with the provided pass, it's correct
      await RavenCrypt.decrypt(found.passHash, key);
      
      const sessionUser = { ...found, lastLogin: Date.now() };
      await RavenStorage.set('raven_session', sessionUser);
      setState({ user: sessionUser, isAuthenticated: true, loading: false });
    } catch (e) {
      throw new Error('Invalid credentials.');
    }
  }, [users]);

  // 4. Sign Out
  const signOut = useCallback(async () => {
    await RavenStorage.remove('raven_session');
    setState({ user: null, isAuthenticated: false, loading: false });
  }, []);

  return (
    <RavenAuthContext.Provider value={{ state, signUp, signIn, signOut }}>
      {children}
    </RavenAuthContext.Provider>
  );
};

export const useRavenAuth = () => {
  const ctx = useContext(RavenAuthContext);
  if (!ctx) throw new Error('useRavenAuth must be used within RavenAuthProvider');
  return ctx;
};
