import React from 'react';
import { AcademicFile } from '../types';

interface RecentUploadsProps {
  files: AcademicFile[];
  onFileClick: (file: AcademicFile) => void;
}

const RecentUploads: React.FC<RecentUploadsProps> = ({ files, onFileClick }) => {
  const recentFiles = [...files].slice(0, 5);

  if (recentFiles.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recently Uploaded</h3>
          <p className="text-slate-500 text-sm mt-1">Stay updated with the latest academic resources.</p>
        </div>
        <div className="hidden md:flex space-x-1">
          <div className="w-8 h-1 bg-indigo-600 rounded-full"></div>
          <div className="w-2 h-1 bg-slate-200 rounded-full"></div>
          <div className="w-2 h-1 bg-slate-200 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {recentFiles.map((file, index) => (
          <button
            key={file.id}
            onClick={() => onFileClick(file)}
            className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-100 transition-colors"></div>
            
            <div className="relative z-10">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h4 className="font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors min-h-[3rem]">
                {file.fileName}
              </h4>
              
              <div className="space-y-1.5">
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-500">
                  <span className="truncate">{file.category}</span>
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-400">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {file.uploadDate}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentUploads;
