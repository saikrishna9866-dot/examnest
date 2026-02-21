
import React from 'react';
import { SUBJECTS } from '../constants';
import { Subject } from '../types';

interface SubjectGridProps {
  subjects: Subject[];
  onSelect: (sub: Subject) => void;
}

const SubjectGrid: React.FC<SubjectGridProps> = ({ subjects, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {subjects.map((subject) => (
        <button
          key={subject}
          onClick={() => onSelect(subject)}
          className="bg-white px-6 py-8 rounded-xl shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center font-bold text-slate-700"
        >
          <span className="block text-xs uppercase tracking-widest text-indigo-500 mb-1">Subject</span>
          {subject}
        </button>
      ))}
    </div>
  );
};

export default SubjectGrid;
