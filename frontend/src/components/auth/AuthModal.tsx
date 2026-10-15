import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Ticket,
  Coffee,
  Check,
  Zap,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authPromptReason,
    sendOtp,
    verifyOtp,
    register,
    welcomeVoucher,
    closeWelcomeVoucher,
  } = useAuth();

  const { pendingCartItem } = useCart();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'REGISTER'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Check URL params for referral code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref.toUpperCase());
  }, []);

  // Reset state on open/close
  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('PHONE');
      setOtp(['', '', '', '', '', '']);
      setErrorMessage(null);
      setDevOtpHint(null);
    }
  }, [isAuthModalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const isDemo = phone.endsWith('9876543210');
      const res = await sendOtp(phone, isDemo);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      setStep('OTP');
      setCooldown(60);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await verifyOtp(phone, otpCode);
      if (res.isNewUser) {
        setStep('REGISTER');
      } else {
        // Successfully logged in!
        setStep('PHONE');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const demoPhone = '9876543210';
      setPhone(demoPhone);
      const res = await sendOtp(demoPhone, true);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
        const chars = res.devOtp.split('');
        setOtp(chars);
        // Instant verification for seamless test flow
        const verifyRes = await verifyOtp(demoPhone, res.devOtp);
        if (verifyRes.isNewUser) {
          setName('Demo Coffee Connoisseur');
          setStep('REGISTER');
        } else {
          setStep('PHONE');
        }
      } else {
        setStep('OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please accept the terms of service.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await register({
        phone,
        name: name.trim(),
        email: email.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
      });
      setStep('PHONE');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <>
      {/* ── Welcome First Cup Voucher Pop-up ── */}
      <AnimatePresence>
        {welcomeVoucher && (
          <div 
            onClick={closeWelcomeVoucher}
            className="fixed inset-0 z-[100] overflow-y-auto p-4 bg-black/80 backdrop-blur-md flex items-center justify-center min-h-screen"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#2A2723] text-[#FBF4E9] rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-[#C5A880]/30 shadow-2xl relative text-center overflow-hidden my-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#E28544] to-[#C5A880]" />

              <div className="w-14 h-14 mx-auto mb-3.5 rounded-full bg-[#C5A880]/20 flex items-center justify-center text-[#C5A880]">
                <Sparkles className="w-7 h-7" />
              </div>

              <h3 className="font-serif text-2xl font-bold tracking-wide mb-1.5 text-[#FBF4E9]">
                Welcome to the Club!
              </h3>
              <p className="text-xs text-[#FBF4E9]/70 mb-5">
                Your new-member gift is active in your rewards wallet.
              </p>

              <div className="bg-[#1C1A17] p-3.5 rounded-2xl border border-[#C5A880]/40 flex items-center gap-3 mb-5 text-left">
                <div className="p-2.5 rounded-xl bg-[#C5A880]/15 text-[#C5A880]">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#E28544]">
                    New Member Reward
                  </span>
                  <h4 className="font-bold text-sm text-[#FBF4E9]">First Cup On Us (Flat ₹250 Off)</h4>
                  <p className="text-[11px] text-[#FBF4E9]/60">Valid on any handcrafted beverage.</p>
                </div>
              </div>

              <button
                onClick={closeWelcomeVoucher}
                className="w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#C5A880] text-[#1C1A17] hover:bg-[#B3956F] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Claim & View Bag</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Authentication Modal ── */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div 
            onClick={closeAuthModal}
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center min-h-screen"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-[430px] my-auto bg-[#FDFBF7] text-[#241711] rounded-[24px] shadow-[0_24px_60px_rgba(20,10,5,0.45)] border border-[#2B1B14]/12 flex flex-col max-h-[min(92vh,720px)] overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#E28544] to-[#8C6D46] z-20" />

              {/* ── Fixed Modal Header ── */}
              <div className="flex items-center justify-between px-5 sm:px-6 pt-4 pb-2 border-b border-[#2A2723]/8 bg-[#FDFBF7] shrink-0 z-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#2A2723] text-white flex items-center justify-center shadow-xs">
                    <Coffee className="w-3.5 h-3.5 text-[#C5A880]" />
                  </div>
                  <span className="font-serif font-black text-xs tracking-wider uppercase text-[#2A2723]">
                    Brew &amp; Bloom Club
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeAuthModal();
                  }}
                  className="w-9 h-9 rounded-full bg-[#2A2723]/10 hover:bg-[#2A2723]/20 active:scale-90 text-[#2A2723] flex items-center justify-center transition-all cursor-pointer shadow-xs z-30"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* ── Scrollable Modal Body (Guarantees 100% visibility on all screens) ── */}
              <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-3.5 custom-scrollbar flex-1">

                {/* ── Queued Drink Ticket (When User Clicked Add-to-Cart) ── */}
                {pendingCartItem && (
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-[#24150E] to-[#1C100A] text-white border border-[#C5A880]/35 shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={pendingCartItem.product.image}
                        alt={pendingCartItem.product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-[#3D2517] shrink-0 border border-[#C5A880]/30 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] uppercase font-black tracking-wider text-[#E28544] px-1.5 py-0.5 rounded bg-[#E28544]/20 border border-[#E28544]/30">
                            Queued for Bag
                          </span>
                          <span className="text-xs font-serif font-bold text-[#C5A880]">
                            ₹{pendingCartItem.product.price}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#FBF4E9] truncate mt-0.5">
                          {pendingCartItem.product.name}
                        </h4>
                        <p className="text-[10.5px] text-[#FBF4E9]/70 truncate">
                          {pendingCartItem.customization?.size || 'Standard'} •{' '}
                          {pendingCartItem.customization?.milk || 'Default'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[10.5px] text-[#C5A880]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-[#E28544]" />
                      <span>Auto-saves to your bag the instant you log in!</span>
                    </div>
                  </div>
                )}

                {/* ── Segmented Tab Switcher: Sign In vs Create Account ── */}
                {step === 'PHONE' && (
                  <div className="flex bg-[#EFE4D4]/80 p-1 rounded-xl text-xs font-bold border border-[#2A2723]/5">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        authMode === 'signin'
                          ? 'bg-[#2A2723] text-[#FBF4E9] shadow-sm'
                          : 'text-[#6D4C3D] hover:text-[#2A2723]'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        authMode === 'signup'
                          ? 'bg-[#2A2723] text-[#FBF4E9] shadow-sm'
                          : 'text-[#6D4C3D] hover:text-[#2A2723]'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* ── Section Title & Subtitle ── */}
                <div>
                  <h3 className="font-serif text-xl sm:text-[22px] font-bold text-[#2A2723] leading-snug">
                    {step === 'PHONE' && (authMode === 'signin' ? 'Sign in to Order Ahead' : 'Create Your Coffee Account')}
                    {step === 'OTP' && 'Verify Mobile OTP'}
                    {step === 'REGISTER' && 'Complete Your Profile'}
                  </h3>
                  <p className="text-xs text-[#2A2723]/70 mt-0.5 leading-relaxed">
                    {step === 'PHONE' &&
                      (authMode === 'signin'
                        ? 'Track barista preparation live and skip the in-store queue.'
                        : 'Join today and get a ₹250 free voucher on your first handcrafted cup.')}
                    {step === 'OTP' && `Enter the 6-digit verification code sent to ${phone}.`}
                    {step === 'REGISTER' && 'Just a few details to finalize your profile and voucher.'}
                  </p>
                </div>

                {/* ── General Intent Callout (If no pending item, but reason passed) ── */}
                {!pendingCartItem && authPromptReason && (
                  <div className="p-2.5 rounded-xl bg-[#0F4C81]/10 border border-[#0F4C81]/20 flex items-center gap-2 text-xs text-[#0F4C81] font-semibold">
                    <Coffee className="w-4 h-4 shrink-0 text-[#0F4C81]" />
                    <span>{authPromptReason}</span>
                  </div>
                )}

                {/* ── First Cup Perk Highlight Banner ── */}
                {step === 'PHONE' && (
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FAF0E1] to-[#F5E2C8] border border-[#C5A880]/40 flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#8C6D46] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Ticket className="w-4 h-4 text-amber-200" />
                      </div>
                      <div>
                        <span className="font-bold text-[#2A2723] block leading-tight">First Cup ₹250 Off Voucher</span>
                        <span className="text-[10px] text-[#8C6D46]">Auto-credited upon mobile verification</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#8C6D46] uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-[#C5A880]/30 shadow-xs">
                      FREE
                    </span>
                  </div>
                )}

                {/* ── Dev OTP Hint & Auto-fill Pill ── */}
                {devOtpHint && (
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-between text-xs text-amber-950 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <strong>Dev OTP:</strong> {devOtpHint}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = devOtpHint.split('');
                        setOtp(chars);
                      }}
                      className="font-bold underline text-amber-900 text-[11px] hover:text-black cursor-pointer"
                    >
                      1-Tap Fill
                    </button>
                  </div>
                )}

                {/* ── Error Banner ── */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center justify-between gap-2">
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="text-red-500 hover:text-red-800 text-sm font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* ── STEP 1: Phone Input ── */}
                {step === 'PHONE' && (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-1">
                        Mobile Number
                      </label>
                      <div className="flex items-center bg-white rounded-xl border border-[#2A2723]/20 focus-within:border-[#8C6D46] focus-within:ring-2 focus-within:ring-[#C5A880]/30 transition-all overflow-hidden px-3 py-2">
                        <span className="text-sm font-bold text-[#2A2723]/60 pr-2 border-r border-[#2A2723]/15">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-3 text-base font-semibold text-[#2A2723] focus:outline-none placeholder:text-[#2A2723]/35"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isLoading ? 'Sending Code...' : 'Send Verification OTP'}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* 1-Tap Quick Demo Test Button */}
                    <button
                      type="button"
                      onClick={handleQuickDemoLogin}
                      disabled={isLoading}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#EFE4D4] hover:bg-[#E4D4C0] text-[#5A3B2E] transition-all flex items-center justify-center gap-2 border border-[#C5A880]/40 cursor-pointer active:scale-98 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#C08A4E] fill-current" />
                      <span>Quick Demo Test Login (1-Tap Auto-Sign)</span>
                    </button>

                    <p className="text-[10px] text-center text-[#2A2723]/60 pt-0.5">
                      By continuing, you agree to Brew & Bloom terms of service and order privacy.
                    </p>
                  </form>
                )}

                {/* ── STEP 2: 6-Digit OTP Verification ── */}
                {step === 'OTP' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                    <div className="flex justify-between gap-1.5 sm:gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 sm:w-12 h-13 text-center text-xl font-bold rounded-xl bg-white border border-[#2A2723]/25 focus:border-[#8C6D46] focus:ring-2 focus:ring-[#C5A880]/40 outline-none text-[#2A2723]"
                          autoFocus={idx === 0}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.join('').length !== 6}
                      className="w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] disabled:opacity-50 transition-all shadow-md cursor-pointer active:scale-98"
                    >
                      {isLoading ? 'Verifying Code...' : 'Confirm & Proceed'}
                    </button>

                    <div className="flex items-center justify-between text-xs text-[#2A2723]/70 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setStep('PHONE')}
                        className="hover:underline cursor-pointer"
                      >
                        Change Number
                      </button>
                      {cooldown > 0 ? (
                        <span className="text-[#8C6D46] font-medium">Resend in {cooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-[#8C6D46] font-bold hover:underline cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {/* ── STEP 3: Complete Profile & Registration ── */}
                {step === 'REGISTER' && (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="block text-[10.5px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#2A2723]/20 focus:border-[#8C6D46] focus:ring-2 focus:ring-[#C5A880]/30 outline-none text-sm text-[#2A2723]"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="priya@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#2A2723]/20 focus:border-[#8C6D46] focus:ring-2 focus:ring-[#C5A880]/30 outline-none text-sm text-[#2A2723]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold text-[#2A2723]/80 uppercase tracking-wider mb-1">
                        Referral Code (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BLOOM50"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#2A2723]/20 focus:border-[#8C6D46] focus:ring-2 focus:ring-[#C5A880]/30 outline-none text-sm text-[#2A2723] uppercase"
                      />
                    </div>

                    <label className="flex items-start gap-2 pt-0.5 text-xs text-[#2A2723]/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-[#8C6D46] focus:ring-[#C5A880]"
                      />
                      <span className="text-[11px]">I agree to receive order notifications and terms.</span>
                    </label>

                    <button
                      type="submit"
                      disabled={isLoading || !name.trim()}
                      className="w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#2A2723] text-[#FBF4E9] hover:bg-[#3D3833] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      {isLoading ? 'Creating Account...' : 'Complete & Unlock First Cup Voucher'}
                      <Sparkles className="w-4 h-4 text-[#C5A880]" />
                    </button>
                  </form>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
