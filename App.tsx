
import React, { useState, useEffect } from 'react';
import { ViewState, Category, Subject, AcademicFile } from './types';
import { CATEGORIES, SUBJECTS } from './constants';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import CategorySelection from './components/CategorySelection';
import SubjectGrid from './components/SubjectGrid';
import AdminPanel from './components/AdminPanel';
import FileActionModal from './components/FileActionModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [files, setFiles] = useState<AcademicFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch files from Supabase
  const fetchFiles = async () => {
    setLoading(true);
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
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        currentView={currentView} 
        onNavigateHome={navigateHome}
        onNavigateAdmin={() => setCurrentView('ADMIN')}
      />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {loading && currentView !== 'ADMIN' && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Fetching Resources...</p>
          </div>
        )}

        {!loading && currentView === 'HOME' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Select a Resource Category</h2>
              <p className="text-slate-600">Access curated study materials, papers, and assignments for R23.</p>
            </div>
            <CategorySelection onSelect={handleCategoryClick} />
          </div>
        )}

        {!loading && currentView === 'SUBJECT_LIST' && selectedCategory && (
          <div className="animate-fade-in">
            <button 
              onClick={navigateHome}
              className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Categories
            </button>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800">{selectedCategory}</h2>
              <p className="text-slate-500 mt-2">Choose a subject to view available documents.</p>
            </div>
            <SubjectGrid onSelect={handleSubjectClick} />
          </div>
        )}

        {currentView === 'ADMIN' && (
          <AdminPanel 
            isLoggedIn={isAdminLoggedIn} 
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            files={files}
            onUpdateFiles={fetchFiles}
          />
        )}
      </main>

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
