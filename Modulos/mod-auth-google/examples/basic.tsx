/**
 * EJEMPLO B�SICO - mod-auth-google
 */

import React, { useState } from 'react';
import { GoogleLoginButton, useGoogleLogin } from '../src';

export function BasicGoogleExample() {
  const [linkingEmail, setLinkingEmail] = useState<string | null>(null);
  const { linkWithPassword } = useGoogleLogin();

  const handleSuccess = (result: { user: { email: string | null }; isNew: boolean }) => {
    console.log('Usuario autenticado:', result.user.email);
    console.log('Es nuevo usuario:', result.isNew);
    // navigate('/dashboard');
  };

  const handleError = (error: string) => {
    console.error('Error:', error);
  };

  const handleNeedsLinking = (email: string) => {
    console.log('Necesita linking:', email);
    setLinkingEmail(email);
  };

  const handleLink = async (password: string) => {
    if (!linkingEmail) return;
    
    const user = await linkWithPassword(linkingEmail, password);
    if (user) {
      console.log('Cuentas vinculadas exitosamente');
      setLinkingEmail(null);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>
        Login con Google
      </h1>
      
      <GoogleLoginButton
        onSuccess={handleSuccess}
        onError={handleError}
        onNeedsLinking={handleNeedsLinking}
        buttonText="Continuar con Google"
        mode="popup"
        fullWidth={true}
        forceAccountSelection={true}
        createProfile={true}
        theme={{
          primaryColor: '#00A9CE',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          errorColor: '#ef4444',
          successColor: '#22c55e',
          borderRadius: '8px',
          secondaryColor: '#6366f1',
        }}
      />

      {/* Modal de linking (simplificado) */}
      {linkingEmail && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
        }}>
          <p style={{ marginBottom: '12px', fontSize: '14px' }}>
            Ya existe una cuenta con {linkingEmail}. 
            Ingresa tu contrase�a para vincular las cuentas:
          </p>
          <input
            type="password"
            placeholder="Contrase�a"
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px',
              marginBottom: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLink((e.target as HTMLInputElement).value);
              }
            }}
          />
          <button
            onClick={() => setLinkingEmail(null)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export default BasicGoogleExample;
