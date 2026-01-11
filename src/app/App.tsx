import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/auth/Login';
import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard - Variante Operador */}
        <Route path="/dashboard" element={<Dashboard userRole="operator" userName="Juan Operador" />} />
        <Route path="/dashboard/*" element={<Dashboard userRole="operator" userName="Juan Operador" />} />
        
        {/* Dashboard - Variante Cliente */}
        <Route path="/dashboard-cliente" element={<Dashboard userRole="client" userName="María Cliente" />} />
        <Route path="/dashboard-cliente/*" element={<Dashboard userRole="client" userName="María Cliente" />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}