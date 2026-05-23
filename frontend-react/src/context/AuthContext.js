import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('sil_token');
    const savedUsername = localStorage.getItem('sil_username');

    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUser({ username: savedUsername });
      // Verify token is still valid
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async ({ clearOnFailure = true } = {}) => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      if (clearOnFailure) {
        // Clear stale token
        localStorage.clear();
        setToken(null);
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(username, password);
      const { token, plan } = response.data;

      localStorage.setItem('sil_token', token);
      localStorage.setItem('sil_username', username);

      setToken(token);
      const profile = await fetchProfile({ clearOnFailure: false });
      setUser(profile || { username, plan });

      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(username, email, password);
      const { token, stream_key, rtmp_server, rtmp_stream_key, srt_ingest, srt_passphrase } = response.data;

      localStorage.setItem('sil_token', token);
      localStorage.setItem('sil_username', username);
      // Store ingest details for display
      localStorage.setItem('sil_newuser', JSON.stringify({
        username,
        stream_key,
        rtmp_server,
        rtmp_stream_key,
        srt_ingest,
        srt_passphrase,
      }));

      setToken(token);
      const profile = await fetchProfile({ clearOnFailure: false });
      setUser(profile || { username });

      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
