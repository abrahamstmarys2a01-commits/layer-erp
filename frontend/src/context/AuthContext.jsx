import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('layer_erp_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState('');

  const login = async (username, password) => {
    setAuthError('');
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    try {
      // Call backend API
      const res = await api.login(trimmedUser, trimmedPass);
      if (res && res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('layer_erp_auth', JSON.stringify(res.user));
        return { success: true };
      } else {
        const errorMsg = res?.message || 'Invalid username or password.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      // If backend explicitly rejected with 401, do NOT accept
      if (err.response?.status === 401 || err.message?.includes('401') || err.message?.includes('Invalid')) {
        const errorMsg = 'Invalid username or password.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Offline fallback: ONLY check the currently active password
      const savedPassword = localStorage.getItem('layer_erp_custom_pass') || 'admin123';
      if (trimmedUser === 'admin' && trimmedPass === savedPassword) {
        const savedAuth = localStorage.getItem('layer_erp_auth');
        const parsedUser = savedAuth ? JSON.parse(savedAuth) : null;
        const sessionUser = {
          username: 'admin',
          name: parsedUser?.name || 'Senior Adv. R. Jayaraman',
          role: parsedUser?.role || 'Admin / Managing Partner',
          email: parsedUser?.email || 'admin@layererp.legal',
          mobile: parsedUser?.mobile || '9840011223',
          avatar: parsedUser?.avatar || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'
        };
        setUser(sessionUser);
        localStorage.setItem('layer_erp_auth', JSON.stringify(sessionUser));
        return { success: true };
      } else {
        const errorMsg = 'Invalid username or password.';
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('layer_erp_auth');
  };

  const updateUser = async (updatedFields) => {
    const updatedUser = { ...(user || {}), ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('layer_erp_auth', JSON.stringify(updatedUser));

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
