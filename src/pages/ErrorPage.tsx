import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="p-8 sm:p-12 rounded-3xl bg-[#121824] border border-rose-500/20 text-center max-w-md w-full shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Something Went Wrong</h1>
        <p className="text-xs text-slate-400 mb-6">
          {error?.message || 'An unexpected error occurred during orbit execution.'}
        </p>

        <div className="flex items-center justify-center gap-3">
          {resetErrorBoundary ? (
            <button
              onClick={resetErrorBoundary}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </button>
          )}

          <Link
            to="/"
            className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-all"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};
