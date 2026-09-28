import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { translations, Language } from '../lib/i18n.ts';
import { initGoogleTranslate, switchGoogleTranslate } from '../lib/googleTranslate.ts';

export interface TraineeRegistrationData {
  full_name: string;
  phone: string;
  email?: string;
  password?: string;
  dob?: string;
  gender?: string;
  category?: string;
  district_id?: string;
  education_level?: string;
  course_name?: string;
  aadhaar_last4?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  loginAsRole: (role: UserRole) => Promise<boolean>;
  loginWithCredentials: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerTrainee: (data: TraineeRegistrationData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('skilltrace_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('skilltrace_token') || null;
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('skilltrace_lang') as Language) || 'en';
  });

  const [loading, setLoading] = useState(false);

  const role: UserRole | null = user?.role || null;
  const isAuthenticated = Boolean(user && token);

  const t = (key: keyof typeof translations['en']): string => {
    const dict = translations[language] || translations['en'];
    return (dict as any)[key] || translations['en'][key] || String(key);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('skilltrace_lang', lang);
    switchGoogleTranslate(lang);
  };

  // Initialize Google Translate on startup
  useEffect(() => {
    initGoogleTranslate(language);
  }, []);

  const loginAsRole = async (targetRole: UserRole): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('skilltrace_user', JSON.stringify(data.user));
        localStorage.setItem('skilltrace_token', data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithCredentials = async (
    email: string,
    password = 'demo123'
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('skilltrace_user', JSON.stringify(data.user));
        localStorage.setItem('skilltrace_token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (err: any) {
      console.error('Credentials login error:', err);
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const registerTrainee = async (
    data: TraineeRegistrationData
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register-trainee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setUser(resData.user);
        setToken(resData.token);
        localStorage.setItem('skilltrace_user', JSON.stringify(resData.user));
        localStorage.setItem('skilltrace_token', resData.token);
        return { success: true };
      }
      return { success: false, error: resData.error || 'Registration failed' };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err?.message || 'Network error during registration' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skilltrace_user');
    localStorage.removeItem('skilltrace_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated,
        language,
        setLanguage: handleSetLanguage,
        t,
        loginAsRole,
        loginWithCredentials,
        registerTrainee,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
