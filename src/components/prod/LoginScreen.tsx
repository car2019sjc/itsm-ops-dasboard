import React, { useState, useEffect } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

// Chave para armazenamento
const AUTH_KEY = 'app_auth_state';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Verificar se já está autenticado ao montar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuth = localStorage.getItem(AUTH_KEY) === 'true';
        if (isAuth) {
          onLogin();
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };
    
    checkAuth();
  }, [onLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username === 'Onset-ISRA' && password === 'Socorro01@') {
      try {
        localStorage.setItem(AUTH_KEY, 'true');
        onLogin();
      } catch (error) {
        console.error('Erro ao salvar autenticação:', error);
        setError('Erro ao fazer login. Tente novamente.');
      }
    } else {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#151B2B] rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center">
            <img 
              src="/onset-logo.svg" 
              alt="OnSet Logo" 
              className="h-40 w-auto mb-2" 
              style={{ height: '120px', width: 'auto' }} /* Increased size for better visibility */
            />
            <h1 className="text-2xl font-bold text-white text-center mb-1">
              IT Operations Dashboard
            </h1>
            <p className="text-gray-400 text-center mb-4">
              Conectando Inteligência e Tecnologia
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-400">
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0B1120] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0B1120] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}