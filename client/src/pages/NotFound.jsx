import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
          <Compass className="w-12 h-12 stroke-[1.5]" />
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
            404
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Lost in the Campus Quad?
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            The page or listing you are looking for doesn't exist, has been archived, or was moved elsewhere.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
