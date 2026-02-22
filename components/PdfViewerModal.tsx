import React, { useState } from 'react';
import { AcademicFile } from '../types';

interface PdfViewerModalProps {
  file: AcademicFile;
  onClose: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);

  const handleDownload = async () => {
    try {
      const response = await fetch(file.fileUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.fileName.endsWith('.pdf') ? file.fileName : `${file.fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(file.fileUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.fileName,
          text: `Check out this resource: ${file.fileName}`,
          url: file.fileUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(file.fileUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 animate-fade-in">
      {/* Backdrop - not visible on mobile as content is fullscreen */}
      <div 
        className="absolute inset-0 bg-slate-900"
        onClick={onClose}
      ></div>
      
      {/* Modal Content - Fullscreen for mobile app feel */}
      <div className="relative bg-white w-full h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header - App Bar Style */}
        <div className="bg-slate-900 px-4 py-4 flex items-center justify-between text-white border-b border-white/5 safe-top">
          <div className="flex items-center overflow-hidden flex-1">
            <button 
              onClick={onClose}
              className="mr-3 p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
              aria-label="Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="truncate">
              <h3 className="font-black text-sm truncate tracking-tight leading-tight">{file.fileName}</h3>
              <p className="text-[9px] text-indigo-400 font-black tracking-widest uppercase leading-none mt-1">{file.subject} • {file.category}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button 
              onClick={handleShare}
              className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-white"
              title="Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={handleDownload}
              className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-white"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-grow bg-slate-100 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-black text-[10px] tracking-widest uppercase">Preparing Document</p>
            </div>
          )}
          
          <iframe 
            src={`${file.fileUrl}#toolbar=0&navpanes=0&view=FitH`}
            className={`w-full h-full bg-white transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
            title="Document Viewer"
            onLoad={() => setLoading(false)}
            frameBorder="0"
          ></iframe>

          {/* Mobile Floating Action Button for Native View */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6 pointer-events-none">
            <a 
              href={file.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="pointer-events-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black shadow-2xl active:scale-95 transition-all flex items-center space-x-3 border border-white/10"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>OPEN NATIVE VIEWER</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
