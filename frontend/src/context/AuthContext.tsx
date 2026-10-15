import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  referral_code: string;
  membership_tier: 'BLUE' | 'SILVER' | 'GOLD';
  loyalty_points: number;
  activeVouchersCount?: number;
}

export interface StaffUser {
  id: string;
  username: string;
  role: 'BARISTA' | 'STORE_MANAGER' | 'ADMIN';
  storeId?: string;
}

interface AuthContextType {
  user: User | null;
  staffUser: StaffUser | null;
  isAuthenticated: boolean;
  isStaffAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authPromptReason: string | null;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  welcomeVoucher: boolean;
  closeWelcomeVoucher: () => void;
  sendOtp: (phone: string, isDemo?: boolean) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>;
  register: (data: { phone: string; name: string; email?: string; referralCode?: string }) => Promise<void>;
  login: (credentials: { identifier: string; password: string }) => Promise<{ success: boolean; user: User }>;
  signup: (data: { name: string; email: string; password: string; phone?: string; referralCode?: string }) => Promise<{ success: boolean; user: User }>;
  forgotPassword: (identifier: string) => Promise<{ success: boolean; message: string; devResetCode?: string }>;
  resetPassword: (data: { identifier: string; resetCode: string; newPassword: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  staffLogin: (username: string, passwordPlain: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem('bb_staff_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [welcomeVoucher, setWelcomeVoucher] = useState(false);

  const openAuthModal = (reason?: string) => {
    setAuthPromptReason(reason || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  const sendOtp = async (phone: string, isDemo?: boolean) => {
    return await api.sendOtp(phone, isDemo);
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const res = await api.verifyOtp(phone, otp);
    if (!res.isNewUser && res.token) {
      localStorage.setItem('bb_session_token', res.token);
      await refreshUser();
      setIsAuthModalOpen(false);
    }
    return { isNewUser: res.isNewUser };
  };

  const register = async (data: { phone: string; name: string; email?: string; referralCode?: string }) => {
    const res = await api.register(data);
    if (res.token) {
      localStorage.setItem('bb_session_token', res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      setWelcomeVoucher(true); // Pop welcome voucher celebratory screen!
    }
  };

  const login = async (credentials: { identifier: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.token && res.user) {
      localStorage.setItem('bb_session_token', res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      return { success: true, user: res.user };
    }
    throw new Error(res.message || 'Login failed.');
  };

  const signup = async (data: { name: string; email: string; password: string; phone?: string; referralCode?: string }) => {
    const res = await api.signup(data);
    if (res.token && res.user) {
      localStorage.setItem('bb_session_token', res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
      setWelcomeVoucher(true);
      return { success: true, user: res.user };
    }
    throw new Error(res.message || 'Signup failed.');
  };

  const forgotPassword = async (identifier: string) => {
    return await api.forgotPassword(identifier);
  };

  const resetPassword = async (data: { identifier: string; resetCode: string; newPassword: string }) => {
    return await api.resetPassword(data);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    }
    localStorage.removeItem('bb_session_token');
    localStorage.removeItem('bb_staff_user');
    setUser(null);
    setStaffUser(null);
  };

  const staffLogin = async (username: string, passwordPlain: string) => {
    const res = await api.staffLogin({ username, password: passwordPlain });
    if (res.token && res.staff) {
      localStorage.setItem('bb_session_token', res.token);
      localStorage.setItem('bb_staff_user', JSON.stringify(res.staff));
      setStaffUser(res.staff);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
    } catch {}
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        staffUser,
        isAuthenticated: !!user,
        isStaffAuthenticated: !!staffUser,
        isLoading,
        isAuthModalOpen,
        authPromptReason,
        openAuthModal,
        closeAuthModal: () => {
          setIsAuthModalOpen(false);
          setAuthPromptReason(null);
        },
        welcomeVoucher,
        closeWelcomeVoucher: () => setWelcomeVoucher(false),
        sendOtp,
        verifyOtp,
        register,
        login,
        signup,
        forgotPassword,
        resetPassword,
        logout,
        deleteAccount,
        staffLogin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
