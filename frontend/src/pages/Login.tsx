import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Ticket,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, signup, sendOtp, verifyOtp, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  // Mode: 'signin' | 'signup' | 'otp' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'signin' | 'signup' | 'otp' | 'forgot' | 'reset'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Validation
  const validateSignIn = () => {
    const errors: Record<string, string> = {};
    if (!identifier.trim()) errors.identifier = 'Email or phone number is required';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUp = () => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errors.name = 'Full name must be at least 2 characters';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Please enter a valid email address';
    if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 1. Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await login({ identifier: identifier.trim(), password });
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        referralCode: referralCode.trim() || undefined
      });
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Account registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Quick Demo Login (Aarav Sharma)
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIdentifier('aarav@brewbloom.coffee');
    setPassword('coffee123');

    try {
      await login({ identifier: 'aarav@brewbloom.coffee', password: 'coffee123' });
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Request Phone OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setFieldErrors({ phone: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await sendOtp(phone);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      setSuccessMessage('Verification code sent to your phone.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setFieldErrors({ otpCode: 'Please enter the 6-digit code' });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyOtp(phone, otpCode);
      if (res.isNewUser) {
        setMode('signup');
        setSuccessMessage('Phone verified! Please complete your member profile.');
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Forgot Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setFieldErrors({ identifier: 'Please enter your registered email or phone' });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await forgotPassword(identifier.trim());
      setSuccessMessage(res.message);
      if (res.devResetCode) {
        setDevOtpHint(res.devResetCode);
        setResetCode(res.devResetCode);
      }
      setMode('reset');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Reset Password Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      setFieldErrors({ resetCode: 'Please enter the 6-digit reset code' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setFieldErrors({ newPassword: 'New password must be at least 6 characters' });
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await resetPassword({
        identifier: identifier.trim(),
        resetCode: resetCode.trim(),
        newPassword
      });
      setSuccessMessage(res.message + ' You can now sign in.');
      setMode('signin');
      setPassword(newPassword);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social Login Mock
  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setTimeout(() => {
      // Simulate fast Google/Apple login
      handleDemoLogin();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FBF4E9] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full bg-white rounded-3xl shadow-2xl border border-[#2B1B14]/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* ─────────────────────────────────────────────────────────────
            LEFT PANEL: EDITORIAL BRAND EXPERIENCE (5 cols)
        ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 relative bg-[#1E140F] text-[#FBF4E9] p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
          {/* Background Atmosphere Image with Warm Overlay */}
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="/images/story/champions-hero-exact.png"
              alt="Artisan Barista Pour"
              className="w-full h-full object-cover mix-blend-luminosity filter brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140C08] via-[#1E140F]/80 to-transparent" />
          </div>

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#C5A880] text-[#1E140F] flex items-center justify-center font-bold shadow-md transition-transform group-hover:scale-105">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="font-serif font-black text-xl tracking-wider text-[#FBF4E9]">
                BREW &amp; BLOOM
              </span>
            </Link>
            <p className="text-xs text-[#C5A880] font-semibold uppercase tracking-widest">
              Specialty Roastery &amp; Artisan Hearth
            </p>
          </div>

          {/* Middle Value Proposition Card */}
          <div className="relative z-10 my-8 space-y-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C5A880]/20 text-[#C5A880] text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Member Privileges</span>
            </div>
            <h2 className="font-serif text-2xl font-bold leading-snug text-[#FBF4E9]">
              Crafted for Those Who Value the Pause.
            </h2>
            <ul className="text-xs text-[#FBF4E9]/80 space-y-2.5 font-sans">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#C5A880]/30 flex items-center justify-center text-[#C5A880] text-[10px]">✓</div>
                <span><strong>Flat ₹250 Off</strong> your inaugural handcrafted brew.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#C5A880]/30 flex items-center justify-center text-[#C5A880] text-[10px]">✓</div>
                <span><strong>No-cashier pickup:</strong> order ahead &amp; collect from smart shelves.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#C5A880]/30 flex items-center justify-center text-[#C5A880] text-[10px]">✓</div>
                <span><strong>Table reservation:</strong> reserve tasting lounge slots effortlessly.</span>
              </li>
            </ul>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-[#FBF4E9]/60">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <span>End-to-End Encrypted Member Portal</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT PANEL: INTERACTIVE FORM (7 cols)
        ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#FDFBF7]">
          
          {/* Tab Selector: Sign In vs Sign Up vs Phone OTP */}
          <div className="flex items-center border-b border-[#2B1B14]/10 mb-6 pb-2 gap-4">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`text-sm font-bold pb-2 transition-colors relative cursor-pointer ${
                mode === 'signin' ? 'text-[#2B1B14]' : 'text-[#2B1B14]/40 hover:text-[#2B1B14]'
              }`}
            >
              <span>Sign In</span>
              {mode === 'signin' && (
                <motion.div layoutId="authTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8C6D46]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`text-sm font-bold pb-2 transition-colors relative cursor-pointer ${
                mode === 'signup' ? 'text-[#2B1B14]' : 'text-[#2B1B14]/40 hover:text-[#2B1B14]'
              }`}
            >
              <span>Create Account</span>
              {mode === 'signup' && (
                <motion.div layoutId="authTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8C6D46]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode('otp'); setErrorMessage(null); }}
              className={`text-sm font-bold pb-2 transition-colors relative cursor-pointer ${
                mode === 'otp' ? 'text-[#2B1B14]' : 'text-[#2B1B14]/40 hover:text-[#2B1B14]'
              }`}
            >
              <span>Phone OTP</span>
              {mode === 'otp' && (
                <motion.div layoutId="authTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#8C6D46]" />
              )}
            </button>
          </div>

          {/* Quick Demo Login Pill Banner */}
          <div className="mb-6 p-3 rounded-2xl bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#2B1B14]">
              <Zap className="w-4 h-4 text-[#8C6D46] shrink-0" />
              <span><strong>Tester Quick Access:</strong> Login as demo coffee connoisseur</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              1-Click Demo
            </button>
          </div>

          {/* Alert Messages (Error or Success) */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{successMessage}</span>
              </motion.div>
            )}

            {devOtpHint && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-700" />
                  <span>Dev Environment Code: <strong>{devOtpHint}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (mode === 'otp') setOtpCode(devOtpHint);
                    if (mode === 'reset') setResetCode(devOtpHint);
                  }}
                  className="text-[11px] font-bold text-amber-800 underline"
                >
                  Auto-fill
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── MODE 1: SIGN IN FORM ── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2B1B14] mb-1.5 uppercase tracking-wider">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="aarav@brewbloom.coffee or +919876543210"
                    className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] transition-all ${
                      fieldErrors.identifier ? 'border-red-400 bg-red-50/20' : 'border-[#2B1B14]/15'
                    }`}
                  />
                </div>
                {fieldErrors.identifier && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.identifier}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#2B1B14] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMessage(null); }}
                    className="text-xs font-semibold text-[#8C6D46] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-3 bg-white rounded-xl border text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] transition-all ${
                      fieldErrors.password ? 'border-red-400 bg-red-50/20' : 'border-[#2B1B14]/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#2B1B14]/40 hover:text-[#2B1B14]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Member Portal</span>
                    <ArrowRight className="w-4 h-4 text-[#C5A880]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── MODE 2: SIGN UP FORM ── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] transition-all ${
                      fieldErrors.name ? 'border-red-400 bg-red-50/20' : 'border-[#2B1B14]/15'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] transition-all ${
                      fieldErrors.email ? 'border-red-400 bg-red-50/20' : 'border-[#2B1B14]/15'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                  Create Password (min. 6 characters)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46] transition-all ${
                      fieldErrors.password ? 'border-red-400 bg-red-50/20' : 'border-[#2B1B14]/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#2B1B14]/40 hover:text-[#2B1B14]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                    Mobile Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#2B1B14]/15 text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AARAV2026"
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-[#2B1B14]/15 text-sm text-[#2B1B14] placeholder-[#2B1B14]/30 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8C6D46] hover:bg-[#725735] text-[#FBF4E9] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#FBF4E9]" />
                    <span>Join Club &amp; Get ₹250 Voucher</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── MODE 3: PHONE OTP FLOW ── */}
          {mode === 'otp' && (
            <div className="space-y-4">
              <form onSubmit={handleSendOtp} className="space-y-2">
                <label className="block text-xs font-bold text-[#2B1B14] uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-[#2B1B14]/15 text-sm text-[#2B1B14] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-3 rounded-xl bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    Send OTP
                  </button>
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] text-red-600 font-medium">{fieldErrors.phone}</p>
                )}
              </form>

              {successMessage && (
                <form onSubmit={handleVerifyOtp} className="space-y-3 pt-2 border-t border-[#2B1B14]/10">
                  <label className="block text-xs font-bold text-[#2B1B14] uppercase tracking-wider">
                    Enter 6-digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-lg font-mono font-bold py-3 bg-white rounded-xl border border-[#2B1B14]/15 text-[#2B1B14] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                  {fieldErrors.otpCode && (
                    <p className="text-[11px] text-red-600 font-medium">{fieldErrors.otpCode}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8C6D46] text-[#FBF4E9] hover:bg-[#725735] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enter Portal'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── MODE 4: FORGOT PASSWORD ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B1B14] mb-1">Reset Your Password</h3>
                <p className="text-xs text-[#2B1B14]/70 mb-3">
                  Enter your registered email address or phone number. We will generate a secure 6-digit verification code.
                </p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="aarav@brewbloom.coffee"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-[#2B1B14]/15 text-sm text-[#2B1B14] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                </div>
                {fieldErrors.identifier && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{fieldErrors.identifier}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#2B1B14] hover:bg-[#3D281D] text-[#FBF4E9] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? 'Processing...' : 'Request Reset Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMessage(null); }}
                  className="text-xs font-semibold text-[#8C6D46] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ── MODE 5: ENTER RESET CODE & NEW PASSWORD ── */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2B1B14] mb-1">Set New Password</h3>
                <p className="text-xs text-[#2B1B14]/70 mb-3">
                  Enter the 6-digit verification code and your new password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono font-bold py-2.5 bg-white rounded-xl border border-[#2B1B14]/15 text-[#2B1B14] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                />
                {fieldErrors.resetCode && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{fieldErrors.resetCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2B1B14] mb-1 uppercase tracking-wider">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#2B1B14]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-[#2B1B14]/15 text-sm text-[#2B1B14] focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#2B1B14]/40 hover:text-[#2B1B14]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.newPassword && (
                  <p className="text-[11px] text-red-600 mt-0.5 font-medium">{fieldErrors.newPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#8C6D46] hover:bg-[#725735] text-[#FBF4E9] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}

          {/* Social Logins Divider & Buttons */}
          <div className="mt-6 pt-6 border-t border-[#2B1B14]/10">
            <div className="relative flex justify-center text-xs uppercase mb-4">
              <span className="bg-[#FDFBF7] px-2 text-[#2B1B14]/50 font-semibold tracking-wider">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#2B1B14]/15 bg-white hover:bg-[#FAF4EB] text-xs font-bold text-[#2B1B14] transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#2B1B14]/15 bg-white hover:bg-[#FAF4EB] text-xs font-bold text-[#2B1B14] transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.67-.82 1.13-1.96 1-3.1-.97.04-2.16.65-2.85 1.47-.61.71-1.14 1.88-.99 2.99 1.09.08 2.2-.56 2.84-1.36z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
