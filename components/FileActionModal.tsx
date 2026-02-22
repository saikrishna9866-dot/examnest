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
  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

  const handleDownload = async (e: React.MouseEvent, url: string, fileName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0">
      {/* Backdrop - not visible on mobile as content is fullscreen */}
      <div 
        className="absolute inset-0 bg-slate-900"
        onClick={onClose}
      ></div>
      
      {/* Modal Content - Fullscreen for mobile app feel */}
      <div className="relative bg-white w-full h-full flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {!viewingFile ? (
          <>
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden safe-top">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <button 
                onClick={onClose}
                className="absolute top-6 right-4 p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative z-10 pt-4">
                <span className="inline-block px-3 py-1 bg-indigo-600 text-[10px] font-black rounded-full mb-4 tracking-widest uppercase shadow-lg shadow-indigo-600/20">Resources</span>
                <h2 className="text-3xl font-black mb-1 tracking-tight leading-tight">{subject}</h2>
                <p className="text-slate-400 font-medium text-lg">{category}</p>
              </div>
            </div>

            <div className="flex-grow p-4 overflow-y-auto scroll-smooth bg-slate-50">
              {files.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-bold text-lg">Coming Soon!</p>
                  <p className="text-slate-400 text-sm mt-1">Our team is uploading these resources.</p>
                </div>
              ) : (
                <div className="grid gap-4 pb-8">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="group flex flex-col p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm active:scale-[0.98] transition-all duration-200"
                      onClick={() => setViewingFile(file)}
                    >
                      <div className="mb-6">
                        <h4 className="font-black text-slate-800 text-xl leading-tight">{file.fileName}</h4>
                        <div className="flex items-center mt-2 space-x-3">
                           <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">PDF Document</span>
                           <p className="text-xs text-slate-400 font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {file.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          className="flex-grow py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-slate-200 flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                          </svg>
                          <span>VIEW NOW</span>
                        </button>
                        <button 
                          onClick={(e) => handleDownload(e, file.fileUrl, file.fileName)}
                          className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold border border-indigo-100 active:scale-95 transition-all flex items-center justify-center"
                          title="Download PDF"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full w-full">
            <div className="bg-slate-900 px-4 py-4 flex items-center justify-between text-white border-b border-white/5 safe-top">
              <div className="flex items-center overflow-hidden flex-1">
                <button 
                  onClick={() => setViewingFile(null)}
                  className="mr-3 p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="truncate">
                  <h3 className="font-black text-sm truncate tracking-tight leading-tight">{viewingFile.fileName}</h3>
                  <p className="text-[9px] text-indigo-400 font-black tracking-widest uppercase leading-none mt-1">{subject} • {category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={(e) => handleDownload(e, viewingFile.fileUrl, viewingFile.fileName)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-grow bg-slate-100 relative">
               {iframeLoading && (
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
                   <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="mt-4 text-slate-500 font-black text-[10px] tracking-widest uppercase">Preparing Document</p>
                 </div>
               )}
               
               <iframe 
                src={`${viewingFile.fileUrl}#toolbar=0&navpanes=0&view=FitH`}
                className={`w-full h-full bg-white transition-opacity duration-500 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
                title="Document Viewer"
                onLoad={handleIframeLoad}
                frameBorder="0"
               ></iframe>

               {/* Mobile floating prompt */}
               <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none">
                 <a 
                   href={viewingFile.fileUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black shadow-2xl active:scale-95 transition-all flex items-center space-x-3 border border-white/10"
                 >
                   <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                   <span>OPEN NATIVE VIEW</span>
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