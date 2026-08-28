import React from 'react';
import { TrendingUp, LogIn } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';

interface LoginViewProps {
  authMethod: 'google' | 'phone';
  setAuthMethod: (method: 'google' | 'phone') => void;
  isSigningIn: boolean;
  authError: string | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  confirmationResult: ConfirmationResult | null;
  setConfirmationResult: (result: ConfirmationResult | null) => void;
  onGoogleSignIn: () => void;
  onPhoneSignIn: (e: React.FormEvent) => void;
  onOTPVerify: (e: React.FormEvent) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  authMethod,
  setAuthMethod,
  isSigningIn,
  authError,
  phoneNumber,
  setPhoneNumber,
  verificationCode,
  setVerificationCode,
  confirmationResult,
  setConfirmationResult,
  onGoogleSignIn,
  onPhoneSignIn,
  onOTPVerify,
}) => {
  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-bg-main p-6">
      <div className="card-base p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <TrendingUp className="text-brand-primary w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-3 tracking-tight">TradeLab</h1>
        <p className="text-muted mb-8 text-sm leading-relaxed px-4">
          Practice stock market trading with virtual currency. Learn market dynamics risk-free.
        </p>

        <div className="space-y-4">
          {authError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-3 rounded-lg mb-4">
              {authError}
            </div>
          )}

          {authMethod === 'google' ? (
            <button
              onClick={onGoogleSignIn}
              disabled={isSigningIn}
              className={`btn-primary w-full flex items-center justify-center gap-3 py-3 ${
                isSigningIn ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isSigningIn ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSigningIn ? 'Connecting...' : 'Continue with Google'}
            </button>
          ) : (
            <div className="space-y-4 text-left">
              {!confirmationResult ? (
                <form onSubmit={onPhoneSignIn} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 99999 99999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-surface-hover border border-border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-sm"
                      required
                    />
                  </div>
                  <button
                    id="sign-in-button"
                    type="submit"
                    disabled={isSigningIn}
                    className="btn-primary w-full py-2.5 text-sm font-bold tracking-wide"
                  >
                    {isSigningIn ? 'Sending Code...' : 'Get OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={onOTPVerify} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full bg-surface-hover border border-border rounded-lg py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-sm text-center tracking-[0.5em] font-bold"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="btn-primary w-full py-2.5 text-sm font-bold tracking-wide"
                  >
                    {isSigningIn ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmationResult(null)}
                    className="w-full text-center text-xs text-muted hover:text-main transition-colors"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-tighter">
              <span className="bg-bg-main px-2 text-slate-500 font-bold">OR</span>
            </div>
          </div>

          <button
            onClick={() => {
              setAuthMethod(authMethod === 'google' ? 'phone' : 'google');
            }}
            className="w-full py-2.5 rounded-lg border border-border hover:bg-surface-hover transition-all text-xs font-bold text-muted flex items-center justify-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign in with {authMethod === 'google' ? 'Phone' : 'Google'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">
            Electrohack 3.0 Entry
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
