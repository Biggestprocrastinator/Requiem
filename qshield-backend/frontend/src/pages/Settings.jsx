import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Settings() {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#81001d]">Settings</h1>
        <p className="text-sm text-[#594141] mt-1">Manage your account and security preferences</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-[#e1bebe] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0e0e0]">
          <h2 className="font-bold text-[#81001d] text-sm uppercase tracking-widest">Account</h2>
        </div>
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#81001d]/10 border border-[#81001d]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#81001d] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </div>
          <div>
            <p className="font-semibold text-[#1d1b19]">{user?.sub || 'Unknown user'}</p>
            <p className="text-xs text-[#8d7070]">Authenticated via JWT</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-[#e1bebe] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0e0e0]">
          <h2 className="font-bold text-[#81001d] text-sm uppercase tracking-widest">Security</h2>
        </div>

        <Link
          to="/2fa-setup"
          className="flex items-center justify-between px-6 py-5 hover:bg-[#fef8f3] transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#81001d]/10 border border-[#81001d]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#81001d]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield_lock
              </span>
            </div>
            <div>
              <p className="font-semibold text-[#1d1b19] text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-[#8d7070]">
                Protect your account with a time-based one-time password (TOTP) app
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#8d7070] group-hover:text-[#81001d] transition-colors">
            chevron_right
          </span>
        </Link>
      </div>

      {/* Platform info */}
      <div className="bg-white rounded-2xl border border-[#e1bebe] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f0e0e0]">
          <h2 className="font-bold text-[#81001d] text-sm uppercase tracking-widest">Platform</h2>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: 'Version', value: 'QShield v1.0' },
            { label: 'Security Standard', value: 'Quantum-Safe (PQC Ready)' },
            { label: 'Auth Method', value: 'JWT + TOTP 2FA' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-[#594141]">{label}</span>
              <span className="font-semibold text-[#1d1b19]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
