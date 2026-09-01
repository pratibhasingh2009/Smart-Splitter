import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Coins,
  Smartphone,
  CheckCircle2,
  Users,
  QrCode,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRLoginScanner } from './QRLoginScanner';

export const LoginPage: React.FC = () => {
  const { login, setCurrentView, users } = useApp();
  const [loginMethod, setLoginMethod] = useState<'password' | 'qr'>('password');
  const [email, setEmail] = useState('pratibha@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    const success = login(email);
    if (!success) {
      setError('Invalid credentials');
    }
  };

  const handleQuickDemo = (userEmail: string) => {
    setEmail(userEmail);
    login(userEmail);
  };

  return (
    <div id="login-page" className="min-h-screen bg-[#F3F8FF] flex items-center justify-center p-4 sm:p-8 select-none">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Illustration matching mockup */}
        <div className="bg-gradient-to-br from-[#145DA0] via-[#1E88E5] to-[#2563EB] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background circles */}
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

          {/* Center SVG Illustration (Smart phone, coins, wallet matching design) */}
          <div className="my-8 flex flex-col items-center justify-center relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Phone Frame */}
              <div className="w-28 h-44 bg-blue-950 rounded-3xl border-4 border-white/40 shadow-2xl p-2 flex flex-col justify-between">
                <div className="w-8 h-1.5 bg-white/40 rounded-full mx-auto" />
                <div className="space-y-1.5 p-1 bg-blue-900/60 rounded-xl">
                  <div className="h-2 bg-emerald-400 rounded-full w-3/4" />
                  <div className="h-2 bg-white/60 rounded-full w-1/2" />
                  <div className="h-3 bg-[#F5B942] rounded-lg w-full mt-2 flex items-center justify-center text-[8px] font-black text-slate-900">
                    ₹ 1,200
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-white/40 mx-auto" />
              </div>

              {/* Floating Gold Coin 1 */}
              <div className="absolute -top-1 -right-2 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-white shadow-xl flex items-center justify-center font-black text-amber-950 text-lg animate-bounce duration-1000">
                ₹
              </div>

              {/* Floating Gold Coin 2 */}
              <div className="absolute -bottom-2 -left-2 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-xl flex items-center justify-center font-black text-amber-950 text-base">
                ₹
              </div>
            </div>

            <p className="text-center text-xs font-medium text-white/85 mt-4 max-w-xs">
              Smart automated splitting, instant QR login, and receipt OCR & attachments.
            </p>
          </div>

          {/* Quick Demo logins */}
          <div className="relative z-10 pt-4 border-t border-white/15">
            <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider block mb-2">
              ⚡ Instant 1-Click Demo Profiles:
            </span>
            <div className="flex gap-2 flex-wrap">
              {users.slice(0, 3).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemo(u.email)}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                >
                  {u.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Form matching screenshot Login Page */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Choose your preferred login method to manage shared budgets.
              </p>
            </div>

            {/* Login Method Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setLoginMethod('password'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  loginMethod === 'password'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-[#1E88E5]" />
                Email / Password
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('qr'); setError(''); }}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                  loginMethod === 'qr'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                Scan QR Code
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold animate-in fade-in">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="p-3 mb-4 rounded-xl bg-blue-50 text-[#145DA0] border border-blue-100 text-xs font-medium animate-in fade-in">
                {infoMessage}
              </div>
            )}

            {loginMethod === 'qr' ? (
              <QRLoginScanner
                onSuccess={() => {}}
                onCancel={() => setLoginMethod('password')}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="pratibha@gmail.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setInfoMessage('Demo mode: Your password is password123 or click any 1-Click Demo Profile on the left!');
                      setTimeout(() => setInfoMessage(''), 5000);
                    }}
                    className="text-xs font-bold text-[#1E88E5] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1E88E5] hover:bg-[#145DA0] text-white font-extrabold text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] mt-2"
                >
                  Login
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-600">
              Don't have an account?{' '}
              <button
                id="btn-goto-register"
                onClick={() => setCurrentView('register')}
                className="font-bold text-[#1E88E5] hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
