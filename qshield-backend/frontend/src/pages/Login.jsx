import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRoleLabel } from '../utils/roleAccess';

const ROLE_KEYS = ['admin', 'viewer', 'auditor', 'itadmin'];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('viewer');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation before hitting the API
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password: password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Invalid email or password');
      }
      const data = await response.json();

      // If 2FA is enabled, redirect to the TOTP verification page
      if (data.requires_2fa) {
        sessionStorage.setItem('2fa_temp_token', data.temp_token);
        navigate('/2fa-verify');
        return;
      }

      login(data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fef8f3]">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-gradient-to-b from-[#6a0018] via-[#81001d] to-[#5c0014] p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Shield icon + QShield wordmark */}
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
          {/* Large decorative shield */}
          <span
            className="material-symbols-outlined text-white/10 block mb-6"
            style={{ fontSize: '140px', fontVariationSettings: "'FILL' 1" }}
          >
            security
          </span>
          <h2 className="text-2xl font-bold text-white mb-3 leading-snug">
            Defend Against<br/>
            <span className="text-[#C9A84C]">Quantum Threats</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Enterprise-grade cryptographic monitoring and quantum-safe security for your
            critical infrastructure.
          </p>
        </div>

        <p className="text-white/25 text-xs relative z-10">
          © 2025 QShield. Punjab National Bank Security Services.
        </p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-md w-full">
          {/* Mobile: show logo */}
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
            <h2 className="text-3xl font-bold text-[#81001d] tracking-tight">Welcome back</h2>
            <p className="text-[#594141] mt-2 text-sm">Sign in to your QShield account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/40 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2 animate-[fadeIn_0.2s_ease]">
              <span
                className="material-symbols-outlined text-red-500 text-base mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#594141] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-white border border-[#e1bebe] rounded-xl px-4 py-3 text-[#1d1b19] text-sm focus:outline-none focus:border-[#81001d] focus:ring-2 focus:ring-[#81001d]/20 transition-all placeholder:text-[#8d7070]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#594141] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-white border border-[#e1bebe] rounded-xl px-4 py-3 text-[#1d1b19] text-sm focus:outline-none focus:border-[#81001d] focus:ring-2 focus:ring-[#81001d]/20 transition-all placeholder:text-[#8d7070]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#594141] uppercase tracking-widest mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-[#e1bebe] rounded-xl px-4 py-3 text-[#1d1b19] text-sm focus:outline-none focus:border-[#81001d] focus:ring-2 focus:ring-[#81001d]/20 transition-all"
              >
                {ROLE_KEYS.map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {getRoleLabel(roleKey)}
                  </option>
                ))}
              </select>
              <p className="text-[10px] mt-1 text-[#8d7070] uppercase tracking-[0.2em]">
                Select the role you want to test; use the cards below to prefill credentials.
              </p>
            </div>

            <button
              id="login-submit"
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
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#594141]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#C9A84C] font-bold hover:text-[#81001d] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
