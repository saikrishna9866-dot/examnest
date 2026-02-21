import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, Category, Subject, AcademicFile } from './types';
import { CATEGORIES as DEFAULT_CATEGORIES, SUBJECTS as DEFAULT_SUBJECTS } from './constants';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import CategorySelection from './components/CategorySelection';
import SubjectGrid from './components/SubjectGrid';
import AdminPanel from './components/AdminPanel';
import FileActionModal from './components/FileActionModal';
import PdfViewerModal from './components/PdfViewerModal';
import SearchBar from './components/SearchBar';
import RecentUploads from './components/RecentUploads';

const CACHE_KEY = 'exam_nest_files_cache';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [files, setFiles] = useState<AcademicFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<AcademicFile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchConfig = useCallback(async () => {
    try {
      const { data: subData } = await supabase.from('subjects').select('name').order('name');
      const { data: catData } = await supabase.from('categories').select('name').order('name');

      if (subData && subData.length > 0) {
        setSubjects(subData.map(s => s.name));
      } else {
        setSubjects(DEFAULT_SUBJECTS);
      }

      if (catData && catData.length > 0) {
        setCategories(catData.map(c => c.name));
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
      setSubjects(DEFAULT_SUBJECTS);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  // Quick initial load from Cache
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFiles(parsed);
        setLoading(false); // Immediate transition if we have cache
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
  }, []);

  // Fetch files from Supabase with background update
  const fetchFiles = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setLoading(true);
    setFetchError(null);
    
    try {
      const { data, error } = await supabase
        .from('academic_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedFiles: AcademicFile[] = data.map(item => ({
          id: item.id,
          subject: item.subject as Subject,
          category: item.category as Category,
          fileName: item.file_name,
          fileUrl: item.file_url,
          uploadDate: new Date(item.created_at).toLocaleDateString()
        }));
        setFiles(formattedFiles);
        // Persist for next fast load
        localStorage.setItem(CACHE_KEY, JSON.stringify(formattedFiles));
      }
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setFetchError(err.message || 'Failed to connect to the database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchConfig();
  }, [fetchFiles, fetchConfig]);

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    setCurrentView('SUBJECT_LIST');
  };

  const handleSubjectClick = (sub: Subject) => {
    setSelectedSubject(sub);
  };

  const navigateHome = () => {
    setCurrentView('HOME');
    setSelectedCategory(null);
    setSelectedSubject(null);
  };

  const handleFileSelect = (file: AcademicFile) => {
    setViewingFile(file);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header 
        currentView={currentView} 
        onNavigateHome={navigateHome}
        onNavigateAdmin={() => setCurrentView('ADMIN')}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {fetchError && currentView !== 'ADMIN' && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl text-center mb-8 animate-fade-in">
            <p className="text-red-800 font-bold">Database Connection Issue</p>
            <p className="text-red-600 text-sm mt-1">{fetchError}</p>
            <button 
              onClick={() => fetchFiles(true)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {loading && files.length === 0 && currentView !== 'ADMIN' && !fetchError && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute top-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-500 font-semibold tracking-wide animate-pulse">OPTIMIZING RESOURCES...</p>
          </div>
        )}

        {(!loading || files.length > 0) && currentView === 'HOME' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">R23 Resource Hub</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg mb-8">Curated materials optimized for quick access. Pick a category to get started.</p>
              
              <SearchBar files={files} onFileSelect={handleFileSelect} />
            </div>

            <RecentUploads files={files} onFileClick={handleFileSelect} />

            <div className="mb-16">
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-px flex-grow bg-slate-200"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Explore Categories</h3>
                <div className="h-px flex-grow bg-slate-200"></div>
              </div>
              <CategorySelection 
                categories={categories}
                onSelect={handleCategoryClick} 
              />
            </div>
          </div>
        )}

        {(!loading || files.length > 0) && currentView === 'SUBJECT_LIST' && selectedCategory && (
          <div className="animate-fade-in">
            <button 
              onClick={navigateHome}
              className="mb-8 group flex items-center text-slate-500 hover:text-indigo-600 font-bold transition-all"
            >
              <div className="mr-2 p-1.5 bg-white border border-slate-200 rounded-lg group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:-translate-x-1 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              Back to Categories
            </button>
            <div className="mb-10">
              <span className="text-xs font-black tracking-widest text-indigo-500 uppercase px-3 py-1 bg-indigo-50 rounded-full mb-3 inline-block">Selected Category</span>
              <h2 className="text-4xl font-black text-slate-900">{selectedCategory}</h2>
            </div>
            <SubjectGrid 
              subjects={subjects}
              onSelect={handleSubjectClick} 
            />
          </div>
        )}

        {currentView === 'ADMIN' && (
          <AdminPanel 
            isLoggedIn={isAdminLoggedIn} 
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            onLogout={() => setIsAdminLoggedIn(false)}
            files={files}
            subjects={subjects}
            categories={categories}
            onUpdateFiles={() => fetchFiles(true)}
            onUpdateConfig={fetchConfig}
            onFileView={handleFileSelect}
          />
        )}
      </main>

      {viewingFile && (
        <PdfViewerModal 
          file={viewingFile} 
          onClose={() => setViewingFile(null)} 
        />
      )}

      {selectedSubject && selectedCategory && (
        <FileActionModal 
          subject={selectedSubject}
          category={selectedCategory}
          files={files.filter(f => f.subject === selectedSubject && f.category === selectedCategory)}
          onClose={() => setSelectedSubject(null)}
        />
      )}

      <Footer onCategoryClick={handleCategoryClick} />
    </div>
  );
};

export default App;