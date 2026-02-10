
import React, { useState, useEffect } from 'react';
import { ExerciseSession, ExerciseType } from '../types';

interface HistoryViewProps {
  sessions: ExerciseSession[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions }) => {
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    // Simulate fetching from Cloudant DB
    const timer = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isSyncing && sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-in fade-in duration-500">
        <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-8 border-4 border-white shadow-inner">
          <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-3xl font-black text-gray-800 mb-3">Your Book is Empty</h3>
        <p className="text-gray-400 font-medium max-w-sm mx-auto mb-10">
          History isn't made by sitting still. Start your first session and we'll track every milestone.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-10 py-4 premium-gradient text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const totalPoints = sessions.reduce((acc, s) => acc + s.reward, 0);
  const totalReps = sessions.reduce((acc, s) => acc + s.counter, 0);
  const avgIntensity = sessions.length > 0 ? "Optimal" : "N/A";

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Sync Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-gray-800 tracking-tight">Activity Log</h2>
            {isSyncing ? (
              <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Syncing Cloudant...
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                Data Secure
              </span>
            )}
          </div>
          <p className="text-gray-400 font-medium">Tracking your path to wellness, one rep at a time.</p>
        </div>
      </div>

      {/* Summary Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Total Wellness Points" value={totalPoints} icon="💎" color="teal" />
        <SummaryCard label="Completed Repetitions" value={totalReps} icon="🔄" color="blue" />
        <SummaryCard label="Performance Status" value={avgIntensity} icon="📈" color="purple" />
      </div>

      {/* Detailed Chronological History */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] px-2 mb-4">Recent Sessions</h3>
        {sessions.map((session, index) => (
          <HistoryItem key={session.id} session={session} index={index} />
        ))}
      </div>
    </div>
  );
};

// Use React.FC to correctly handle the special 'key' prop when components are rendered in a list
const SummaryCard: React.FC<{ label: string, value: string | number, icon: string, color: 'teal' | 'blue' | 'purple' }> = ({ label, value, icon, color }) => {
  const colorMap = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className={`p-8 rounded-[40px] border premium-shadow bg-white flex flex-col justify-between h-44 relative overflow-hidden group hover:-translate-y-1 transition-transform`}>
      <div className="flex justify-between items-start z-10">
        <span className="text-2xl">{icon}</span>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colorMap[color]}`}>Live Stats</div>
      </div>
      <div className="z-10">
        <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-800 tracking-tighter">{value}</p>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-125 transition-transform ${color === 'teal' ? 'bg-teal-400' : color === 'blue' ? 'bg-blue-400' : 'bg-purple-400'}`} />
    </div>
  );
};

// Use React.FC to correctly handle the special 'key' prop when components are rendered in a list
const HistoryItem: React.FC<{ session: ExerciseSession, index: number }> = ({ session, index }) => {
  const isMeditation = session.exercise === ExerciseType.MEDITATION;
  
  return (
    <div 
      className="bg-white p-6 rounded-[32px] premium-shadow border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-teal-300 transition-all group animate-in slide-in-from-bottom-2 fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-6 w-full sm:w-auto">
        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 ${
          isMeditation ? 'bg-purple-50 text-purple-500' : 'bg-teal-50 text-teal-500'
        }`}>
          {session.exercise === ExerciseType.NECK_TILT && '🦒'}
          {session.exercise === ExerciseType.HEAD_MOVEMENT && '🔄'}
          {session.exercise === ExerciseType.SHOULDER_SHRUG && '💪'}
          {session.exercise === ExerciseType.MEDITATION && '🧘'}
        </div>
        <div>
          <h4 className="text-xl font-black text-gray-800 capitalize tracking-tight">
            {session.exercise.replace('_', ' ')}
          </h4>
          <div className="flex items-center gap-3 text-gray-400 mt-1 font-medium">
            <span className="text-[10px] flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className="text-[10px] flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
        <div className="text-center sm:text-right">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Impact</p>
          <p className="text-lg font-black text-gray-700">{session.counter} <span className="text-[10px] text-gray-400">reps</span></p>
        </div>
        <div className="bg-[#2C3E50] text-white px-6 py-3 rounded-2xl shadow-xl min-w-[100px] text-center transform group-hover:scale-105 transition-transform">
          <p className="text-[9px] uppercase font-black tracking-widest opacity-60 mb-0.5">Reward</p>
          <p className="text-xl font-black">+{session.reward}</p>
        </div>
      </div>
    </div>
  );
};
