
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
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
      case 'MID QUESTION PAPERS':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />;
      case 'ASSIGNMENTS':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />;
      case 'PREVIOUS YEAR SEMESTER PAPERS':
        return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 text-left"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-indigo-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(cat)}
            </svg>
          </div>
          <div className="mb-6 w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(cat)}
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
            {cat}
          </h3>
          <p className="text-slate-500 text-sm">Explore all available {cat.toLowerCase()} organized by subject.</p>
          <div className="mt-4 flex items-center text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
            View Subjects
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CategorySelection;
