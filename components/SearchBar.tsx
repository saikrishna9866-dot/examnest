import React, { useState, useEffect, useRef } from 'react';
import { AcademicFile } from '../types';

interface SearchBarProps {
  files: AcademicFile[];
  onFileSelect: (file: AcademicFile) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ files, onFileSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AcademicFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = files.filter(file => 
        file.fileName.toLowerCase().includes(query.toLowerCase()) ||
        file.subject.toLowerCase().includes(query.toLowerCase()) ||
        file.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, files]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto mb-12 z-50">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all text-lg"
          placeholder="Search for notes, papers, or subjects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-scale-up">
          <div className="max-h-96 overflow-y-auto">
            {results.map((file) => (
              <button
                key={file.id}
                onClick={() => {
                  onFileSelect(file);
                  setIsOpen(false);
                  setQuery('');
                }}
                className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{file.fileName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{file.subject}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">{file.category}</span>
                    </div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length > 1 && results.length === 0 && (
        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 text-center animate-scale-up">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No resources found for "{query}"</p>
          <p className="text-slate-400 text-sm mt-1">Try searching for a different keyword or subject.</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
