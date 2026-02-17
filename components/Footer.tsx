
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
    
    // Construct mailto link
    const subject = encodeURIComponent("Exam Nest Feedback");
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:examnest01@gmail.com?subject=${subject}&body=${body}`;
    
    setFeedback('');
    alert('Thank you for your feedback! Opening your email client...');
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
              Help us make this better! Send us your comments or improvement ideas.
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                Send Feedback
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
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-xl mr-4 border-2 border-slate-700">TS</div>
                <div>
                  <h4 className="font-bold text-lg">T. Saikrishna</h4>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div className="flex items-center text-sm text-slate-400">
                  <span className="w-20 font-bold text-slate-500 uppercase text-[10px]">Student ID</span>
                  <span>24A3143C8</span>
                </div>
                <div className="flex items-center text-sm text-slate-400">
                  <span className="w-20 font-bold text-slate-500 uppercase text-[10px]">Department</span>
                  <span>CAI-B</span>
                </div>
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
