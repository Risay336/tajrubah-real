import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  signUp: (newUser: User) => void;
  logout: () => void;
  updateProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database using localStorage
const getMockUser = (email: string): User | null => {
  try {
    const storedUser = localStorage.getItem(`sayangku-user-${email}`);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const saveMockUser = (user: User) => {
  try {
    localStorage.setItem(`sayangku-user-${user.id}`, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user data", error);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const activeUserEmail = localStorage.getItem('sayangku-active-user');
      if (activeUserEmail) {
        const loggedInUser = getMockUser(activeUserEmail);
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error("Failed to load active user", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (email: string) => {
    const existingUser = getMockUser(email);
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('sayangku-active-user', email);
    } else {
        // For this mock, if user doesn't exist on login, we'll create a default one.
        // A real app would show an error.
        const defaultUser: User = {
            id: email,
            username: email.split('@')[0],
            dob: '2000-01-01',
            avatar: `https://picsum.photos/seed/${email}/200/200`
        }
        signUp(defaultUser);
    }
  };

  const signUp = (newUser: User) => {
    saveMockUser(newUser);
    setUser(newUser);
    localStorage.setItem('sayangku-active-user', newUser.id);
  };
  
  const updateProfile = (updatedUser: User) => {
    if (user && user.id === updatedUser.id) {
        saveMockUser(updatedUser);
        setUser(updatedUser);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sayangku-active-user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};