import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { InstitutionalPage } from './components/InstitutionalPage';
import { DocumentViewerPage } from './components/DocumentViewerPage';
import { Dashboard } from './components/Dashboard';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/institucional" element={<InstitutionalPage />} />
          <Route path="/institucional/:docId" element={<DocumentViewerPage />} />
          {/* Redirigir /login a la landing (el formulario está integrado) */}
          <Route path="/login" element={<Navigate to="/#acceso-clientes" replace />} />
          
          {/* Dashboard - Variante Operador */}
          <Route path="/dashboard" element={<Dashboard userRole="operator" userName="Juan Operador" />} />
          <Route path="/dashboard/*" element={<Dashboard userRole="operator" userName="Juan Operador" />} />
          
          {/* Dashboard - Variante Cliente */}
          <Route path="/dashboard-cliente" element={<Dashboard userRole="client" userName="María Cliente" />} />
          <Route path="/dashboard-cliente/*" element={<Dashboard userRole="client" userName="María Cliente" />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
