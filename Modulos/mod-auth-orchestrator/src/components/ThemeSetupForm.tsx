/**
 * COMPONENTE ThemeSetupForm - mod-auth-orchestrator
 * 
 * Formulario para configurar el tema visual de los m�dulos de auth.
 * Se muestra cuando no hay ThemeConfig provisto.
 */

import React, { useState } from 'react';
import { DEFAULT_THEME, saveTheme, validateTheme } from '../config/theme';
import type { ThemeSetupFormProps, ThemeConfig } from '../types';

export function ThemeSetupForm({
  onSave,
  initialTheme,
  title = 'Configurar Tema',
}: ThemeSetupFormProps) {
  const [theme, setTheme] = useState<ThemeConfig>({
    ...DEFAULT_THEME,
    ...initialTheme,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof ThemeConfig, value: string) => {
    setTheme(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTheme(theme)) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    saveTheme(theme);
    onSave(theme);
  };

  const colorFields: { key: keyof ThemeConfig; label: string }[] = [
    { key: 'primaryColor', label: 'Color Primario' },
    { key: 'secondaryColor', label: 'Color Secundario' },
    { key: 'backgroundColor', label: 'Color de Fondo' },
    { key: 'textColor', label: 'Color de Texto' },
    { key: 'errorColor', label: 'Color de Error' },
    { key: 'successColor', label: 'Color de �xito' },
  ];

  // Estilos inline
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    title: {
      fontSize: '20px',
      fontWeight: 600,
      marginBottom: '24px',
      textAlign: 'center' as const,
    },
    field: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      marginBottom: '4px',
      color: '#374151',
    },
    colorInputWrapper: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
    colorPicker: {
      width: '40px',
      height: '40px',
      padding: '2px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
    },
    textInput: {
      flex: 1,
      height: '40px',
      padding: '0 12px',
      fontSize: '14px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      fontFamily: 'monospace',
    },
    select: {
      width: '100%',
      height: '40px',
      padding: '0 12px',
      fontSize: '14px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
    },
    button: {
      width: '100%',
      height: '44px',
      marginTop: '24px',
      fontSize: '14px',
      fontWeight: 500,
      border: 'none',
      borderRadius: '6px',
      backgroundColor: theme.primaryColor,
      color: '#ffffff',
      cursor: 'pointer',
    },
    error: {
      marginTop: '12px',
      padding: '8px 12px',
      fontSize: '12px',
      borderRadius: '6px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#ef4444',
      textAlign: 'center' as const,
    },
    preview: {
      marginTop: '24px',
      padding: '16px',
      borderRadius: theme.borderRadius,
      backgroundColor: theme.backgroundColor,
      border: '1px solid #e5e7eb',
    },
    previewTitle: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '12px',
    },
    previewButton: {
      display: 'inline-block',
      padding: '8px 16px',
      marginRight: '8px',
      fontSize: '14px',
      borderRadius: theme.borderRadius,
      backgroundColor: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
      color: theme.buttonStyle === 'filled' ? '#ffffff' : theme.primaryColor,
      border: theme.buttonStyle === 'outline' ? `1px solid ${theme.primaryColor}` : 'none',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{title}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Campos de color */}
        {colorFields.map(({ key, label }) => (
          <div key={key} style={styles.field}>
            <label style={styles.label}>{label}</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={theme[key] as string}
                onChange={(e) => handleChange(key, e.target.value)}
                style={styles.colorPicker}
              />
              <input
                type="text"
                value={theme[key] as string}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="#000000"
                style={styles.textInput}
              />
            </div>
          </div>
        ))}

        {/* Border Radius */}
        <div style={styles.field}>
          <label style={styles.label}>Radio de Bordes</label>
          <select
            value={theme.borderRadius}
            onChange={(e) => handleChange('borderRadius', e.target.value)}
            style={styles.select}
          >
            <option value="0">Ninguno (0)</option>
            <option value="0.25rem">Peque�o (0.25rem)</option>
            <option value="0.375rem">Medio (0.375rem)</option>
            <option value="0.5rem">Grande (0.5rem)</option>
            <option value="0.75rem">Extra Grande (0.75rem)</option>
            <option value="1rem">M�ximo (1rem)</option>
          </select>
        </div>

        {/* Estilo de Bot�n */}
        <div style={styles.field}>
          <label style={styles.label}>Estilo de Botones</label>
          <select
            value={theme.buttonStyle}
            onChange={(e) => handleChange('buttonStyle', e.target.value as 'filled' | 'outline')}
            style={styles.select}
          >
            <option value="filled">Relleno (filled)</option>
            <option value="outline">Contorno (outline)</option>
          </select>
        </div>

        {/* Fuente */}
        <div style={styles.field}>
          <label style={styles.label}>Fuente (opcional)</label>
          <input
            type="text"
            value={theme.fontFamily || ''}
            onChange={(e) => handleChange('fontFamily', e.target.value)}
            placeholder="system-ui, sans-serif"
            style={{ ...styles.textInput, width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Preview */}
        <div style={styles.preview}>
          <div style={styles.previewTitle}>Vista previa</div>
          <span style={styles.previewButton}>Bot�n Primario</span>
          <span style={{ 
            ...styles.previewButton, 
            backgroundColor: theme.secondaryColor,
            border: 'none',
            color: '#ffffff',
          }}>
            Secundario
          </span>
        </div>

        {/* Submit */}
        <button type="submit" style={styles.button}>
          Guardar Tema
        </button>
      </form>
    </div>
  );
}
