/**
 * EJEMPLO B�SICO - mod-auth-registro
 */

import React from 'react';
import { RegisterForm } from '../src';

export function BasicRegisterExample() {
  const handleSuccess = (result: { uid: string; email: string }) => {
    console.log('Usuario registrado:', result);
    // navigate('/dashboard');
  };

  const handleError = (error: string) => {
    console.error('Error de registro:', error);
  };

  const handleNavigateToLogin = () => {
    console.log('Ir a login');
    // navigate('/login');
  };

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Crear Cuenta
      </h1>
      
      <RegisterForm
        onSuccess={handleSuccess}
        onError={handleError}
        onNavigateToLogin={handleNavigateToLogin}
        showPhone={true}
        defaultPhonePrefix="+598"
        requireEmailVerification={true}
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
        labels={{
          firstNamePlaceholder: 'Tu nombre',
          lastNamePlaceholder: 'Tu apellido',
          passwordPlaceholder: 'Contrase�a (m�n. 6 caracteres)',
          confirmPasswordPlaceholder: 'Confirmar contrase�a',
          phonePlaceholder: 'Tel�fono (opcional)',
          submitButton: 'Crear cuenta',
          cancelButton: 'Cancelar',
        }}
      />
    </div>
  );
}

export default BasicRegisterExample;
