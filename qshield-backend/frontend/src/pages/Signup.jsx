import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const validate = () => {
    const newErrors = {};
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (getPasswordStrength(password) < 3) {
      newErrors.password =
        'Password must be at least 8 characters and include uppercase, a number, and a symbol.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      // Step 1: Register
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Registration failed. Please try again.');
      }

      // Step 2: Auto-login
      const loginResponse = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password: password }),
      });
      if (!loginResponse.ok) throw new Error('Account created but login failed. Please sign in manually.');
      const loginData = await loginResponse.json();
      login(loginData.access_token);
      navigate('/');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fef8f3]">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-gradient-to-b from-[#6a0018] via-[#81001d] to-[#5c0014] p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background grid */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#C9A84C] text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">QShield</h1>
              <p className="text-[10px] text-[#C9A84C] font-semibold tracking-[0.18em] uppercase">
                Quantum-Safe Security Platform
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <span
            className="material-symbols-outlined text-white/10 block mb-6"
            style={{ fontSize: '140px', fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
            Start Securing<br/>
            <span className="text-[#C9A84C]">Your Infrastructure</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Create your QShield account to access the quantum-safe security command center
            and start monitoring your critical assets.
          </p>
        </div>

        <p className="text-white/25 text-xs relative z-10">
          © 2025 QShield. Punjab National Bank Security Services.
        </p>
      </div>

      {/* Right signup form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span
              className="material-symbols-outlined text-[#81001d] text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span className="text-lg font-bold text-[#81001d]">QShield</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#81001d] tracking-tight">Create account</h2>
            <p className="text-[#594141] mt-2 text-sm">
              Join QShield to start monitoring your assets
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-400/40 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
              <span
                className="material-symbols-outlined text-red-500 text-base mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#594141] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                className={`w-full bg-white border rounded-xl px-4 py-3 text-[#1d1b19] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#8d7070] ${
                  errors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                    : 'border-[#e1bebe] focus:border-[#81001d] focus:ring-[#81001d]/20'
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#594141] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                className={`w-full bg-white border rounded-xl px-4 py-3 text-[#1d1b19] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#8d7070] ${
                  errors.password
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                    : 'border-[#e1bebe] focus:border-[#81001d] focus:ring-[#81001d]/20'
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
              />
              <PasswordStrengthMeter password={password} />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#594141] uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <input
                id="signup-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                className={`w-full bg-white border rounded-xl px-4 py-3 text-[#1d1b19] text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-[#8d7070] ${
                  errors.confirmPassword
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                    : confirmPassword && confirmPassword === password
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-400/20'
                    : 'border-[#e1bebe] focus:border-[#81001d] focus:ring-[#81001d]/20'
                }`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Passwords match
                </p>
              )}
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#81001d] to-[#a51c30] hover:from-[#6a0018] hover:to-[#8e1829] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-[#81001d]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#594141]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C9A84C] font-bold hover:text-[#81001d] transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
