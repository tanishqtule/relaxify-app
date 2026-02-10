
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NeckTiltExercise } from './components/NeckTiltExercise';
import { HeadMovementExercise } from './components/HeadMovementExercise';
import { ShoulderShrugExercise } from './components/ShoulderShrugExercise';
import { EyeFocusExercise } from './components/EyeFocusExercise';
import { HistoryView } from './components/HistoryView';
import { LoginPage } from './components/LoginPage';
import { MeditationView } from './components/MeditationView';
import { ProactiveChatbot } from './components/ProactiveChatbot';
import { MoodTracker } from './components/MoodTracker';
import { ProfileModal } from './components/ProfileModal';
import { ErgoScan } from './components/ErgoScan';
import { ExerciseType, ExerciseSession, UserMonitoring, AppTab } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [history, setHistory] = useState<ExerciseSession[]>([]);
  const [monitoring, setMonitoring] = useState<UserMonitoring>({
    mood: 'neutral',
    blinkRate: 15,
    isStrained: false,
    lastBlinkTimestamp: Date.now(),
    sessionBlinks: 0,
    eyeClosureScore: 0
  });

  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!isLoggedIn) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const screenTimeInterval = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('Relaxify: Eye Health', {
          body: 'You have been at the screen for 30 minutes. Look 20 feet away for 20 seconds!',
          icon: 'https://cdn-icons-png.flaticon.com/512/3062/3062063.png'
        });
      }
    }, 1800000);
    return () => clearInterval(screenTimeInterval);
  }, [isLoggedIn]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('relaxify_history');
    const savedUser = localStorage.getItem('relaxify_user');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    const handleActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  const handleLogin = (name: string, email: string) => {
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem('relaxify_user', JSON.stringify(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('relaxify_user');
    setIsLoggedIn(false);
    setShowProfile(false);
    setUser({ name: '', email: '' });
  };

  const saveSession = (session: Omit<ExerciseSession, 'id' | 'timestamp'>) => {
    const newSession: ExerciseSession = {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('relaxify_history', JSON.stringify(updatedHistory));
    setSelectedExercise(null);
    setActiveTab('dashboard');
  };

  const handleStartExercise = (type: ExerciseType) => {
    if (type === ExerciseType.MEDITATION) {
      setActiveTab('meditation');
    } else if (type === ExerciseType.ERGO_SCAN) {
      setActiveTab('ergo_scan');
    } else {
      setSelectedExercise(type);
      setActiveTab('exercise');
    }
  };

  const cycleToNextExercise = () => {
    const exercises = [ExerciseType.NECK_TILT, ExerciseType.HEAD_MOVEMENT, ExerciseType.SHOULDER_SHRUG];
    const currentIndex = exercises.indexOf(selectedExercise || exercises[0]);
    const nextExercise = exercises[(currentIndex + 1) % exercises.length];
    setSelectedExercise(nextExercise);
    setActiveTab('exercise');
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-[#F4F7F6] overflow-hidden text-[#2C3E50]">
      <MoodTracker onUpdate={setMonitoring} />
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'exercise') setSelectedExercise(null);
        }} 
      />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 px-8 flex items-center justify-between bg-white/40 backdrop-blur-xl border-b border-gray-100 z-10">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'exercise' ? 'Movement' : 
                 activeTab === 'meditation' ? 'Stillness' : 
                 activeTab === 'ergo_scan' ? 'Ergo AI' : 'Analytics'}
              </h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl premium-shadow border border-gray-50">
              <span className="text-sm font-black text-gray-700">
                {monitoring.mood === 'happy' && '😊 Content'}
                {monitoring.mood === 'stressed' && '😟 Focused'}
                {monitoring.mood === 'neutral' && '😐 Ready'}
                {monitoring.mood === 'tired' && '😴 Resting'}
              </span>
              <div className="w-px h-4 bg-gray-100 mx-2" />
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${monitoring.isStrained ? 'bg-red-500 animate-ping' : 'bg-teal-400'}`} />
                <span className={`text-[10px] font-black tracking-widest ${monitoring.isStrained ? 'text-red-500' : 'text-teal-600'}`}>
                  {monitoring.isStrained ? 'EYE STRAIN' : 'OPTIMAL'}
                </span>
              </div>
            </div>
          </div>
          <div 
            onClick={() => setShowProfile(true)}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-white font-black premium-shadow cursor-pointer hover:scale-105 transition-all"
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 relative">
          {activeTab === 'dashboard' && (
            <Dashboard 
              onStartExercise={handleStartExercise} 
              userName={user.name} 
              monitoring={monitoring}
            />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.NECK_TILT && (
            <NeckTiltExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} onNext={cycleToNextExercise} />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.HEAD_MOVEMENT && (
            <HeadMovementExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} onNext={cycleToNextExercise} />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.SHOULDER_SHRUG && (
            <ShoulderShrugExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} onNext={cycleToNextExercise} />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.EYE_FOCUS && (
            <EyeFocusExercise onComplete={saveSession} onCancel={() => setActiveTab('dashboard')} />
          )}
          {activeTab === 'meditation' && <MeditationView />}
          {activeTab === 'ergo_scan' && <ErgoScan />}
          {activeTab === 'history' && <HistoryView sessions={history} />}
        </div>

        {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} onLogout={handleLogout} />}
        <ProactiveChatbot userMood={monitoring.mood} isIdle={Date.now() - lastActivityRef.current > 180000} onStartExercise={handleStartExercise} />
      </main>
    </div>
  );
};

export default App;
