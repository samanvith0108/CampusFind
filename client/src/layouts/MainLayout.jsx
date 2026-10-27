import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GraduationCap, Heart, ShieldCheck, HelpCircle, Mail } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {/* Sticky Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-sm tracking-tight">CampusFind</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">SST Scaler Campus Lost & Found</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
              <span className="inline-flex items-center text-slate-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Verified Student Community
              </span>
              <span>•</span>
              <a
                href="mailto:support@sst.scaler.com"
                className="hover:text-indigo-600 transition-colors inline-flex items-center"
              >
                <Mail className="w-3.5 h-3.5 mr-1" />
                support@sst.scaler.com
              </a>
            </div>

            <p className="text-slate-400">
              © {new Date().getFullYear()} CampusFind — SST Scaler Campus
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
