import React from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import environment from '../config/environment';

interface DashboardHeaderProps {
  onLogout?: () => void;
  onReload?: () => void;
  title?: string;
  onShowRequestDashboard?: () => void;
  onShowExecutiveDashboard?: () => void;
}

export function DashboardHeader({ 
  onLogout, 
  onReload, 
  title,
  onShowRequestDashboard,
  onShowExecutiveDashboard 
}: DashboardHeaderProps) {
  return (
    <header className="bg-[#151B2B] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-[#4F9BFF] text-2xl mr-2">⚡</span>
              <h1 className="text-2xl font-semibold">
                <span className="text-[#1E3A8A] font-bold">On</span>
                <span className="text-orange-500 font-bold">Set</span>
              </h1>
            </div>
            <h1 className="text-2xl font-bold text-white ml-4">
              {title || "IT Operations Dashboard"}
              <span className="ml-2 px-2 py-1 text-xs font-bold bg-yellow-500/20 text-yellow-400 rounded-full">
                Beta
              </span>
              {environment.isDevelopment && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                  Development
                </span>
              )}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {onShowRequestDashboard && (
              <button
                onClick={onShowRequestDashboard}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Solicitações
              </button>
            )}
            {onShowExecutiveDashboard && (
              <button
                onClick={onShowExecutiveDashboard}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
              >
                Executivo
              </button>
            )}
            {onReload && (
              <button
                onClick={onReload}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Recarregar
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}