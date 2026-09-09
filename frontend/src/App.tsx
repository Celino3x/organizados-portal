import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Territories from './pages/Territories';
import TerritoryMap from './pages/TerritoryMap';
import TerritoryView from './pages/TerritoryView';
import TerritoryDetail from './pages/TerritoryDetail';
import TerritoryWorker from './pages/TerritoryWorker';
import TerritoryWorkerPublic from './pages/TerritoryWorkerPublic';
import TerritoryWorkerTest from './pages/TerritoryWorkerTest';
import Designations from './pages/Designations';
import MeetingDesignations from './pages/MeetingDesignations';
import MeetingCreate from './pages/MeetingCreate';
import Reports from './pages/Reports';
import Congregation from './pages/Congregation';
import PublisherForm from './pages/PublisherForm';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      
      {/* Rota do Território para Dirigentes (pública) */}
      <Route path="/territories/:id/public" element={<TerritoryWorkerPublic />} />
      <Route path="/territory/:id/worker" element={<TerritoryWorker />} />
      
      {/* Rotas Protegidas (requer autenticação) */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/territories" element={
        <ProtectedRoute>
          <Layout>
            <Territories />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/territories/map" element={
        <ProtectedRoute>
          <Layout>
            <TerritoryMap />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/territories/detail/:id" element={
        <ProtectedRoute>
          <Layout>
            <TerritoryDetail />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/territories/:id" element={<TerritoryView />} />
      
      <Route path="/territories/:id/worker" element={
        <ProtectedRoute>
          <Layout>
            <TerritoryWorker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/territories/:id/worker-test" element={
        <ProtectedRoute>
          <Layout>
            <TerritoryWorkerTest />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Rotas de Designações */}
      <Route path="/designations" element={
        <ProtectedRoute>
          <Layout>
            <Designations />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/designations/meetings" element={
        <ProtectedRoute>
          <Layout>
            <MeetingDesignations />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/designations/meetings/create" element={
        <ProtectedRoute>
          <Layout>
            <MeetingCreate />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/congregation" element={
        <ProtectedRoute>
          <Layout>
            <Congregation />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/congregation/new" element={
        <ProtectedRoute>
          <Layout>
            <PublisherForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/congregation/edit/:id" element={
        <ProtectedRoute>
          <Layout>
            <PublisherForm />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Redirecionar qualquer rota não encontrada para o dashboard */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;