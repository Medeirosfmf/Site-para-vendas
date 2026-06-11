import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Errors are handled inside the login function via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-text-primary">
      <Helmet>
        <title>Login - Imports GR</title>
      </Helmet>

      <div className="w-full max-w-md glass-card p-8 border border-dark-600 rounded-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/15 blur-2xl rounded-full pointer-events-none" />

        <div className="text-center mb-8 relative">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight gradient-text">
              IMPORTS GR
            </span>
          </Link>
          <h2 className="text-xl font-bold mt-4 text-text-primary">Entrar na sua Conta</h2>
          <p className="text-text-secondary text-xs mt-1.5">
            Acesse o catálogo completo e faça seus pedidos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold text-text-secondary block">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <FiMail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full bg-dark-800 border border-dark-600 rounded-xl py-3 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-text-secondary block">
                Senha
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha secreta"
                className="w-full bg-dark-800 border border-dark-600 rounded-xl py-3 pl-11 pr-12 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            className="py-3 font-semibold rounded-xl text-sm mt-8 shadow-lg shadow-primary/20"
          >
            Entrar
          </Button>

          {/* Link to Register */}
          <p className="text-xs text-text-secondary text-center mt-4">
            Não tem uma conta?{' '}
            <Link to="/registro" className="text-secondary font-semibold hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
