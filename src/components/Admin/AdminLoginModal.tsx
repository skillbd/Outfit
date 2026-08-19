import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, LogIn, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithEmail, loginWithGoogle, isAdmin, user } = useAuth();
  const [email, setEmail] = useState('skillbd001@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        setErrorMessage('Incorrect password. Please verify the administrative password.');
      } else if (error?.code === 'auth/user-not-found') {
        setErrorMessage('No admin account found with this email. Please check your credentials.');
      } else if (error?.code === 'auth/too-many-requests') {
        setErrorMessage('Too many failed attempts. Please wait a moment and try again.');
      } else if (error?.code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Email/Password sign-in is disabled in your Firebase project. Please click "Sign In with Admin Google Account" using skillbd001@gmail.com.'
        );
      } else {
        setErrorMessage(error?.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (error: any) {
      console.error('Google login failed:', error);
      setErrorMessage(error?.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="admin-login-modal-card"
        className="bg-white w-full max-w-md rounded-3xl border border-gray-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header with Dark Badge */}
        <div className="bg-gray-950 text-white p-6 sm:p-7 relative">
          <button
            id="close-admin-login-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center mb-3 shadow-md">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Admin Authentication</h3>
          <p className="text-xs text-gray-400 mt-1">
            Secure Firebase Authentication portal for store administrators.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {user && isAdmin && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Signed in as <strong>{user.email}</strong> (Admin Verified)</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="skillbd001@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  id="admin-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              id="admin-submit-login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying with Firebase...' : 'Sign In as Admin'}</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400">
              Or Authenticate With
            </span>
            <div className="border-t border-gray-200 w-full" />
          </div>

          {/* Google Sign In Option */}
          <button
            id="admin-google-auth-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign In with Admin Google Account</span>
          </button>

          <div className="pt-2 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>End-to-End Firebase Auth • Role Verified (skillbd001@gmail.com)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
