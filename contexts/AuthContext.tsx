import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { id: string } | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string } | null>(() => {
    const id = sessionStorage.getItem('auth');
    return id ? { id } : null;
  });

  useEffect(() => {
    const sync = () => {
      const id = sessionStorage.getItem('auth');
      setUser(id ? { id } : null);
    };
    window.addEventListener('storage', sync);
    window.addEventListener('authChanged', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('authChanged', sync);
    };
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
