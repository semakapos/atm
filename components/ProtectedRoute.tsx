import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (!sessionStorage.getItem('auth')) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const AuthRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (sessionStorage.getItem('auth')) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  if (!sessionStorage.getItem('admin')) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};
