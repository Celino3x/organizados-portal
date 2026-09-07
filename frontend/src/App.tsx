import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Territories from './pages/Territories';
import TerritoryWorker from './pages/TerritoryWorker';
import TerritoryWorkerTest from './pages/TerritoryWorkerTest';
import Designations from './pages/Designations';
import Congregation from './pages/Congregation';
import Reports from './pages/Reports';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="territories" element={<Territories />} />
              <Route path="territories/:id/worker" element={<TerritoryWorker />} />
              <Route path="territories/:id/worker-test" element={<TerritoryWorkerTest />} />
              <Route path="designations" element={<Designations />} />
              <Route path="congregation" element={<Congregation />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;