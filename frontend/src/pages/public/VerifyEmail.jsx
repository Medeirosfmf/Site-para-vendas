import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function VerifyEmail() {
  const { verifyEmail, resendCode, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(!location.state?.email);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Focus ref for code input
  const codeInputRef = useRef(null);

  // Redirect if user gets authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Handle countdown timer for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('O e-mail é obrigatório');
      return;
    }
    if (!code || code.length !== 6) {
      toast.error('Insira o código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(email, code);
      navigate('/');
    } catch (err) {
      // Errors are handled inside verifyEmail function via toast
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('O e-mail é obrigatório para reenviar o código');
      return;
    }
    if (countdown > 0) return;

    setResending(true);
    try {
      await resendCode(email);
      setCountdown(60); // 1 minute cooldown
    } catch (err) {
      // Errors are handled inside resendCode function via toast
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Numeric only
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-text-primary">
      <Helmet>
        <title>Confirmar E-mail - Imports GR</title>
      </Helmet>

      <div className="w-full max-w-md glass-card p-8 border border-dark-600 rounded-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/15 blur-2xl rounded-full pointer-events-none" />

        <div className="mb-6">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-xs text-text-secondary hover:text-primary transition-colors gap-1.5"
          >
            <FiArrowLeft /> Voltar para o Login
          </button>
        </div>

        <div className="text-center mb-8 relative">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight gradient-text">
              IMPORTS GR
            </span>
          </Link>
          <h2 className="text-xl font-bold mt-4 text-text-primary">Verificação de E-mail</h2>
          <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">
            Inserimos uma camada extra de segurança. Confirme sua conta digitando o código de 6 dígitos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Email Area */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary block">
              E-mail de Cadastro
            </label>

            {isEditingEmail ? (
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl py-3 pl-11 pr-24 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
                {location.state?.email && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-dark-800/50 border border-dark-600/50 rounded-xl px-4 py-3">
                <div className="flex items-center space-x-2 text-sm text-text-secondary overflow-hidden">
                  <FiMail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate font-medium">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="text-xs font-semibold text-primary hover:text-primary-light transition-colors ml-2 shrink-0"
                >
                  Alterar
                </button>
              </div>
            )}
          </div>

          {/* Verification Code Box */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label htmlFor="otp-code" className="text-xs font-semibold text-text-secondary block">
                Código de 6 Dígitos
              </label>
              <span className="text-[10px] text-text-muted">Enviado por e-mail</span>
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <FiLock className="w-4 h-4" />
              </span>
              <input
                id="otp-code"
                ref={codeInputRef}
                type="text"
                required
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl py-3 pl-11 pr-4 text-center text-xl font-bold tracking-[8px] text-primary placeholder-text-muted/40 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Code digit hint helper */}
            <div className="flex justify-center gap-1.5 pt-1.5">
              {[...Array(6)].map((_, index) => {
                const digit = code[index];
                return (
                  <div
                    key={index}
                    onClick={() => codeInputRef.current?.focus()}
                    className={`w-9 h-11 rounded-lg border flex items-center justify-center text-base font-bold transition-all cursor-text ${
                      digit
                        ? 'border-primary bg-primary/5 text-primary'
                        : code.length === index
                        ? 'border-primary/50 bg-dark-700 text-text-muted animate-pulse'
                        : 'border-dark-600 bg-dark-800 text-text-muted'
                    }`}
                  >
                    {digit || ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            className="py-3 font-semibold rounded-xl text-sm mt-8 shadow-lg shadow-primary/20"
          >
            Confirmar e Ativar Conta
          </Button>

          {/* Resend Action */}
          <div className="text-center pt-2">
            {countdown > 0 ? (
              <p className="text-xs text-text-secondary">
                Aguarde <span className="font-semibold text-primary">{countdown}s</span> para reenviar o código.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center text-xs font-semibold text-secondary hover:text-secondary-light hover:underline gap-1.5 transition-all disabled:opacity-50"
              >
                <FiRefreshCw className={resending ? 'animate-spin' : ''} />
                Reenviar código por e-mail
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
