import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="p-8 sm:p-12 rounded-3xl bg-[#121824] border border-white/10 text-center max-w-md w-full shadow-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto mb-4">
          <Radio className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
        <h2 className="text-lg font-bold text-slate-200 mb-2">Lost in Space</h2>
        <p className="text-xs text-slate-400 mb-6">
          The Orbit coordinate or page you are seeking does not exist or has rotated out of range.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
