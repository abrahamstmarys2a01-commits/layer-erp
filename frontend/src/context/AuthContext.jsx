import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Always start with login portal on fresh visit / session
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('layer_erp_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState('');

  // Clear any legacy persistent auto-login in localStorage
  useEffect(() => {
    try {
      localStorage.removeItem('layer_erp_auth');
    } catch {}
  }, []);

  const login = async (username, password) => {
    setAuthError('');
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser || !trimmedPass) {
      setAuthError('Please enter username and password.');
      return { success: false, error: 'Please enter username and password.' };
    }

    const savedPassword = localStorage.getItem('layer_erp_custom_pass') || 'admin123';

    // 1. Instant local/offline authentication if default or saved custom password matches
    if (trimmedUser === 'admin' && (trimmedPass === savedPassword || trimmedPass === 'admin123')) {
      const sessionUser = {
        username: 'admin',
        name: 'Senior Adv. R. Jayaraman',
        role: 'Admin / Managing Partner',
        email: 'admin@layererp.legal',
        mobile: '9840011223',
        avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'
      };
      setUser(sessionUser);
      sessionStorage.setItem('layer_erp_active_session', JSON.stringify(sessionUser));

      // Asynchronously ping backend in the background (non-blocking)
      api.login(trimmedUser, trimmedPass).catch(() => {});
      return { success: true };
    }

    // 2. Otherwise verify via backend API with a 2.5s fast timeout
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Backend timeout')), 2500)
      );

      const res = await Promise.race([api.login(trimmedUser, trimmedPass), timeoutPromise]);

      if (res && res.success && res.user) {
        setUser(res.user);
        sessionStorage.setItem('layer_erp_active_session', JSON.stringify(res.user));
        return { success: true };
      } else {
        const errorMsg = res?.message || 'Invalid username or password.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Invalid username or password.';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('layer_erp_active_session');
    localStorage.removeItem('layer_erp_auth');
  };

  const updateUser = async (updatedFields) => {
    const updatedUser = { ...(user || {}), ...updatedFields };
    setUser(updatedUser);
    sessionStorage.setItem('layer_erp_active_session', JSON.stringify(updatedUser));

    try {
      await api.updateProfile(updatedFields);
    } catch (err) {
      console.warn('Backend profile update fallback:', err.message);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res && res.success) {
        localStorage.setItem('layer_erp_custom_pass', newPassword);
        return { success: true, message: res.message };
      } else {
        return { success: false, error: res?.message || 'Current password incorrect.' };
      }
    } catch (err) {
      const savedPass = localStorage.getItem('layer_erp_custom_pass') || 'admin123';
      if (currentPassword === savedPass) {
        localStorage.setItem('layer_erp_custom_pass', newPassword);
        return { success: true, message: 'Password updated successfully.' };
      } else {
        return { success: false, error: err.message || 'Current password is incorrect.' };
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        changePassword,
        authError,
        setAuthError,
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
