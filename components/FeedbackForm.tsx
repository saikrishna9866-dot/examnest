import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const FeedbackForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('feedback')
        .insert([{ name, email, message }]);

      if (dbError) throw dbError;

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      // Even if table doesn't exist, we'll show a success message for demo purposes 
      // but log the error. In a real app, the table must exist.
      setError('Could not submit feedback. Please try again later.');
      
      // Fallback for demo: if it's a "relation does not exist" error, 
      // we might want to still show "Success" if we want to be optimistic, 
      // but better to show error.
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[2.5rem] text-center animate-scale-up">
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Thank You!</h3>
        <p className="text-slate-600 font-medium">Your feedback has been received. We appreciate your input.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-8 text-emerald-600 font-bold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="mb-10 text-center md:text-left">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Send Us Feedback</h3>
        <p className="text-slate-500 font-medium">Have suggestions or found an issue? Let us know!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800"
              placeholder="john@example.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Your Message</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-800 resize-none"
            placeholder="Tell us what's on your mind..."
          />
        </div>

        {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center space-x-3 ${
            isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600 hover:-translate-y-1 active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Submit Feedback</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
