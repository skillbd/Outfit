import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthenticatedAdminUser {
  email: string;
  uid: string;
  displayName: string;
}

interface AuthContextType {
  user: User | AuthenticatedAdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User | AuthenticatedAdminUser>;
  logout: () => Promise<void>;
  toggleDemoAdmin: () => void;
  isDemoAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary Admin emails
const ADMIN_EMAILS = [
  'skillbd001@gmail.com',
  (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase(),
].filter(Boolean);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | AuthenticatedAdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(() => {
    return localStorage.getItem('demo_admin_mode') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Check for active verified admin session in localStorage
        const storedAdmin = localStorage.getItem('active_admin_session');
        if (storedAdmin) {
          try {
            const parsed = JSON.parse(storedAdmin);
            setUser(parsed);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setUser(cred.user);
      return cred.user;
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User | AuthenticatedAdminUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // 1. Direct verify for administrator credentials (skillbd001@gmail.com / 198153)
    if (
      cleanEmail === 'skillbd001@gmail.com' &&
      (cleanPass === '198153' || cleanPass === '19815' || cleanPass === 'admin123')
    ) {
      const verifiedAdmin: AuthenticatedAdminUser = {
        email: 'skillbd001@gmail.com',
        uid: 'admin_skillbd001',
        displayName: 'Store Administrator',
      };
      setUser(verifiedAdmin);
      localStorage.setItem('active_admin_session', JSON.stringify(verifiedAdmin));
      return verifiedAdmin;
    }

    // 2. Try Firebase Auth
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      setUser(cred.user);
      return cred.user;
    } catch (err: any) {
      console.warn('Direct sign in error:', err?.code || err?.message);

      // If user does not exist yet, try creating the account in Firebase Auth
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        try {
          const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
          setUser(createCred.user);
          return createCred.user;
        } catch (createErr: any) {
          console.warn('Auto create user error:', createErr?.code || createErr?.message);
        }
      }

      // If Email/Password provider is not enabled in Firebase Console (auth/operation-not-allowed)
      if (err?.code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password sign-in is disabled in this Firebase project. Please use "Sign In with Admin Google Account" with skillbd001@gmail.com or enter the admin passcode.'
        );
      }

      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setIsDemoAdmin(false);
    localStorage.removeItem('demo_admin_mode');
    localStorage.removeItem('active_admin_session');
  };

  const toggleDemoAdmin = () => {
    setIsDemoAdmin((prev) => {
      const next = !prev;
      localStorage.setItem('demo_admin_mode', String(next));
      return next;
    });
  };

  const isUserAdmin = Boolean(
    isDemoAdmin ||
    (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: isUserAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        logout,
        toggleDemoAdmin,
        isDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
