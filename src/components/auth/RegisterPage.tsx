import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  CheckCircle2,
  Users,
  Sparkles,
  Laptop,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RegisterPage: React.FC = () => {
  const { register, setCurrentView } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions');
      return;
    }

    register(name.trim(), email.trim());
  };

  return (
    <div id="register-page" className="min-h-screen bg-[#F3F8FF] flex items-center justify-center p-4 sm:p-8 select-none">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Illustration matching mockup */}
        <div className="bg-gradient-to-br from-[#145DA0] via-[#1E88E5] to-[#2563EB] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Brand header */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#145DA0] flex items-center justify-center shadow-md font-bold">
              <Users className="w-6 h-6 text-[#145DA0]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">Personal</h1>
              <p className="text-xs font-semibold text-white/80">Budget Splitter</p>
            </div>
          </div>

          {/* Center Illustration: Woman with Laptop & Coins */}
          <div className="my-8 flex flex-col items-center justify-center relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Central avatar / person representation */}
              <div className="w-24 h-24 rounded-full bg-amber-200 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                <div className="w-20 h-20 rounded-full bg-rose-400 mt-6" />
                <div className="absolute top-2 w-10 h-6 bg-slate-900 rounded-full" />
              </div>

              {/* Floating coin 1 */}
              <div className="absolute top-2 right-2 w-12 h-12 rounded-full bg-[#F5B942] border-2 border-white shadow-lg flex items-center justify-center font-black text-slate-900 text-sm animate-bounce">
                ₹
              </div>

              {/* Floating coin 2 */}
              <div className="absolute bottom-2 left-2 w-10 h-10 rounded-full bg-[#22C55E] border-2 border-white shadow-lg flex items-center justify-center font-black text-white text-xs">
                ✓
              </div>
            </div>

            <p className="text-center text-xs font-medium text-white/90 mt-3 max-w-xs">
              Organize rent, trips, outings, and settle easily with friends in seconds.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/15 text-xs text-white/80">
            ✓ Smart Debt Simplification Algorithm included
          </div>
        </div>

        {/* Right Side: Register Form matching screenshot */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Fill in the details to get started
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Pratibha Singh"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-register-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="pratibha@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-register-password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-register-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  id="checkbox-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1E88E5] focus:ring-[#1E88E5]"
                />
                <span className="text-xs text-slate-600 font-medium">
                  I agree to the <strong className="text-[#1E88E5] underline">Terms & Conditions</strong>
                </span>
              </label>

              <button
                id="btn-submit-register"
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] mt-3"
              >
                Register
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                Or Instant Join via QR Code Scanner
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-600">
              Already have an account?{' '}
              <button
                id="btn-goto-login"
                onClick={() => setCurrentView('login')}
                className="font-bold text-[#1E88E5] hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
