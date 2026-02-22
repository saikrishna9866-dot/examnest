import React, { useState, useRef, useEffect } from 'react';
import { AcademicFile, Category, Subject } from '../types';
import { ADMIN_CREDENTIALS, SUBJECTS, CATEGORIES } from '../constants';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  files: AcademicFile[];
  subjects: Subject[];
  categories: Category[];
  onUpdateFiles: () => void;
  onUpdateConfig: () => void;
  onFileView: (file: AcademicFile) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isLoggedIn, 
  onLoginSuccess, 
  onLogout, 
  files, 
  subjects, 
  categories, 
  onUpdateFiles, 
  onUpdateConfig,
  onFileView 
}) => {
  const [activeTab, setActiveTab] = useState<'FILES' | 'CONFIG'>('FILES');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'ok' | 'error' | 'idle'>('idle');
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error' | 'idle'>('idle');
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const checkConnection = async () => {
    setStorageStatus('checking');
    setDbStatus('checking');
    try {
      // Check Storage
      const { error: storageError } = await supabase.storage.from('resources').list('', { limit: 1 });
      if (storageError) throw storageError;
      setStorageStatus('ok');

      // Check Database Tables
      const { error: dbError } = await supabase.from('subjects').select('count', { count: 'exact', head: true });
      if (dbError) {
        if (dbError.message.includes('schema cache') || dbError.message.includes('does not exist')) {
          setDbStatus('error');
        } else {
          throw dbError;
        }
      } else {
        setDbStatus('ok');
      }
    } catch (err: any) {
      console.error('Connection check failed:', err);
      setStorageStatus('error');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      checkConnection();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    setUsername('');
    setPassword('');
    onLogout();
  };
  
  const [newFileSubject, setNewFileSubject] = useState<Subject>('');
  const [newFileCategory, setNewFileCategory] = useState<Category>('');
  const [newFileName, setNewFileName] = useState('');

  // Dynamic Config State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingItem, setEditingItem] = useState<{ type: 'SUBJECT' | 'CATEGORY' | 'FILE', oldName: string, newName: string, id?: string } | null>(null);

  useEffect(() => {
    if (subjects.length > 0 && !newFileSubject) setNewFileSubject(subjects[0]);
    if (categories.length > 0 && !newFileCategory) setNewFileCategory(categories[0]);
  }, [subjects, categories, newFileSubject, newFileCategory]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      onLoginSuccess();
      setError('');
    } else {
      setError('Invalid credentials.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
      }
      setSelectedFile(file);
      if (!newFileName) setNewFileName(file.name.replace('.pdf', ''));
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newFileName) {
      alert('Please select a file and enter a name.');
      return;
    }

    // Limit file size to 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      alert('File is too large. Maximum size allowed is 50MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Robust filename for mobile
      const timestamp = Date.now();
      const originalName = selectedFile.name || 'document.pdf';
      const cleanName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
      const filePath = `${timestamp}_${cleanName}`;

      console.log('Starting upload:', { filePath, size: selectedFile.size, type: selectedFile.type });

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false // Changed to false for better reliability on mobile retries
        });

      if (uploadError) {
        console.error('Supabase Storage Error:', uploadError);
        if (uploadError.message === 'Failed to fetch') {
          throw new Error('Network Error: Failed to fetch. This usually means a CORS issue or the "resources" bucket is not PUBLIC. Please check your Supabase Storage settings.');
        }
        throw new Error(`Storage Error: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('academic_files')
        .insert([{
          subject: newFileSubject,
          category: newFileCategory,
          file_name: newFileName,
          file_url: publicUrl,
          storage_path: filePath
        }]);

      if (dbError) {
        throw new Error(`Database Error: ${dbError.message}`);
      }

      alert('File uploaded successfully!');
      onUpdateFiles();
      
      setNewFileName('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err: any) {
      console.error('Upload Process Failed:', err);
      alert(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (file: AcademicFile) => {
    if (!confirm(`Delete "${file.fileName}"? This cannot be undone.`)) return;
    
    try {
      const { error: dbError } = await supabase
        .from('academic_files')
        .delete()
        .eq('id', file.id);
      
      if (dbError) throw dbError;

      onUpdateFiles();
      alert('File deleted.');
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  // Dynamic Config Handlers
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const { error } = await supabase.from('subjects').insert([{ name: newSubjectName.trim() }]);
      if (error) throw error;
      setNewSubjectName('');
      onUpdateConfig();
    } catch (err: any) {
      alert(`Error adding subject: ${err.message}`);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim() }]);
      if (error) throw error;
      setNewCategoryName('');
      onUpdateConfig();
    } catch (err: any) {
      alert(`Error adding category: ${err.message}`);
    }
  };

  const handleDeleteConfig = async (type: 'SUBJECT' | 'CATEGORY', name: string) => {
    if (!confirm(`Delete ${type.toLowerCase()} "${name}"? This might affect existing files.`)) return;
    const table = type === 'SUBJECT' ? 'subjects' : 'categories';
    try {
      const { error } = await supabase.from(table).delete().eq('name', name);
      if (error) throw error;
      onUpdateConfig();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const handleRenameConfig = async () => {
    if (!editingItem || !editingItem.newName.trim()) return;
    
    const newName = editingItem.newName.trim();
    const oldName = editingItem.oldName;
    
    try {
      if (editingItem.type === 'FILE') {
        if (!editingItem.id) return;
        const { error } = await supabase
          .from('academic_files')
          .update({ file_name: newName })
          .eq('id', editingItem.id);
        
        if (error) throw error;
      } else {
        const table = editingItem.type === 'SUBJECT' ? 'subjects' : 'categories';
        
        // 1. Update the config table
        const { error: configError } = await supabase
          .from(table)
          .update({ name: newName })
          .eq('name', oldName);
        
        if (configError) throw configError;
        
        // 2. Update all files that use this config
        const column = editingItem.type === 'SUBJECT' ? 'subject' : 'category';
        const { error: filesError } = await supabase
          .from('academic_files')
          .update({ [column]: newName })
          .eq(column, oldName);
          
        if (filesError) throw filesError;
      }
      
      setEditingItem(null);
      await onUpdateConfig();
      await onUpdateFiles();
      alert('Changes saved successfully!');
    } catch (err: any) {
      console.error('Rename operation failed:', err);
      alert(`Update Failed: ${err.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-12 animate-fade-in">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
            <p className="text-slate-500 text-sm mt-1">Authenticate to manage Exam Nest</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all pl-11"
                placeholder="Username"
                required
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all pl-11 pr-11"
                placeholder="Password"
                required
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex flex-col">
            <p className="text-indigo-400 font-medium tracking-wide">Artificial Intelligence Department</p>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Made By Saikrishna tadi</p>
          </div>
          <div className="flex mt-6 space-x-2">
            <button 
              onClick={() => setActiveTab('FILES')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'FILES' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Files
            </button>
            <button 
              onClick={() => setActiveTab('CONFIG')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'CONFIG' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Structure
            </button>
          </div>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative z-10">
          <div className="text-center md:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Total Resources</p>
            <p className="text-4xl font-black text-white">{files.length}</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="group flex items-center space-x-2 bg-white/10 hover:bg-red-500/20 text-white px-5 py-3 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all"
          >
            <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-scale-up border border-slate-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Confirm Logout</h3>
            <p className="text-slate-500 text-center mb-8 font-medium">Are you sure you want to exit the admin dashboard?</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Stay
              </button>
              <button 
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FILES' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {(storageStatus === 'error' || dbStatus === 'error') && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] animate-fade-in shadow-xl shadow-amber-900/5">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight leading-none mb-2">
                    {dbStatus === 'error' ? 'Database Setup Required' : 'Storage Setup Required'}
                  </h4>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    {dbStatus === 'error' 
                      ? 'The database tables are missing. You need to run the SQL query to create them.'
                      : 'Your Supabase project is connected, but the Storage Bucket is not configured correctly.'}
                  </p>
                  <button 
                    onClick={() => setShowSetupGuide(true)}
                    className="w-full bg-amber-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                  >
                    Open Setup Guide
                  </button>
                  <button 
                    onClick={checkConnection}
                    className="w-full mt-2 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:underline"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSetupGuide && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl animate-scale-up border border-slate-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Supabase Setup Guide</h3>
                    <p className="text-slate-500 font-medium">Follow these 3 steps to fix the storage error permanently.</p>
                  </div>
                  <button onClick={() => setShowSetupGuide(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="flex space-x-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">1</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg mb-2">Create the Bucket</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Go to your Supabase Dashboard → <strong>Storage</strong>. Click "New Bucket" and name it exactly:
                      </p>
                      <div className="mt-3 p-3 bg-slate-100 rounded-xl font-mono text-indigo-600 font-bold flex justify-between items-center">
                        <span>resources</span>
                        <button onClick={() => navigator.clipboard.writeText('resources')} className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Copy</button>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">2</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg mb-2">Make it Public</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        When creating the bucket (or in bucket settings), toggle the <strong>"Public"</strong> switch to ON. This allows the app to generate shareable links for your PDFs.
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">3</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg mb-2">Configure CORS</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Go to <strong>Storage → Settings → CORS</strong>. Add a new row:
                      </p>
                      <ul className="mt-3 space-y-2 text-xs font-medium text-slate-500">
                        <li className="flex justify-between border-b border-slate-100 pb-1"><span>Allowed Origins:</span> <span className="text-slate-900">*</span></li>
                        <li className="flex justify-between border-b border-slate-100 pb-1"><span>Allowed Methods:</span> <span className="text-slate-900">GET, POST, PUT, DELETE</span></li>
                        <li className="flex justify-between border-b border-slate-100 pb-1"><span>Allowed Headers:</span> <span className="text-slate-900">*</span></li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-black">4</div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-lg mb-2">CRITICAL: Create Database Tables</h4>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        The "Schema Cache" error means your database is empty. I cannot do this for you, but you can do it in 30 seconds:
                      </p>
                      
                      <div className="space-y-4">
                        <a 
                          href="https://supabase.com/dashboard/project/ygylsbivacokhooqzsqe/sql/new" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>1. Open My Supabase SQL Editor</span>
                        </a>

                        <div className="relative group">
                          <pre className="p-4 bg-slate-900 text-indigo-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-[300px] border border-slate-800">
{`-- 1. Create Academic Files table
CREATE TABLE IF NOT EXISTS academic_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  upload_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Public Access
ALTER TABLE academic_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON academic_files FOR ALL USING (true);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON subjects FOR ALL USING (true);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON categories FOR ALL USING (true);`}
                          </pre>
                          <button 
                            onClick={() => {
                              const sql = `-- 1. Create Academic Files table\nCREATE TABLE IF NOT EXISTS academic_files (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  subject TEXT NOT NULL,\n  category TEXT NOT NULL,\n  file_name TEXT NOT NULL,\n  file_url TEXT NOT NULL,\n  storage_path TEXT NOT NULL,\n  upload_date DATE DEFAULT CURRENT_DATE,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\n-- 2. Create Subjects table\nCREATE TABLE IF NOT EXISTS subjects (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT UNIQUE NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\n-- 3. Create Categories table\nCREATE TABLE IF NOT EXISTS categories (\n  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,\n  name TEXT UNIQUE NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\n-- 4. Enable Public Access\nALTER TABLE academic_files ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow all access" ON academic_files FOR ALL USING (true);\nALTER TABLE subjects ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow all access" ON subjects FOR ALL USING (true);\nALTER TABLE categories ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow all access" ON categories FOR ALL USING (true);`;
                              navigator.clipboard.writeText(sql);
                              alert('SQL Copied! Now paste it in the Supabase tab you just opened and click RUN.');
                            }}
                            className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                          >
                            2. Copy All SQL
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                          3. Paste in Supabase & Click "RUN"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-6">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black">5</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg mb-2">Add Storage Policies</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Go to <strong>Storage → Policies</strong>. Click "New Policy" for the <strong>resources</strong> bucket:
                      </p>
                      <ul className="mt-3 space-y-3">
                        <li className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Policy 1: Public Access</p>
                          <p className="text-[11px] text-slate-500">Choose "Get started quickly" → "Give users access to all files" → "SELECT" → "Public".</p>
                        </li>
                        <li className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Policy 2: Upload Access</p>
                          <p className="text-[11px] text-slate-500">Choose "Get started quickly" → "Give users access to all files" → "INSERT" → "Public".</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                    <strong>Note:</strong> After completing these steps, click the "Retry Connection" button or refresh the page. The error will disappear and you'll be able to upload files.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setShowSetupGuide(false);
                    checkConnection();
                  }}
                  className="w-full mt-8 bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl"
                >
                  I've completed the setup
                </button>
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Upload Resource
            </h3>
            <form onSubmit={handleAddFile} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Subject Area</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newFileSubject}
                  onChange={(e) => setNewFileSubject(e.target.value as Subject)}
                >
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newFileCategory}
                  onChange={(e) => setNewFileCategory(e.target.value as Category)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Display Title</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="e.g. Unit 1 Complete Notes"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PDF Document</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-input"
                    required
                  />
                  <label 
                    htmlFor="file-input"
                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-white hover:border-indigo-400 cursor-pointer transition-all group"
                  >
                    <svg className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs text-slate-500 font-medium text-center truncate w-full px-2">
                      {selectedFile ? selectedFile.name : 'Click to select PDF'}
                    </span>
                  </label>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isUploading}
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center space-x-2 ${
                  isUploading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    <span>Upload to Exam Nest</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Resource Inventory</h3>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                    <th className="p-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Document</th>
                    <th className="p-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Type & Subject</th>
                    <th className="p-5 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-20 text-center">
                        <div className="text-slate-300 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-slate-400 font-medium italic">Your library is currently empty.</p>
                      </td>
                    </tr>
                  ) : (
                    files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-5">
                          <div className="flex items-center">
                            <p className="font-bold text-slate-700">{file.fileName}</p>
                            <button 
                              onClick={() => setEditingItem({ type: 'FILE', oldName: file.fileName, newName: file.fileName, id: file.id })}
                              className="ml-2 p-1 text-slate-400 hover:text-indigo-600 transition-all"
                              title="Rename File"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                          <button 
                            onClick={() => onFileView(file)}
                            className="text-[10px] text-indigo-500 font-bold hover:underline"
                          >
                            View File
                          </button>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col space-y-1">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit flex items-center">
                              {file.category}
                              <button 
                                onClick={() => setEditingItem({ type: 'CATEGORY', oldName: file.category, newName: file.category })}
                                className="ml-1.5 text-indigo-300 hover:text-indigo-600 transition-all"
                                title="Rename Category Globally"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit flex items-center">
                              {file.subject}
                              <button 
                                onClick={() => setEditingItem({ type: 'SUBJECT', oldName: file.subject, newName: file.subject })}
                                className="ml-1.5 text-slate-300 hover:text-indigo-600 transition-all"
                                title="Rename Subject Globally"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleDeleteFile(file)} 
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-[10px] font-bold uppercase tracking-widest"
                              title="Delete Resource"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                            <button 
                              onClick={() => setEditingItem({ type: 'FILE', oldName: file.fileName, newName: file.fileName, id: file.id })}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-[10px] font-bold uppercase tracking-widest"
                              title="Rename Resource"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>Rename</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Subjects Management */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Manage Subjects
            </h3>
            <form onSubmit={handleAddSubject} className="flex space-x-2 mb-8">
              <input 
                type="text" 
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="New Subject Name"
                className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button type="submit" className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                Add
              </button>
            </form>
            <div className="space-y-3">
              {subjects.map(sub => (
                <div key={sub} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                  <span className="font-bold text-slate-700">{sub}</span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingItem({ type: 'SUBJECT', oldName: sub, newName: sub })}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteConfig('SUBJECT', sub)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Management */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
              Manage Sections
            </h3>
            <form onSubmit={handleAddCategory} className="flex space-x-2 mb-8">
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Section Name"
                className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button type="submit" className="px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">
                Add
              </button>
            </form>
            <div className="space-y-3">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                  <span className="font-bold text-slate-700">{cat}</span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingItem({ type: 'CATEGORY', oldName: cat, newName: cat })}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteConfig('CATEGORY', cat)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-scale-up border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Rename {editingItem.type}</h3>
            <p className="text-slate-500 mb-6 font-medium">
              {editingItem.type === 'FILE' 
                ? 'Update the display title for this document.' 
                : 'Changing this will update all existing files associated with it.'}
            </p>
            <input 
              type="text" 
              value={editingItem.newName}
              onChange={(e) => setEditingItem({ ...editingItem, newName: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-6"
              autoFocus
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => setEditingItem(null)}
                className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRenameConfig}
                className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
