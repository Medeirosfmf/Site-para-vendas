import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Email format validation (standard regex pattern)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, insira um e-mail válido');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone: phone || null,
        city: city || null,
        password,
      });
      navigate('/');
    } catch (err) {
      // Errors are handled inside register function via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-text-primary">
      <Helmet>
        <title>Criar Conta - Imports GR</title>
      </Helmet>

      <div className="w-full max-w-lg glass-card p-8 border border-dark-600 rounded-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/15 blur-2xl rounded-full pointer-events-none" />

        <div className="text-center mb-8 relative">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight gradient-text">
              IMPORTS GR
            </span>
          </Link>
          <h2 className="text-xl font-bold mt-4 text-text-primary">Criar uma Conta</h2>
          <p className="text-text-secondary text-xs mt-1.5">
            Cadastre-se para acompanhar seus pedidos e favoritar produtos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          {/* Name field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-text-secondary block">
              Nome Completo *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                <FiUser className="w-4 h-4" />
              </span>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João da Silva"
                className="w-full bg-dark-800 border border-dark-600 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-text-secondary block">
              E-mail *
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
                className="w-full bg-dark-800 border border-dark-600 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Grid for Phone and City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone field */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-text-secondary block">
                Telefone (WhatsApp)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                  <FiPhone className="w-4 h-4" />
                </span>
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="41999999999"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* City field */}
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs font-semibold text-text-secondary block">
                Cidade
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                  <FiMapPin className="w-4 h-4" />
                </span>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Curitiba"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl py-2.5 pl-11 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Grid for Password and Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-text-secondary block">
                Senha *
              </label>
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
                  placeholder="Mínimo 6 dígitos"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl py-2.5 pl-11 pr-10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-secondary block">
                Confirmar Senha *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl py-2.5 pl-11 pr-10 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Show password checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="show-pass-check"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="rounded bg-dark-800 border-dark-600 text-primary focus:ring-primary w-4 h-4"
            />
            <label htmlFor="show-pass-check" className="text-xs text-text-secondary cursor-pointer select-none">
              Mostrar senhas
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            className="py-3 font-semibold rounded-xl text-sm mt-6 shadow-lg shadow-primary/20"
          >
            Cadastrar Conta
          </Button>

          {/* Link to Login */}
          <p className="text-xs text-text-secondary text-center mt-4">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-secondary font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
