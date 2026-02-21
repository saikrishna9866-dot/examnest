import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface FooterProps {
  onCategoryClick: (cat: Category) => void;
}

const Footer: React.FC<FooterProps> = ({ onCategoryClick }) => {
  return (
    <footer className="bg-slate-900 text-white mt-12 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Categories Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Categories
            </h3>
            <ul className="space-y-4">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => onCategoryClick(cat)}
                    className="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center group"
                  >
                    <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About Admin Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
              About Admin
            </h3>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="mb-4">
                <h4 className="font-bold text-lg text-indigo-400 leading-tight">From Artificial Intelligence Department</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Made By Saikrishna tadi</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-700/50">
                <div className="flex items-center text-sm text-slate-400">
                  <span className="w-20 font-bold text-slate-500 uppercase text-[10px]">Email</span>
                  <a href="mailto:examnest01@gmail.com" className="text-indigo-400 hover:underline truncate">examnest01@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Exam Nest. All Rights Reserved.</p>
          <div className="flex space-x-6 uppercase tracking-widest font-bold">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;