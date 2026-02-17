import React, { useState, useEffect } from 'react';
import { Subject, Category, AcademicFile } from '../types';

interface FileActionModalProps {
  subject: Subject;
  category: Category;
  files: AcademicFile[];
  onClose: () => void;
}

const FileActionModal: React.FC<FileActionModalProps> = ({ subject, category, files, onClose }) => {
  const [viewingFile, setViewingFile] = useState<AcademicFile | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Close viewing on file change (not needed as viewingFile changes anyway, but for clarity)
  useEffect(() => {
    setIframeLoading(true);
  }, [viewingFile]);

  // Handle PDF viewing
  // Native PDF viewer via standard iframe is usually much faster than Google's service
  // because it uses the local browser engine and cached connection to the source.
  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-up border border-white/10">
        {!viewingFile ? (
          <>
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-indigo-600 text-[10px] font-black rounded-full mb-4 tracking-widest uppercase shadow-lg shadow-indigo-600/20">Available Documents</span>
                <h2 className="text-4xl font-black mb-1 tracking-tight">{subject}</h2>
                <p className="text-slate-400 font-medium text-lg">{category}</p>
              </div>
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto scroll-smooth">
              {files.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-bold text-lg">Coming Soon!</p>
                  <p className="text-slate-400 text-sm mt-1">Our team is uploading these resources.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-[2rem] hover:bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                    >
                      <div className="mb-4 md:mb-0">
                        <h4 className="font-black text-slate-800 text-xl group-hover:text-indigo-600 transition-colors leading-tight">{file.fileName}</h4>
                        <div className="flex items-center mt-2 space-x-3">
                           <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black uppercase">PDF</span>
                           <p className="text-xs text-slate-400 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {file.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setViewingFile(file)}
                          className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                          OPEN
                        </button>
                        <a 
                          href={file.fileUrl} 
                          download 
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center group/dl"
                          title="Download PDF"
                        >
                          <svg className="w-5 h-5 group-hover/dl:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-[85vh] w-full">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-white/5">
              <div className="flex items-center overflow-hidden">
                <button 
                  onClick={() => setViewingFile(null)}
                  className="mr-4 p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="truncate">
                  <h3 className="font-black text-sm truncate tracking-tight">{viewingFile.fileName}</h3>
                  <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">{subject} • {category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href={viewingFile.fileUrl}
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
            
            <div className="flex-grow bg-slate-100 relative">
               {iframeLoading && (
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pdf-loader-shimmer">
                   <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="mt-4 text-slate-500 font-black text-xs tracking-widest uppercase">Rendering PDF Engine</p>
                 </div>
               )}
               
               {/* Native PDF Viewers are lightning fast compared to Google Docs Viewer */}
               <iframe 
                src={`${viewingFile.fileUrl}#toolbar=1&navpanes=0&view=FitH`}
                className={`w-full h-full bg-white transition-opacity duration-500 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
                title="Document Viewer"
                onLoad={handleIframeLoad}
                frameBorder="0"
               ></iframe>

               {/* Mobile floating prompt if needed */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:hidden">
                 <a 
                   href={viewingFile.fileUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="bg-indigo-600 text-white px-6 py-3 rounded-full text-xs font-black shadow-2xl active:scale-95 transition-all flex items-center space-x-2"
                 >
                   <span>NATIVE VIEW</span>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                 </a>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileActionModal;