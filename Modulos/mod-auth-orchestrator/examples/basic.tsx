/**
 * EJEMPLO BÁSICO - mod-auth-orchestrator
 */

import React, { useState } from 'react';
import { AuthGateway, AuthWizard, ThemeSetupForm } from '../src';
import type { AuthUser, GeneratedFiles, ThemeConfig } from '../src';

// ============================================
// EJEMPLO: AuthGateway Completo
// ============================================

export function AuthGatewayExample() {
  const handleAuthenticated = (user: AuthUser, isNew: boolean) => {
    console.log('Usuario autenticado:', user);
    console.log('Es nuevo usuario:', isNew);
    // navigate('/dashboard');
  };

  const handleError = (error: string) => {
    console.error('Error de autenticación:', error);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 20px' }}>
      <AuthGateway
        modules={['login', 'register', 'google', 'verification']}
        initialView="login"
        onAuthenticated={handleAuthenticated}
        onError={handleError}
        showGoogle={true}
        requireEmailVerification={true}
        title="Bienvenido"
        subtitle="Inicia sesión o crea una cuenta"
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
          loginTab: 'Iniciar Sesión',
          registerTab: 'Crear Cuenta',
          googleButton: 'Continuar con Google',
          forgotPassword: '¿Olvidaste tu contraseña?',
        }}
      />
    </div>
  );
}

// ============================================
// EJEMPLO: AuthWizard
// ============================================

export function AuthWizardExample() {
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null);

  const handleGenerate = (files: GeneratedFiles) => {
    console.log('Archivos generados:', files);
    setGeneratedFiles(files);
  };

  if (generatedFiles) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <h2>Archivos Generados</h2>
        {Object.entries(generatedFiles).map(([name, content]) => (
          <div key={name} style={{ marginBottom: '24px' }}>
            <h3>{name}</h3>
            <pre style={{ 
              padding: '16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
            }}>
              {content}
            </pre>
          </div>
        ))}
        <button onClick={() => setGeneratedFiles(null)}>
          Volver al Wizard
        </button>
      </div>
    );
  }

  return (
    <AuthWizard
      onGenerate={handleGenerate}
      onCancel={() => console.log('Wizard cancelado')}
    />
  );
}

// ============================================
// EJEMPLO: ThemeSetupForm
// ============================================

export function ThemeSetupExample() {
  const [savedTheme, setSavedTheme] = useState<ThemeConfig | null>(null);

  const handleSave = (theme: ThemeConfig) => {
    console.log('Tema guardado:', theme);
    setSavedTheme(theme);
  };

  if (savedTheme) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <h2>Tema Guardado</h2>
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginTop: '24px',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundColor: savedTheme.primaryColor,
          }} />
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundColor: savedTheme.secondaryColor,
          }} />
        </div>
        <button 
          onClick={() => setSavedTheme(null)}
          style={{ marginTop: '24px' }}
        >
          Editar Tema
        </button>
      </div>
    );
  }

  return (
    <ThemeSetupForm
      onSave={handleSave}
      initialTheme={{
        primaryColor: '#00A9CE',
        secondaryColor: '#6366f1',
      }}
      title="Configurar Apariencia"
    />
  );
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default function Examples() {
  const [example, setExample] = useState<'gateway' | 'wizard' | 'theme'>('gateway');

  return (
    <div>
      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'center',
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <button onClick={() => setExample('gateway')}>AuthGateway</button>
        <button onClick={() => setExample('wizard')}>AuthWizard</button>
        <button onClick={() => setExample('theme')}>ThemeSetup</button>
      </div>

      {/* Content */}
      {example === 'gateway' && <AuthGatewayExample />}
      {example === 'wizard' && <AuthWizardExample />}
      {example === 'theme' && <ThemeSetupExample />}
    </div>
  );
}
