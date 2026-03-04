
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { CustomCursor } from './components/CustomCursor';
import { ParticleBackground } from './components/ParticleBackground';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExerciseType, ExerciseSession, UserMonitoring, AppTab } from './types';

import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { auth, db } from './src/lib/firebase';
import { encryptData, decryptData } from './src/lib/encryption';

/* ─── Safe JSON parse ─────────────────────────────────────────── */
function safeJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; }
  catch { return fallback; }
}

/* ─── Simple Analytics Engine ────────────────────────────────── */
const analytics = {
  track: (event: string, props: Record<string, unknown> = {}) => {
    const entry = { event, props, ts: Date.now() };
    try {
      const log = safeJSON<object[]>(sessionStorage.getItem('rx_analytics'), []);
      (log as object[]).push(entry);
      sessionStorage.setItem('rx_analytics', JSON.stringify((log as object[]).slice(-200)));
    } catch { /* silent */ }
  },
};

/* ─── Mood config ─────────────────────────────────────────────── */
const MOOD_CONFIG: Record<string, { label: string; color: string }> = {
  happy: { label: '😊 Content', color: '#38F9D7' },
  stressed: { label: '😟 Focused', color: '#F59E0B' },
  neutral: { label: '😐 Ready', color: '#60A5FA' },
  tired: { label: '😴 Resting', color: '#A78BFA' },
};

/* ─── Tab labels ──────────────────────────────────────────────── */
const TAB_LABELS: Record<AppTab, string> = {
  dashboard: 'Dashboard',
  exercise: 'Movement',
  meditation: 'Stillness',
  ergo_scan: 'Ergo AI',
  history: 'Analytics',
};

