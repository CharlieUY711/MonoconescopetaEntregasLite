/**
 * COMPONENTE AuthWizard - mod-auth-orchestrator
 * 
 * Wizard para configurar y generar archivos de autenticaci�n.
 */

import React, { useState } from 'react';
import { DEFAULT_THEME } from '../config/theme';
import type { 
  AuthWizardProps, 
  WizardConfig, 
  GeneratedFiles, 
  ThemeConfig,
  AuthModule 
} from '../types';

// ============================================
// TIPOS INTERNOS
// ============================================

type WizardStep = 'modules' | 'firebase' | 'options' | 'theme' | 'generate';

// ============================================
// GENERADORES
// ============================================

function generateAuthConfig(config: WizardConfig): string {
  return `/**
 * AUTH CONFIG - Generado por mod-auth-orchestrator
 * Proyecto: ${config.projectName || 'Mi Proyecto'}
 */

export const authConfig = {
  modules: ${JSON.stringify(config.modules)},
  googleMode: '${config.googleMode || 'popup'}',
  requireEmailVerification: ${config.requireEmailVerification},
};

export type AuthModule = ${config.modules.map(m => `'${m}'`).join(' | ')};
`;
}

function generateFirebaseClient(config: WizardConfig): string {
  return `/**
 * FIREBASE CLIENT - Generado por mod-auth-orchestrator
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '${config.firebaseConfig.apiKey}',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '${config.firebaseConfig.authDomain}',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '${config.firebaseConfig.projectId}',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '${config.firebaseConfig.storageBucket || ''}',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '${config.firebaseConfig.messagingSenderId || ''}',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '${config.firebaseConfig.appId}',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '${config.firebaseConfig.measurementId || ''}',
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export { firebaseConfig };
`;
}

function generateThemeTokens(theme: ThemeConfig): string {
  return JSON.stringify(theme, null, 2);
}

function generateAuthGatewayFile(config: WizardConfig): string {
  const modules = config.modules.map(m => `'${m}'`).join(', ');
  
  return `/**
 * AUTH GATEWAY - Generado por mod-auth-orchestrator
 */

import React from 'react';
import { AuthGateway } from 'mod-auth-orchestrator';
import { firebaseConfig } from './firebase.client';
${config.theme ? "import themeTokens from './theme.tokens.json';" : ''}

interface AppAuthGatewayProps {
  onAuthenticated: (user: any, isNew: boolean) => void;
  onError?: (error: string) => void;
}

export function AppAuthGateway({ onAuthenticated, onError }: AppAuthGatewayProps) {
  return (
    <AuthGateway
      modules={[${modules}]}
      firebaseConfig={firebaseConfig}
      ${config.theme ? 'theme={themeTokens}' : ''}
      onAuthenticated={onAuthenticated}
      onError={onError}
      showGoogle={${config.modules.includes('google')}}
      requireEmailVerification={${config.requireEmailVerification}}
      title="${config.projectName || 'Bienvenido'}"
    />
  );
}

export default AppAuthGateway;
`;
}

// ============================================
// COMPONENTE
// ============================================

