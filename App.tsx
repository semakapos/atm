import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AuthRoute, AdminRoute } from './components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const QuickEntry = React.lazy(() => import('./components/QuickEntry').then(m => ({ default: m.QuickEntry })));
const MachineSettings = React.lazy(() => import('./components/MachineSettings').then(m => ({ default: m.MachineSettings })));
const Business = React.lazy(() => import('./components/Business').then(m => ({ default: m.Business })));
const Export = React.lazy(() => import('./components/Export').then(m => ({ default: m.Export })));
const Auth = React.lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const AdminPage = React.lazy(() => import('./components/AdminPage').then(m => ({ default: m.AdminPage })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-48">
    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/entry" replace />} />
              <Route path="entry" element={<QuickEntry />} />
              <Route path="settings" element={<MachineSettings />} />
              <Route path="business" element={<Business />} />
              <Route path="export" element={<Export />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
