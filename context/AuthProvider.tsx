import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { authAPI } from '../services/api';

interface User {
  isAuthenticated: boolean;
  token: string;
  id: string;
  role: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; role?: string; message?: string }>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string; phone: string }) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
  checkTokenExpiration: () => Promise<boolean>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
  [key: string]: any;
}

interface LoginResponse {
  token: string;
  user: {
    name: string;
    email: string;
  };
}

interface RegisterResponse {
  message: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      // En React Native no necesitamos redireccionar, 
      // el estado se manejará por la navegación
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const decoded = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
              console.log('Token expired on init');
              await logout();
              return;
            }

            setUser({
              isAuthenticated: true,
              token,
              id: decoded.id,
              role: decoded.role,
            });
          } catch (error) {
            console.error('Error decoding token:', error);
            await logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [logout]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const errorData = error.response.data as { isExpired?: boolean; error?: string };
          if (errorData?.isExpired || errorData?.error === 'Token expirado') {
            console.log('Expired token detected by backend');
          } else {
            console.log('Invalid or unauthorized token');
          }
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      if (!credentials || typeof credentials !== 'object') {
        throw new Error('Invalid login data');
      }

      const email = credentials.email?.trim();
      const password = credentials.password;

      if (!email) throw new Error('Email is required');
      if (!password) throw new Error('Password is required');


      // authAPI.login ya devuelve el objeto con token, user, etc.
      const data = await authAPI.login({ email, password }) as unknown as LoginResponse;

      if (!data.token) throw new Error('Authentication token not received');

      const decoded = jwtDecode<DecodedToken>(data.token);
      const userData: User = {
        isAuthenticated: true,
        token: data.token,
        id: decoded.id,
        role: decoded.role,
        name: data.user.name,
        email: data.user.email,
      };

      setUser(userData);
      await AsyncStorage.setItem('token', data.token);

      return { success: true, role: decoded.role };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error?.error || error?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone: string }) => {
    try {
      const registerData = {
        name: userData.name?.trim(),
        email: userData.email?.trim(),
        password: userData.password,
        phone: userData.phone?.trim(),
      };

      if (!registerData.name) throw new Error('Name is required');
      if (!registerData.email) throw new Error('Email is required');
      if (!registerData.password) throw new Error('Password is required');
      if (!registerData.phone) throw new Error('Phone number is required');

      const data = await authAPI.register(registerData) as RegisterResponse;

      return {
        success: true,
        message: data.message || 'Registration successful. Please login.',
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error?.error || error?.message || 'Registration failed' 
      };
    }
  };

  const checkTokenExpiration = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            await logout();
            return false;
          }
          return true;
        } catch (error) {
          console.error('Token decode error:', error);
          await logout();
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user?.isAuthenticated,
        checkTokenExpiration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});