import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import styles from './Login.module.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <img src="/Logotipo_UAA.jpg" alt="UAA" className={styles.logo} />
          <h1 className={styles.title}>Aula Virtual 2.0</h1>
          <p className={styles.subtitle}>Universidad Autónoma de Aguascalientes</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo institucional
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="tu.correo@edu.uaa.mx"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Recordar mis datos</span>
            </label>
            <a href="#" className={styles.forgotPassword}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingText}>
                <span className="spinner" />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.footerText}>
            ¿Problemas para iniciar sesión?
          </p>
          <a href="#" className={styles.supportLink}>
            Contactar soporte técnico
          </a>
        </div>
      </div>

      <div className={styles.decorativeSide}>
        <div className={styles.decorativeContent}>
          <h2>Bienvenido de vuelta</h2>
          <p>Accede a tus cursos y continúa tu aprendizaje</p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📚</span>
              <span>Acceso offline a tus cursos</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔔</span>
              <span>Notificaciones en tiempo real</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📊</span>
              <span>Seguimiento de tu progreso</span>
            </div>
          </div>
          
          <div className={styles.poweredBy}>
            <img src="/Logotipo_SIIMPLE.jpg" alt="SIMPLE" className={styles.simpleLogo} />
            <p className={styles.poweredByText}>
              Powered by SIMPLE
              <br />
              <small>Smart Interactive and Inclusive Model for Personal Learning Environments</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}