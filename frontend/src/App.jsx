import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ERPProvider } from './context/ERPContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Juniors } from './pages/Juniors';
import { Cases } from './pages/Cases';
import { CaseDetails } from './pages/CaseDetails';
import { Amounts } from './pages/Amounts';
import { Hearings } from './pages/Hearings';
import { Settings } from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ERPProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="juniors" element={<Juniors />} />
              <Route path="cases" element={<Cases />} />
              <Route path="cases/:id" element={<CaseDetails />} />
              <Route path="amounts" element={<Amounts />} />
              <Route path="hearings" element={<Hearings />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </ERPProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
