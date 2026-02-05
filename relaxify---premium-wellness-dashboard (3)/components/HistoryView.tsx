
import React from 'react';
import { ExerciseSession } from '../types';

interface HistoryViewProps {
  sessions: ExerciseSession[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">No Sessions Yet</h3>
        <p className="text-gray-400">Complete your first exercise to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-100 flex items-center gap-12 overflow-hidden relative">
        <div className="flex-1 z-10">
          <h2 className="text-3xl font-bold mb-2">Weekly Summary</h2>
          <p className="text-gray-500">You've earned <span className="text-teal-600 font-bold">{sessions.reduce((acc, s) => acc + s.reward, 0)} points</span> this week!</p>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full premium-gradient opacity-10 rounded-l-[100px]" />
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white p-6 rounded-[30px] premium-shadow border border-gray-100 flex items-center justify-between hover:border-teal-200 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold capitalize">{session.exercise.replace('_', ' ')}</h4>
                <p className="text-xs text-gray-400 font-medium">
                  {new Date(session.timestamp).toLocaleDateString()} at {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-12 text-right">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Reps</p>
                <p className="text-xl font-bold">{session.counter}</p>
              </div>
              <div className="bg-[#2C3E50] text-white px-5 py-2 rounded-2xl">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Reward</p>
                <p className="text-lg font-bold">+{session.reward}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
