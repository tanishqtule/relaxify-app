
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NeckTiltExercise } from './components/NeckTiltExercise';
import { HeadMovementExercise } from './components/HeadMovementExercise';
import { ShoulderShrugExercise } from './components/ShoulderShrugExercise';
import { HistoryView } from './components/HistoryView';
import { ExerciseType, ExerciseSession } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exercise' | 'history'>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [history, setHistory] = useState<ExerciseSession[]>([]);

  // Load history from localStorage (Simulating Cloudant)
  useEffect(() => {
    const saved = localStorage.getItem('relaxify_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveSession = (session: Omit<ExerciseSession, 'id' | 'timestamp'>) => {
    const newSession: ExerciseSession = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('relaxify_history', JSON.stringify(updatedHistory));
    
    // Switch back to dashboard or history
    setActiveTab('history');
  };

  const handleStartExercise = (type: ExerciseType) => {
    setSelectedExercise(type);
    setActiveTab('exercise');
  };

  return (
    <div className="flex h-screen bg-[#F4F7F6] overflow-hidden text-[#2C3E50]">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'exercise') setSelectedExercise(null);
        }} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-gray-100 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {activeTab === 'dashboard' ? 'Welcome Back' : 
               activeTab === 'exercise' ? 'Training Session' : 'Activity History'}
            </h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-teal-600">Premium User</span>
              <span className="text-xs text-gray-400">Streak: 12 Days</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold premium-shadow">
              JD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <Dashboard onStartExercise={handleStartExercise} />
          )}
          
          {activeTab === 'exercise' && selectedExercise === ExerciseType.NECK_TILT && (
            <NeckTiltExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'exercise' && selectedExercise === ExerciseType.HEAD_MOVEMENT && (
            <HeadMovementExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'exercise' && selectedExercise === ExerciseType.SHOULDER_SHRUG && (
            <ShoulderShrugExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'history' && (
            <HistoryView sessions={history} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
