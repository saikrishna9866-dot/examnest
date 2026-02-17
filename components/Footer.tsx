
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Category } from '../types';

interface FooterProps {
  onCategoryClick: (cat: Category) => void;
}

const Footer: React.FC<FooterProps> = ({ onCategoryClick }) => {
  const [feedback, setFeedback] = useState('');

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // Construct Gmail compose link
    const subject = encodeURIComponent("Exam Nest Feedback");
    const body = encodeURIComponent(feedback);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=examnest01@gmail.com&su=${subject}&body=${body}`;
    
    // Open in new tab
    window.open(gmailUrl, '_blank');
    
    setFeedback('');
  };

  return (
    <footer className="bg-slate-900 text-white mt-12 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Categories Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Categories
            </h3>
            <ul className="space-y-4">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button 
                    onClick={() => onCategoryClick(cat)}
                    className="text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium flex items-center group"
                  >
                    <svg className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 -ml-6 group-hover:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Feedback Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-amber-500 rounded-full mr-3"></span>
              Feedback
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Help us make this better! Send us your comments or improvement ideas via Gmail.
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm placeholder:text-slate-500"
                placeholder="Share your thoughts here..."
                rows={3}
              />
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.573l8.073-6.08c1.618-1.214 3.927-.059 3.927 1.964z"/>
                </svg>
                <span>Send via Gmail</span>
              </button>
            </form>
          </div>

          {/* About Admin Column */}
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-1 h-6 bg-emerald-500 rounded-full mr-3"></span>
              About Admin
            </h3>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="mb-4">
                <h4 className="font-bold text-lg text-indigo-400">From Artificial Intelligence Department</h4>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-700/50">
                <div className="flex items-center text-sm text-slate-400">
                  <span className="w-20 font-bold text-slate-500 uppercase text-[10px]">Email</span>
                  <a href="mailto:examnest01@gmail.com" className="text-indigo-400 hover:underline truncate">examnest01@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Exam Nest. All Rights Reserved.</p>
          <div className="flex space-x-6 uppercase tracking-widest font-bold">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
