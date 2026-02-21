import React, { useState } from 'react';
import { AcademicFile } from '../types';

interface PdfViewerModalProps {
  file: AcademicFile;
  onClose: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full h-full md:h-[95vh] md:max-w-5xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-white/10">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-white/5">
          <div className="flex items-center overflow-hidden">
            <button 
              onClick={onClose}
              className="mr-4 flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs font-black uppercase tracking-widest">Back</span>
            </button>
            <div className="truncate">
              <h3 className="font-black text-sm truncate tracking-tight">{file.fileName}</h3>
              <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">{file.subject} • {file.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a 
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
              title="Open in New Tab"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button 
              onClick={onClose}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-grow bg-slate-100 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pdf-loader-shimmer">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-black text-xs tracking-widest uppercase">Loading Document...</p>
            </div>
          )}
          
          <iframe 
            src={`${file.fileUrl}#toolbar=1&navpanes=0&view=FitH`}
            className={`w-full h-full bg-white transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
            title="Document Viewer"
            onLoad={() => setLoading(false)}
            frameBorder="0"
          ></iframe>

          {/* Mobile Fallback Prompt */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden">
            <a 
              href={file.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="bg-indigo-600 text-white px-6 py-3 rounded-full text-xs font-black shadow-2xl active:scale-95 transition-all flex items-center space-x-2"
            >
              <span>FULLSCREEN VIEW</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