export function AuthWizard({ onGenerate, onCancel }: AuthWizardProps) {
  const [step, setStep] = useState<WizardStep>('modules');
  const [config, setConfig] = useState<WizardConfig>({
    modules: ['login', 'register', 'google', 'verification'],
    firebaseConfig: {
      apiKey: '',
      authDomain: '',
      projectId: '',
      appId: '',
    },
    googleMode: 'popup',
    requireEmailVerification: true,
    theme: undefined,
    projectName: '',
  });
  const [customTheme, setCustomTheme] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  // Handlers
  const toggleModule = (mod: AuthModule) => {
    setConfig(prev => ({
      ...prev,
      modules: prev.modules.includes(mod)
        ? prev.modules.filter(m => m !== mod)
        : [...prev.modules, mod],
    }));
  };

  const updateFirebaseConfig = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      firebaseConfig: { ...prev.firebaseConfig, [key]: value },
    }));
  };

  const handleGenerate = () => {
    const finalConfig: WizardConfig = {
      ...config,
      theme: customTheme ? theme : undefined,
    };

    const files: GeneratedFiles = {
      'auth.config.ts': generateAuthConfig(finalConfig),
      'firebase.client.ts': generateFirebaseClient(finalConfig),
      'AuthGateway.tsx': generateAuthGatewayFile(finalConfig),
    };

    if (customTheme) {
      files['theme.tokens.json'] = generateThemeTokens(theme);
    }

    onGenerate(files);
  };

  const nextStep = () => {
    const steps: WizardStep[] = ['modules', 'firebase', 'options', 'theme', 'generate'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: WizardStep[] = ['modules', 'firebase', 'options', 'theme', 'generate'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  // Estilos
  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
    },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '8px',
    },
    stepIndicator: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
    },
    stepDot: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
    },
    stepDotActive: {
      backgroundColor: '#00A9CE',
    },
    section: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 500,
      marginBottom: '12px',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px',
      cursor: 'pointer',
    },
    input: {
      width: '100%',
      height: '40px',
      padding: '0 12px',
      marginBottom: '12px',
      fontSize: '14px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxSizing: 'border-box' as const,
    },
    label: {
      display: 'block',
      fontSize: '13px',
      marginBottom: '4px',
      color: '#6b7280',
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
    },
    buttonPrimary: {
      flex: 1,
      height: '44px',
      fontSize: '14px',
      fontWeight: 500,
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#00A9CE',
      color: '#ffffff',
      cursor: 'pointer',
    },
    buttonSecondary: {
      flex: 1,
      height: '44px',
      fontSize: '14px',
      fontWeight: 500,
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
    },
    codePreview: {
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap' as const,
      overflow: 'auto',
      maxHeight: '200px',
    },
  };

  const steps: WizardStep[] = ['modules', 'firebase', 'options', 'theme', 'generate'];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Auth Suite Wizard</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Configura y genera los archivos de autenticaci�n
        </p>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        {steps.map((s) => (
          <div
            key={s}
            style={{
              ...styles.stepDot,
              ...(steps.indexOf(s) <= steps.indexOf(step) ? styles.stepDotActive : {}),
            }}
          />
        ))}
      </div>

      {/* Step: Modules */}
      {step === 'modules' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>1. Selecciona los m�dulos</h3>
          {(['login', 'register', 'google', 'verification'] as AuthModule[]).map(mod => (
            <label key={mod} style={styles.checkbox}>
              <input
                type="checkbox"
                checked={config.modules.includes(mod)}
                onChange={() => toggleModule(mod)}
              />
              <span style={{ textTransform: 'capitalize' }}>{mod}</span>
            </label>
          ))}
        </div>
      )}

      {/* Step: Firebase */}
      {step === 'firebase' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>2. Configuraci�n Firebase</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            Obt�n estos valores de Firebase Console ? Project Settings ? Your apps
          </p>
          
          <label style={styles.label}>Nombre del Proyecto</label>
          <input
            type="text"
            value={config.projectName || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, projectName: e.target.value }))}
            placeholder="Mi Proyecto"
            style={styles.input}
          />
          
          <label style={styles.label}>API Key *</label>
          <input
            type="text"
            value={config.firebaseConfig.apiKey}
            onChange={(e) => updateFirebaseConfig('apiKey', e.target.value)}
            placeholder="AIza..."
            style={styles.input}
          />
          
          <label style={styles.label}>Auth Domain *</label>
          <input
            type="text"
            value={config.firebaseConfig.authDomain}
            onChange={(e) => updateFirebaseConfig('authDomain', e.target.value)}
            placeholder="proyecto.firebaseapp.com"
            style={styles.input}
          />
          
          <label style={styles.label}>Project ID *</label>
          <input
            type="text"
            value={config.firebaseConfig.projectId}
            onChange={(e) => updateFirebaseConfig('projectId', e.target.value)}
            placeholder="mi-proyecto"
            style={styles.input}
          />
          
          <label style={styles.label}>App ID *</label>
          <input
            type="text"
            value={config.firebaseConfig.appId}
            onChange={(e) => updateFirebaseConfig('appId', e.target.value)}
            placeholder="1:123:web:abc"
            style={styles.input}
          />
        </div>
      )}

      {/* Step: Options */}
      {step === 'options' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>3. Opciones</h3>
          
          {config.modules.includes('google') && (
            <>
              <label style={styles.label}>Modo de Google Login</label>
              <select
                value={config.googleMode}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  googleMode: e.target.value as 'popup' | 'redirect' 
                }))}
                style={styles.input}
              >
                <option value="popup">Popup (recomendado)</option>
                <option value="redirect">Redirect</option>
              </select>
            </>
          )}
          
          {config.modules.includes('verification') && (
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={config.requireEmailVerification}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  requireEmailVerification: e.target.checked 
                }))}
              />
              <span>Requerir verificaci�n de email</span>
            </label>
          )}
        </div>
      )}

      {/* Step: Theme */}
      {step === 'theme' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>4. Tema Visual</h3>
          
          <label style={styles.checkbox}>
            <input
              type="checkbox"
              checked={customTheme}
              onChange={(e) => setCustomTheme(e.target.checked)}
            />
            <span>Personalizar tema</span>
          </label>
          
          {customTheme && (
            <div style={{ marginTop: '16px' }}>
              <label style={styles.label}>Color Primario</label>
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                style={{ ...styles.input, height: '50px', padding: '4px' }}
              />
              
              <label style={styles.label}>Color Secundario</label>
              <input
                type="color"
                value={theme.secondaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                style={{ ...styles.input, height: '50px', padding: '4px' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Step: Generate */}
      {step === 'generate' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>5. Generar Archivos</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            Se generar�n los siguientes archivos:
          </p>
          
          <ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
            <li>auth.config.ts</li>
            <li>firebase.client.ts</li>
            <li>AuthGateway.tsx</li>
            {customTheme && <li>theme.tokens.json</li>}
          </ul>
          
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Preview: auth.config.ts</h4>
            <pre style={styles.codePreview}>
              {generateAuthConfig({ ...config, theme: customTheme ? theme : undefined })}
            </pre>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={styles.buttons}>
        {step !== 'modules' ? (
          <button onClick={prevStep} style={styles.buttonSecondary}>
            Anterior
          </button>
        ) : onCancel ? (
          <button onClick={onCancel} style={styles.buttonSecondary}>
            Cancelar
          </button>
        ) : null}
        
        {step !== 'generate' ? (
          <button onClick={nextStep} style={styles.buttonPrimary}>
            Siguiente
          </button>
        ) : (
          <button onClick={handleGenerate} style={styles.buttonPrimary}>
            Generar Archivos
          </button>
        )}
      </div>
    </div>
  );
}
