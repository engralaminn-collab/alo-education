import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  const hasAuthToken = () => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.localStorage.getItem('token') ||
        window.localStorage.getItem('base44_access_token')
    );
  };

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setAuthError(null);
      if (hasAuthToken()) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, clear it
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('base44_access_token');
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      if (error.status === 401 || error.status === 403) {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('base44_access_token');
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  // ─── Login via API ────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const result = await base44.auth.login(email, password);
      if (result && result.token) {
        window.localStorage.setItem('token', result.token);
        setUser({ id: result.id, email: result.email, full_name: result.full_name, role: result.role });
        setIsAuthenticated(true);
        setAuthError(null);
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (err) {
      const msg = err.message || 'Login failed';
      return { success: false, error: msg };
    }
  };

  // ─── Register via API ─────────────────────────────────────────
  const register = async (email, password, fullName, role = 'student') => {
    try {
      const result = await base44.auth.register(email, password, fullName, role);
      if (result && result.token) {
        window.localStorage.setItem('token', result.token);
        setUser({ id: result.id, email: result.email, full_name: result.full_name, role: result.role });
        setIsAuthenticated(true);
        setAuthError(null);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      return { success: false, error: msg };
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    base44.auth.logout(shouldRedirect ? '/' : undefined);
  };

  const navigateToLogin = () => {
    if (typeof window === 'undefined') return;
    const loginUrl = new URL('/Login', window.location.origin);
    loginUrl.searchParams.set('redirect', window.location.pathname);
    window.location.href = loginUrl.toString();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      register,
      logout,
      navigateToLogin,
      checkAppState
    }}>
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
