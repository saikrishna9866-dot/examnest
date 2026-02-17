
import React, { useState } from 'react';
import { Subject, Category, AcademicFile } from '../types';

interface FileActionModalProps {
  subject: Subject;
  category: Category;
  files: AcademicFile[];
  onClose: () => void;
}

const FileActionModal: React.FC<FileActionModalProps> = ({ subject, category, files, onClose }) => {
  const [viewingFile, setViewingFile] = useState<AcademicFile | null>(null);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        {!viewingFile ? (
          <>
            <div className="bg-slate-900 p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="inline-block px-3 py-1 bg-indigo-500 text-xs font-bold rounded-full mb-3 tracking-widest uppercase">Resources</span>
              <h2 className="text-3xl font-bold mb-1">{subject}</h2>
              <p className="text-slate-400">{category}</p>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">No files available for this section yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-all"
                    >
                      <div className="mb-4 md:mb-0">
                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{file.fileName}</h4>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Added on {file.uploadDate}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setViewingFile(file)}
                          className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <a 
                          href={file.fileUrl} 
                          download 
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 md:flex-none px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center border border-slate-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-[80vh] w-full">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center overflow-hidden">
                <button 
                  onClick={() => setViewingFile(null)}
                  className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="truncate">
                  <h3 className="font-bold text-sm truncate">{viewingFile.fileName}</h3>
                  <p className="text-[10px] text-slate-400 tracking-wider uppercase">{subject} • {category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={viewingFile.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Open in New Tab"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-grow bg-slate-100 flex items-center justify-center p-4">
               {/* PDF Simulator (Standard browser view) */}
               <iframe 
                src={`${viewingFile.fileUrl}#toolbar=0`}
                className="w-full h-full rounded-lg shadow-xl bg-white"
                title="Document Viewer"
               ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileActionModal;
