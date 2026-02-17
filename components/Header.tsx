
import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigateHome, onNavigateAdmin }) => {
  return (
    <header className="hero-gradient text-white shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div 
          onClick={onNavigateHome}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Nest</h1>
        </div>

        <nav className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={onNavigateHome}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              currentView !== 'ADMIN' 
                ? 'bg-white text-slate-900 shadow-md' 
                : 'hover:bg-white/10 text-white'
            }`}
          >
            HOME
          </button>
          <button 
            onClick={onNavigateAdmin}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              currentView === 'ADMIN' 
                ? 'bg-amber-500 text-slate-900 shadow-md' 
                : 'hover:bg-white/10 text-white'
            }`}
          >
            ADMIN
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
