/**
 * EJEMPLO B�SICO - mod-auth-login
 * 
 * Muestra c�mo usar el m�dulo de login en una app React.
 */

import React from 'react';
import { LoginForm } from '../src';

export function BasicLoginExample() {
  const handleSuccess = (user: { uid: string; email: string | null }) => {
    console.log('Usuario autenticado:', user);
    // Aqu� podr�as redirigir al dashboard
    // navigate('/dashboard');
  };

  const handleError = (error: string) => {
    console.error('Error de login:', error);
  };

  const handleNavigateToRegister = (email: string) => {
    console.log('Email no registrado, navegar a registro con:', email);
    // navigate('/register', { state: { email } });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Iniciar Sesi�n
      </h1>
      
      <LoginForm
        onSuccess={handleSuccess}
        onError={handleError}
        onNavigateToRegister={handleNavigateToRegister}
        showForgotPassword={true}
        labels={{
          emailPlaceholder: 'Tu correo electr�nico',
          passwordPlaceholder: 'Tu contrase�a',
          submitButton: 'Ingresar',
          forgotPasswordLink: '�Olvidaste tu contrase�a?',
        }}
        theme={{
          primaryColor: '#00A9CE',
          secondaryColor: '#6366f1',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          errorColor: '#ef4444',
          successColor: '#22c55e',
          borderRadius: '8px',
          buttonStyle: 'filled',
        }}
      />
    </div>
  );
}

export default BasicLoginExample;
