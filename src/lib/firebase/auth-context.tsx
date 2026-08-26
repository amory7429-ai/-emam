// Firebase Auth Provider — manages auth state, loading, and user profile
// Handles: Google, Email/Password, Facebook (if configured)
// Lazy-initializes Firebase to prevent SSG errors

'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeFirebaseClient, firebase } from '@/lib/firebase/config';

export type AuthProviderType = 'google' | 'facebook' | 'email' | 'anonymous';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: AuthProviderType;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  firebaseReady: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInAsGuest: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    initialized: false,
    error: null,
    firebaseReady: false,
  });

  // Initialize Firebase client-side
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await initializeFirebaseClient();
        if (!cancelled) {
          setState((prev) => ({ ...prev, firebaseReady: true }));
        }
      } catch {
        if (!cancelled) {
          // Firebase not configured — run without auth
          setState((prev) => ({
            ...prev,
            loading: false,
            initialized: true,
            firebaseReady: false,
          }));
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  // Load or create user profile from Firestore
  const loadProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      const db = firebase.db;
      if (!db) {
        // Firestore not available — return basic profile
        return {
          uid: user.uid,
          displayName: user.displayName || null,
          email: user.email || null,
          photoURL: user.photoURL || null,
          provider: 'email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        const updated = { ...data, updatedAt: new Date().toISOString() };
        await setDoc(userRef, { updatedAt: updated.updatedAt }, { merge: true });
        return updated;
      }

      // Create new profile
      const providerId = user.providerData[0]?.providerId || '';
      const provider: AuthProviderType =
        providerId === 'google.com' ? 'google'
        : providerId === 'facebook.com' ? 'facebook'
        : user.isAnonymous ? 'anonymous'
        : 'email';

      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || null,
        email: user.email || null,
        photoURL: user.photoURL || null,
        provider,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    } catch {
      // Firestore may not be available — return basic profile
      return {
        uid: user.uid,
        displayName: user.displayName || null,
        email: user.email || null,
        photoURL: user.photoURL || null,
        provider: 'email',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }, []);

  // Auth state listener — only when Firebase is ready
  useEffect(() => {
    if (!state.firebaseReady) return;

    const auth = firebase.auth;
    if (!auth) {
      setState((prev) => ({
        ...prev,
        loading: false,
        initialized: true,
      }));
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          const profile = await loadProfile(user);
          setState({
            user,
            profile,
            loading: false,
            initialized: true,
            error: null,
            firebaseReady: true,
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            initialized: true,
            error: null,
            firebaseReady: true,
          });
        }
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          initialized: true,
          error: getErrorMessage(error),
          firebaseReady: true,
        }));
      }
    );

    return () => unsubscribe();
  }, [state.firebaseReady, loadProfile]);

  // Google sign-in
  const signInWithGoogle = useCallback(async (): Promise<UserCredential> => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const auth = firebase.auth;
      if (!auth) throw new Error('Firebase not configured');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      return await signInWithPopup(auth, provider);
    } catch (error: any) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Email sign-in
  const signInWithEmail = useCallback(async (email: string, password: string): Promise<UserCredential> => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const auth = firebase.auth;
      if (!auth) throw new Error('Firebase not configured');
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Email sign-up
  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<UserCredential> => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const auth = firebase.auth;
      if (!auth) throw new Error('Firebase not configured');
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Anonymous sign-in
  const signInAsGuest = useCallback(async (): Promise<UserCredential> => {
    setState((prev) => ({ ...prev, error: null }));
    try {
      const auth = firebase.auth;
      if (!auth) throw new Error('Firebase not configured');
      return await signInAnonymously(auth);
    } catch (error: any) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const auth = firebase.auth;
      if (auth) await firebaseSignOut(auth);
      setState({
        user: null,
        profile: null,
        loading: false,
        initialized: true,
        error: null,
        firebaseReady: true,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'حدث خطأ أثناء تسجيل الخروج.',
      }));
    }
  }, []);

  // Password reset
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      const auth = firebase.auth;
      if (!auth) throw new Error('Firebase not configured');
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const message = getErrorMessage(error);
      setState((prev) => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await loadProfile(state.user);
      setState((prev) => ({ ...prev, profile }));
    }
  }, [state.user, loadProfile]);

  const value: AuthContextType = {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut,
    resetPassword,
    clearError,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Map Firebase errors to Arabic messages
function getErrorMessage(error: any): string {
  const code = error?.code || '';

  switch (code) {
    case 'auth/user-not-found':
      return 'لم يتم العثور على حساب بهذا البريد الإلكتروني.';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة.';
    case 'auth/invalid-email':
      return 'البريد الإلكتروني غير صالح.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب.';
    case 'auth/email-already-in-use':
      return 'هذا البريد مرتبط بحساب موجود بالفعل.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.';
    case 'auth/popup-closed-by-user':
      return 'تم إغلاق نافذة تسجيل الدخول.';
    case 'auth/popup-blocked':
      return 'يرجى السماح بالنوافذ المنبثقة لإكمال تسجيل الدخول.';
    case 'auth/cancelled-popup-request':
      return 'تم إلغاء عملية تسجيل الدخول.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالخدمة. تحقق من الإنترنت وحاول مرة أخرى.';
    case 'auth/too-many-requests':
      return 'تم تقييد المحاولات. حاول مرة أخرى لاحقاً.';
    case 'auth/operation-not-allowed':
      return 'طريقة تسجيل الدخول هذه غير مفعّلة.';
    case 'auth/invalid-credential':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    case 'auth/requires-recent-login':
      return 'يرجى تسجيل الدخول مرة أخرى للمتابعة.';
    case 'Firebase: Error (auth/invalid-api-key).':
      return 'خدمة المصادقة غير مُعدّة. يرجى التواصل مع الإدارة.';
    default:
      if (error?.message?.includes('invalid-api-key')) {
        return 'خدمة المصادقة غير مُعدّة. يرجى التواصل مع الإدارة.';
      }
      return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  }
}
