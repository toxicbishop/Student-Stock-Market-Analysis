import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  ConfirmationResult, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { auth, signInWithGoogle, logout } from '../firebase';

const errorMessage = (error: unknown, fallback: string) => 
  error instanceof Error ? error.message : fallback;

const errorCode = (error: unknown) => 
  typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (buttonId: string) => {
    try {
      return new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible',
        callback: () => {
          console.log('Recaptcha resolved');
        },
      });
    } catch (e) {
      console.error('Recaptcha error:', e);
      return null;
    }
  };

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setAuthError(null);
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: unknown) {
      const code = errorCode(error);
      if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
        console.warn('Sign-in popup closed before completion.');
      } else {
        console.error('Sign-in error:', error);
        setAuthError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setAuthError(null);
    try {
      setIsSigningIn(true);
      const appVerifier = setupRecaptcha('sign-in-button');
      if (!appVerifier) throw new Error('Recaptcha failed');

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
    } catch (error: unknown) {
      console.error('Phone sign-in error:', error);
      setAuthError(errorMessage(error, 'Failed to send verification code'));
      window.location.reload();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn || !confirmationResult) return;
    setAuthError(null);
    try {
      setIsSigningIn(true);
      await confirmationResult.confirm(verificationCode);
    } catch (error: unknown) {
      console.error('OTP verification error:', error);
      setAuthError('Invalid verification code. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const resetAuthMethod = (method: 'google' | 'phone') => {
    setAuthMethod(method);
    setAuthError(null);
    setConfirmationResult(null);
    setVerificationCode('');
  };

  return {
    user,
    loading,
    isSigningIn,
    authMethod,
    setAuthMethod: resetAuthMethod,
    phoneNumber,
    setPhoneNumber,
    verificationCode,
    setVerificationCode,
    confirmationResult,
    setConfirmationResult,
    authError,
    setAuthError,
    handleSignIn,
    handlePhoneSignIn,
    handleOTPVerify,
    logout,
  };
}
