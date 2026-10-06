import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Headphones,
  AlertCircle
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initial username & password empty
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(username, password);
      setLoading(false);
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setError(res?.error || 'Invalid username or password.');
      }
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex items-center justify-center p-3 sm:p-4 selection:bg-[#0F2847] selection:text-white">
      {/* Login Card Container - Perfectly Sized & Centered */}
      <div className="w-full max-w-[360px] sm:max-w-[380px] bg-white rounded-3xl shadow-xl shadow-slate-300/30 border border-slate-200/80 p-4 sm:p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="text-center mb-3 sm:mb-4">
          {/* Golden Law Scales Emblem Logo */}
          <div className="inline-flex items-center justify-center mb-1.5 sm:mb-2">
            <img
              src={logoImg}
              alt="Layer App Logo"
              className="w-13 h-13 sm:w-16 sm:h-16 rounded-full object-contain drop-shadow-sm"
            />
          </div>

          {/* Title in Elegant Serif */}
          <h1
            className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#0F2847] leading-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
          >
            Layer App
          </h1>

          {/* Subtitle with gold accent lines */}
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-6 sm:w-9 h-[1px] bg-[#C69B34]/70"></span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] text-[#0F2847] uppercase">
              LAW &bull; DOCUMENTS &bull; JUSTICE
            </span>
            <span className="w-6 sm:w-9 h-[1px] bg-[#C69B34]/70"></span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-3.5 sm:mb-4 text-left">
          <h2 className="text-lg sm:text-[22px] font-extrabold text-[#0F2847] tracking-tight leading-snug">
            Welcome Back!
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Sign in to continue your legal work
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Username Input Field */}
          <div className="bg-white rounded-xl p-2 px-3 border border-slate-200 shadow-2xs hover:border-slate-300 focus-within:border-[#0F2847] focus-within:ring-2 focus-within:ring-[#0F2847]/10 transition-all flex items-center gap-2.5">
            {/* Left Circular User Badge */}
            <div className="w-8 h-8 rounded-full bg-[#EBF2FA] flex items-center justify-center text-[#0F2847] shrink-0">
              <User className="w-4 h-4 stroke-[1.8]" />
            </div>

            {/* Input & Label */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] sm:text-[10.5px] font-medium text-slate-500 leading-none mb-0.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="bg-white rounded-xl p-2 px-3 border border-slate-200 shadow-2xs hover:border-slate-300 focus-within:border-[#0F2847] focus-within:ring-2 focus-within:ring-[#0F2847]/10 transition-all flex items-center gap-2.5">
            {/* Left Circular Lock Badge */}
            <div className="w-8 h-8 rounded-full bg-[#EBF2FA] flex items-center justify-center text-[#0F2847] shrink-0">
              <Lock className="w-4 h-4 stroke-[1.8]" />
            </div>

            {/* Input & Label */}
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] sm:text-[10.5px] font-medium text-slate-500 leading-none mb-0.5">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Eye toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer touch-target"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-xs text-[#0F2847] font-semibold hover:text-[#0A1D33] border-b border-[#C69B34] pb-0.5 transition-colors cursor-pointer touch-target"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0F2847] hover:bg-[#0A1D33] active:bg-[#071526] text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer mt-1 touch-target"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* OR Separator */}
        <div className="relative my-3 sm:my-3.5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-2.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Need Help? Card */}
        <div
          onClick={handleQuickFill}
          className="bg-[#FDF8F0] hover:bg-[#F7EFE1] active:bg-[#EFE3CF] border border-[#EFE5D8] rounded-xl p-2.5 px-3 flex items-center justify-between cursor-pointer transition-all shadow-2xs group touch-target"
          title="Click to auto-fill default demo credentials"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F3E7D3] text-[#8C6D38] flex items-center justify-center shrink-0 shadow-2xs">
              <Headphones className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-[#0F2847] leading-tight">Need help?</h4>
              <p className="text-[10px] sm:text-[10.5px] text-slate-500">Contact your administrator.</p>
            </div>
          </div>
          <div className="text-slate-400 group-hover:text-[#0F2847] group-hover:translate-x-0.5 transition-all">
            <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
          </div>
        </div>

        {/* Auto-fill Tip */}
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] text-slate-500 hover:text-[#0F2847] transition-colors inline-flex items-center gap-1 font-medium cursor-pointer touch-target"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Quick Demo: <strong>admin</strong> / <strong>admin123</strong>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-[#EBF2FA] text-[#0F2847] flex items-center justify-center mx-auto mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Need Help Logging In?</h3>
            <p className="text-xs text-slate-600 mt-1">
              Default administrator credentials:
            </p>
            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 text-left space-y-1 border border-slate-150">
              <p>Username: <strong className="text-blue-700">admin</strong></p>
              <p>Password: <strong className="text-blue-700">admin123</strong></p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleQuickFill();
                  setShowHelpModal(false);
                }}
                className="flex-1 py-2 bg-[#0F2847] text-white rounded-lg font-semibold text-xs hover:bg-[#0A1D33] transition-colors cursor-pointer"
              >
                Auto-Fill & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
