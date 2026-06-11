import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 text-text-primary text-center">
      <Helmet>
        <title>Página Não Encontrada - Imports GR</title>
      </Helmet>

      <div className="max-w-md w-full glass-card p-10 border border-dark-600 rounded-3xl relative overflow-hidden">
        {/* Decorative Blurred Lights */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-secondary/20 blur-3xl rounded-full" />

        <div className="relative space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger animate-pulse">
              <FiAlertTriangle className="w-8 h-8" />
            </div>
          </div>

          <div>
            <h1 className="text-8xl font-black tracking-widest gradient-text select-none animate-bounce">
              404
            </h1>
            <h2 className="text-xl font-bold mt-2">Página Não Encontrada</h2>
            <p className="text-sm text-text-secondary mt-2">
              O link que você acessou pode estar quebrado ou a página foi removida de nosso site.
            </p>
          </div>

          <div className="pt-4">
            <Link 
              to="/" 
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            >
              <FiHome className="w-4 h-4" /> Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
