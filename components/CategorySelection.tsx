
import React from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface CategorySelectionProps {
  onSelect: (cat: Category) => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ onSelect }) => {
  const getIcon = (cat: Category) => {
    switch (cat) {
      case 'NOTES': 
        // Professional Stacked Documents icon
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          />
        );
      case 'MID QUESTION PAPERS':
        // Formal Certificate/Exam Paper icon
        return (
          <>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11V7" />
          </>
        );
      case 'ASSIGNMENTS':
        // Professional Clipboard icon
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
          />
        );
      case 'PREVIOUS YEAR SEMESTER PAPERS':
        // Archive/Library/History icon
        return (
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
          />
        );
    }
  };

  const getSubtext = (cat: Category) => {
    switch (cat) {
      case 'NOTES': return 'Comprehensive study materials and lecture summaries.';
      case 'MID QUESTION PAPERS': return 'Official internal examination archives.';
      case 'ASSIGNMENTS': return 'Curated task sheets and problem sets.';
      case 'PREVIOUS YEAR SEMESTER PAPERS': return 'Legacy university examination collection.';
      default: return '';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-indigo-400 transition-all duration-500 text-left flex flex-col h-full"
        >
          {/* Decorative Background Icon */}
          <div className="absolute -bottom-6 -right-6 p-3 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
            <svg className="w-40 h-40 text-slate-900 transform rotate-12 group-hover:rotate-0 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(cat)}
            </svg>
          </div>

          <div className="mb-8 w-14 h-14 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-lg group-hover:shadow-indigo-200 transition-all duration-500">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(cat)}
            </svg>
          </div>

          <div className="flex-grow relative z-10">
            <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 group-hover:text-indigo-600 transition-colors duration-300">
              {cat}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {getSubtext(cat)}
            </p>
          </div>

          <div className="mt-8 flex items-center text-indigo-600 text-xs font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 relative z-10">
            <span>Access Resources</span>
            <svg className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CategorySelection;