/* ─── Inner app (has access to theme context) ─────────────────── */
const AppInner: React.FC = () => {
  const { resolvedTheme, setTheme, theme } = useTheme();

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
    eyeClosureScore: 0,
  });

  // Scroll depth tracking
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef(Date.now());
  const headerRef = useRef<HTMLElement>(null);

  /* ── Scroll depth analytics ─────────────────────────── */
  const trackScrollDepth = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const depth = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    if (depth % 25 === 0 && depth > 0) {
      analytics.track('scroll_depth', { depth, tab: activeTab });
    }
  }, [activeTab]);

  /* ── Screen time notification ───────────────────────── */
  useEffect(() => {
    if (!isLoggedIn) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const id = setInterval(() => {
      if (Notification.permission === 'granted') {
        new Notification('Relaxify: Eye Health', {
          body: "You've been at the screen for 30 minutes. Look 20 feet away for 20 seconds!",
          icon: 'https://cdn-icons-png.flaticon.com/512/3062/3062063.png',
        });
      }
    }, 1_800_000);
    return () => clearInterval(id);
  }, [isLoggedIn]);

  /* ── Firebase Auth & Sync ────────────────────────────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ name: firebaseUser.displayName || 'Relaxed User', email: firebaseUser.email || '' });
        setIsLoggedIn(true);

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.history) {
              setHistory(decryptData<ExerciseSession[]>(data.history, firebaseUser.uid, []));
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setIsLoggedIn(false);
        setUser({ name: '', email: '' });
        setHistory([]);
      }
    });

    const handleActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    return () => {
      unsubscribe();
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  /* ── Header scroll shadow ───────────────────────────── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (!headerRef.current) return;
      if (el.scrollTop > 10) {
        headerRef.current.style.boxShadow = '0 4px 30px rgba(0,0,0,0.08)';
      } else {
        headerRef.current.style.boxShadow = 'none';
      }
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [isLoggedIn]);

  /* ── Handlers ───────────────────────────────────────── */
  const handleLogout = async () => {
    await auth.signOut();
    setIsLoggedIn(false);
    setShowProfile(false);
    setUser({ name: '', email: '' });
    setHistory([]);
    analytics.track('logout');
  };

  const saveSession = async (session: Omit<ExerciseSession, 'id' | 'timestamp'>) => {
    const newSession: ExerciseSession = {
      ...session,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newSession, ...history];
    setHistory(updated);
    setSelectedExercise(null);
    setActiveTab('dashboard');
    analytics.track('session_complete', { exercise: session.exercise, reward: session.reward });

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const encryptedHistory = encryptData(updated, currentUser.uid);
        const encryptedMonitoring = encryptData(monitoring, currentUser.uid);
        await setDoc(doc(db, 'users', currentUser.uid), {
          history: encryptedHistory,
          monitoring: encryptedMonitoring,
          lastUpdated: new Date().toISOString()
        }, { merge: true });

        // Increment Global Community stat
        await setDoc(doc(db, 'community', 'stats'), {
          totalSessionsCompleted: increment(1)
        }, { merge: true });
      } catch (error) {
        console.error("Failed to sync session to cloud:", error);
      }
    }
  };

  const handleClearHistory = async () => {
    setHistory([]);
    analytics.track('history_cleared');

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          history: encryptData([], currentUser.uid)
        }, { merge: true });
      } catch (e) {
        console.error("Failed to clear cloud history", e);
      }
    }
  };

  const handleStartExercise = (type: ExerciseType) => {
    analytics.track('exercise_start', { type });
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
    const idx = exercises.indexOf(selectedExercise ?? exercises[0]);
    const next = exercises[(idx + 1) % exercises.length];
    setSelectedExercise(next);
    setActiveTab('exercise');
  };

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    if (tab !== 'exercise') setSelectedExercise(null);
    analytics.track('tab_change', { tab });
  };

  /* ── Theme toggle cycle: light → dark → system ──────── */
  const cycleTheme = () => {
    const next: Record<string, 'light' | 'dark' | 'system'> = {
      light: 'dark', dark: 'system', system: 'light',
    };
    setTheme(next[theme] ?? 'light');
    analytics.track('theme_change', { to: next[theme] });
  };

  /* ── Not logged in ──────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <>
        <CustomCursor />
        <ParticleBackground />
        <LoginPage />
      </>
    );
  }

  const mood = MOOD_CONFIG[monitoring.mood] ?? MOOD_CONFIG.neutral;

  const themeIcon = theme === 'light'
    ? '☀️' : theme === 'dark' ? '🌙' : '⚙️';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      <CustomCursor />
      <ParticleBackground />

      <MoodTracker onUpdate={setMonitoring} />

      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeToggle={cycleTheme}
        themeIcon={themeIcon}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* ── Header ───────────────────────────────────── */}
        <header
          ref={headerRef}
          className="h-20 px-8 flex items-center justify-between z-20"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: `1px solid var(--border-card)`,
            transition: 'box-shadow 0.3s ease',
          }}
          role="banner"
        >
          {/* Left — tab title + status */}
          <div className="flex items-center gap-5">
            <div>
              <h1
                className="text-xl font-black tracking-tight uppercase"
                style={{ color: 'var(--text-primary)' }}
                aria-live="polite"
              >
                {TAB_LABELS[activeTab]}
              </h1>
            </div>

            {/* Biometric status pill */}
            <div
              className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl premium-shadow"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
              }}
              aria-label={`Mood: ${mood.label}. Eye status: ${monitoring.isStrained ? 'Eye strain detected' : 'Optimal'}`}
            >
              {/* Mood */}
              <span
                className="text-sm font-black"
                style={{ color: 'var(--text-primary)' }}
              >
                {mood.label}
              </span>

              <div style={{ width: 1, height: 16, background: 'var(--border-card)' }} />

              {/* Eye strain indicator */}
              <div className="flex items-center gap-2">
                <div
                  className={monitoring.isStrained ? 'animate-pulse' : ''}
                  style={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: monitoring.isStrained ? '#EF4444' : '#38F9D7',
                    boxShadow: monitoring.isStrained
                      ? '0 0 8px rgba(239,68,68,0.6)'
                      : '0 0 8px rgba(56,249,215,0.5)',
                  }}
                />
                <span
                  className="text-[10px] font-black tracking-widest uppercase"
                  style={{ color: monitoring.isStrained ? '#EF4444' : '#38F9D7' }}
                >
                  {monitoring.isStrained ? 'Eye Strain' : 'Optimal'}
                </span>
              </div>

              <div style={{ width: 1, height: 16, background: 'var(--border-card)' }} />

              {/* Blink rate */}
              <span
                className="text-[10px] font-black tracking-widest uppercase"
                style={{ color: 'var(--text-muted)' }}
              >
                {monitoring.blinkRate} <span style={{ opacity: 0.6 }}>BPM</span>
              </span>
            </div>
          </div>

          {/* Right — avatar with biometric aura */}
          <div className="flex items-center gap-4">
            {/* Theme toggle button */}
            <button
              onClick={cycleTheme}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-base premium-shadow"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                transition: 'transform 0.2s ease',
              }}
              title={`Theme: ${theme}. Click to cycle.`}
              aria-label={`Toggle theme. Current: ${theme}`}
            >
              {themeIcon}
            </button>

            {/* Avatar with biometric aura ring */}
            <div className="relative" style={{ width: 44, height: 44 }}>
              {/* Aura ring — color driven by mood */}
              <div
                className="absolute inset-[-4px] rounded-[18px] animate-glow"
                style={{
                  background: `linear-gradient(135deg, ${mood.color}, transparent)`,
                  opacity: 0.4,
                  borderRadius: 18,
                }}
              />
              <button
                onClick={() => { setShowProfile(true); analytics.track('profile_open'); }}
                className="relative w-full h-full rounded-[14px] flex items-center justify-center text-white font-black text-lg premium-shadow"
                style={{
                  background: `linear-gradient(135deg, ${mood.color}, #66D9C4)`,
                  transition: 'transform 0.2s ease',
                }}
                aria-label="Open profile menu"
                aria-haspopup="dialog"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Main content ──────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto relative"
          style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)' }}
          onScroll={trackScrollDepth}
          role="main"
          id="main-content"
        >
          {activeTab === 'dashboard' && (
            <Dashboard
              onStartExercise={handleStartExercise}
              userName={user.name}
              monitoring={monitoring}
              history={history}
            />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.NECK_TILT && (
            <NeckTiltExercise
              onComplete={saveSession}
              onCancel={() => setActiveTab('dashboard')}
              onNext={cycleToNextExercise}
            />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.HEAD_MOVEMENT && (
            <HeadMovementExercise
              onComplete={saveSession}
              onCancel={() => setActiveTab('dashboard')}
              onNext={cycleToNextExercise}
            />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.SHOULDER_SHRUG && (
            <ShoulderShrugExercise
              onComplete={saveSession}
              onCancel={() => setActiveTab('dashboard')}
              onNext={cycleToNextExercise}
            />
          )}
          {activeTab === 'exercise' && selectedExercise === ExerciseType.EYE_FOCUS && (
            <EyeFocusExercise
              onComplete={saveSession}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}
          {activeTab === 'meditation' && <MeditationView />}
          {activeTab === 'ergo_scan' && <ErgoScan />}
          {activeTab === 'history' && (
            <HistoryView
              sessions={history}
              onClear={handleClearHistory}
            />
          )}
        </div>

        {/* ── Profile modal ─────────────────────────────── */}
        {showProfile && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfile(false)}
            onLogout={handleLogout}
          />
        )}

        {/* ── Proactive chatbot ─────────────────────────── */}
        <ProactiveChatbot
          userMood={monitoring.mood}
          isIdle={Date.now() - lastActivityRef.current > 180_000}
          onStartExercise={handleStartExercise}
          userName={user.name}
        />
      </main>
    </div>
  );
};

/* ─── Root App with providers ─────────────────────────────────── */
const App: React.FC = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
