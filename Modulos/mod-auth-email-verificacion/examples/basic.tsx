/**
 * EJEMPLO B�SICO - mod-auth-email-verificacion
 */

import React, { useState } from 'react';
import { VerificationForm } from '../src';

export function BasicVerificationExample() {
  const [verified, setVerified] = useState(false);
  
  // Datos del usuario (normalmente vienen del formulario de registro)
  const userData = {
    email: 'usuario@ejemplo.com',
    password: 'password123',
    firstName: 'Juan',
    lastName: 'P�rez',
    phone: '+598991234567',
  };

  const handleVerified = (email: string) => {
    console.log('Email verificado:', email);
    setVerified(true);
    // Aqu� normalmente llamar�as a finalizeRegistration
  };

  const handleError = (error: string) => {
    console.error('Error de verificaci�n:', error);
  };

  const handleCancel = () => {
    console.log('Verificaci�n cancelada');
    // navigate('/register');
  };

  if (verified) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#22c55e' }}>�Email Verificado!</h2>
        <p>Tu cuenta ha sido verificada correctamente.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px' }}>
      <VerificationForm
        email={userData.email}
        userData={userData}
        onVerified={handleVerified}
        onError={handleError}
        onCancel={handleCancel}
        autoSend={true}
        resendCooldown={60}
        theme={{
          primaryColor: '#00A9CE',
          secondaryColor: '#6366f1',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          errorColor: '#ef4444',
          successColor: '#22c55e',
          borderRadius: '8px',
        }}
        labels={{
          title: 'Verificar Email',
          instructions: 'Ingresa el c�digo de 6 d�gitos enviado a',
          verifyButton: 'Verificar',
          resendButton: 'Reenviar',
          cancelButton: 'Cancelar',
        }}
      />
    </div>
  );
}

export default BasicVerificationExample;
