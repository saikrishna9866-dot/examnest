import React from 'react';

const FeedbackSection: React.FC = () => {
  const [feedback, setFeedback] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    const subject = encodeURIComponent("Feedback for Exam Nest");
    const body = encodeURIComponent(feedback);
    window.location.href = `mailto:examnest01@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="my-16 animate-fade-in">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Help us improve Exam Nest!
          </h3>
          <p className="text-slate-500 text-lg font-medium mb-8">
            Share your suggestions or report issues directly to our team.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[150px] resize-none text-sm font-medium shadow-inner"
              required
            ></textarea>
            
            <button 
              type="submit"
              className="w-full md:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center justify-center space-x-3 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Submit Feedback</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
