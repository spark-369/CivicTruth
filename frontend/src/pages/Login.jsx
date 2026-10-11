import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../components/shared/Toast';
import { setToken } from '../utils/auth';

function LockIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function PasswordIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function VisibilityIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function VisibilityOffIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function CheckCircleIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }

export default function Login() {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const validateForm = () => {
    const errors = {};
    if (!nationalId.trim()) errors.nationalId = 'National ID is required';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setFieldErrors({});
    try {
      const res = await authAPI.login({ national_id: nationalId, password });
      setToken(res.data.access_token);
      if (rememberMe) localStorage.setItem('remember_me', 'true');
      // Return to the originally requested page when present (e.g. after a
      // session-expiry redirect), otherwise go to the dashboard.
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/dashboard', { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({ message: typeof detail === 'string' ? detail : JSON.stringify(detail), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 bg-[length:200%_200%] animate-[gradientShift_8s_ease_infinite] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15)_0%,transparent_50%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.3)_0%,transparent_70%)] pointer-events-none animate-[float_6s_ease-in-out_infinite]" style={{ top: '-50%', right: '-20%' }} />

      <div className="relative z-10 w-full max-w-[420px] mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center min-w-[170px] px-4 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/30 text-white font-extrabold text-base mb-4 shadow-lg shadow-black/20 tracking-tight animate-[fadeIn_0.5s_ease]">
            CivicTruth
          </div>
          <h1 className="font-bold text-white text-2xl mb-2 tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Welcome back</h1>
           <p className="text-white/85 text-sm max-w-[420px] mx-auto leading-relaxed font-light">Sign in to access the CivicTruth immutable blockchain and AI verification platform</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-2xl shadow-black/10 transition-all duration-300 focus-within:border-indigo-500 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]">
          <div className="flex flex-col gap-5">
            <div>
              <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">National ID</label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 block">Enter your registered national identifier</p>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500" aria-hidden="true">
                  <LockIcon />
                </div>
                <input
                  type="text"
                  value={nationalId}
                  onChange={(e) => { setNationalId(e.target.value); setFieldErrors((prev) => ({ ...prev, nationalId: undefined })); }}
                  required
                  autoFocus
                  placeholder="Enter your national ID"
                  autoComplete="username"
                  aria-required="true"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border ${fieldErrors.nationalId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm`}
                />
              </div>
              {fieldErrors.nationalId && <p className="text-red-500 text-xs mt-1">{fieldErrors.nationalId}</p>}
            </div>
            <div>
              <label className="block font-semibold text-xs mb-1.5 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 block">Enter your account password</p>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500" aria-hidden="true">
                  <PasswordIcon />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-required="true"
                  className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white dark:bg-gray-800 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} focus:border-indigo-500 focus:border-2 outline-none transition-all text-sm`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg p-1 transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-indigo-500 no-underline hover:underline">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Don&apos;t have an account?{' '}
              <RouterLink to="/register" className="text-indigo-500 font-semibold no-underline hover:underline">Create an account</RouterLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}