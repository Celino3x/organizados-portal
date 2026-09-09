import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  congregation: string;
  accessLevel: 'viewer' | 'support' | 'admin';
  permissions?: {
    canMakePublicTalk: boolean;
    canMakeMeetingParts: boolean;
    canManageTerritories: boolean;
    canManageDesignations: boolean;
    canManagePublishers: boolean;
    canViewReports: boolean;
  };
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const result = response.data;

      if (result.token && result.user) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        setUser(result.user);
      } else {
        throw new Error(result.message || 'Erro ao fazer login');
      }
    } catch (error: any) {
      throw new Error(
  error.response?.data?.error ||
  error.response?.data?.message ||
  'Erro ao fazer login'
);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);