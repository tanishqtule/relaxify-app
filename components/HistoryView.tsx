
import React, { useState, useEffect, useRef } from 'react';
import { ExerciseSession, ExerciseType } from '../types';
import { AnimatedCounter } from './AnimatedCounter';

interface HistoryViewProps {
  sessions: ExerciseSession[];
  onClear?: () => void;
}

const EXERCISE_META: Record<string, { emoji: string; color: string; label: string }> = {
  [ExerciseType.NECK_TILT]:     { emoji: '🦒', color: '#38F9D7', label: 'Neck Tilt Flow' },
  [ExerciseType.HEAD_MOVEMENT]: { emoji: '🔄', color: '#60A5FA', label: 'Head Rotation' },
  [ExerciseType.SHOULDER_SHRUG]:{ emoji: '💪', color: '#F59E0B', label: 'Shoulder Shrugs' },
  [ExerciseType.MEDITATION]:    { emoji: '🧘', color: '#A78BFA', label: 'Meditation' },
  [ExerciseType.EYE_FOCUS]:     { emoji: '👁',  color: '#34D399', label: 'Eye Reset' },
  [ExerciseType.ERGO_SCAN]:     { emoji: '📡', color: '#818CF8', label: 'Ergo Scan' },
};

type Period = 'week' | 'month' | 'all';
type ExFilter = ExerciseType | 'all';

/* ── Real streak calculation ─────────────────────────────────── */
function computeStreak(sessions: ExerciseSession[]): number {
  if (!sessions.length) return 0;
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const days = new Set(sessions.map(s => dayKey(new Date(s.timestamp))));
  const today = new Date();
  const hasToday = days.has(dayKey(today));
  let streak = 0;
  for (let i = hasToday ? 0 : 1; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    if (days.has(dayKey(d))) streak++;
    else break;
  }
  return streak;
}

/* ── CSV export ──────────────────────────────────────────────── */
function exportToCSV(sessions: ExerciseSession[]) {
  const header = 'Date,Time,Exercise,Reps,XP Reward';
  const rows = sessions.map(s => {
    const d = new Date(s.timestamp);
    return [
      d.toLocaleDateString(),
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      `"${EXERCISE_META[s.exercise]?.label ?? s.exercise}"`,
      s.counter,
      s.reward,
    ].join(',');
  });
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `relaxify-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Animated stat card ─────────────────────────────────────── */
const StatCard: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  color: string;
  index: number;
  isNumeric?: boolean;
}> = ({ label, value, icon, color, index, isNumeric = true }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="card-base rounded-[40px] p-8 relative overflow-hidden flex flex-col justify-between"
      style={{
        minHeight: 170,
        opacity: 0,
        transform: 'translateY(24px) scale(0.96)',
        transition: `opacity 0.55s ease ${index * 100}ms, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${index * 100}ms`,
      }}
    >
      {/* Icon + badge */}
      <div className="flex justify-between items-start">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <span
          className="badge"
          style={{
            background: `${color}15`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          Live Stats
        </span>
      </div>

      {/* Value */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </p>
        <p
          className="text-4xl font-black tracking-tighter"
          style={{ color: 'var(--text-primary)' }}
        >
          {isNumeric && typeof value === 'number'
            ? <AnimatedCounter value={value} />
            : value
          }
        </p>
      </div>

      {/* Decorative bubble */}
      <div
        className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          transition: 'transform 0.3s ease',
        }}
        aria-hidden="true"
      />
    </div>
  );
};

/* ── Mini bar chart ─────────────────────────────────────────── */
const MiniBarChart: React.FC<{ sessions: ExerciseSession[] }> = ({ sessions }) => {
  if (sessions.length === 0) return null;

  const dayData: number[] = Array(7).fill(0);
  const now = Date.now();
  sessions.forEach(s => {
    const diffDays = Math.floor((now - new Date(s.timestamp).getTime()) / 86_400_000);
    if (diffDays < 7) dayData[6 - diffDays] += s.reward;
  });

  const max = Math.max(...dayData, 1);
  const days = ['M','T','W','T','F','S','S'];
  const today = new Date().getDay();
  const dayLabels = Array.from({ length: 7 }, (_, i) => days[(today - 6 + i + 7) % 7]);

  return (
    <div
      className="card-base rounded-[40px] p-8"
      style={{ animation: 'entrance 0.6s ease 0.4s both' }}
      role="img"
      aria-label="Weekly wellness points bar chart"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Weekly XP
          </p>
          <p
            className="text-2xl font-black mt-1"
            style={{ color: 'var(--text-primary)' }}
          >
            <AnimatedCounter value={dayData.reduce((a,b) => a+b, 0)} suffix=" pts" />
          </p>
        </div>
        <span className="badge badge-teal">7 days</span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-2" style={{ height: 80 }}>
        {dayData.map((val, i) => {
          const height = val === 0 ? 4 : Math.max((val / max) * 72, 8);
          const isToday = i === 6;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${dayLabels[i]}: ${val} pts`}
            >
              <div
                className="w-full rounded-[6px]"
                style={{
                  height,
                  background: isToday
                    ? 'linear-gradient(180deg, #38F9D7, #20C997)'
                    : val > 0
                      ? 'rgba(56,249,215,0.35)'
                      : 'var(--border-card)',
                  boxShadow: isToday ? '0 0 12px rgba(56,249,215,0.5)' : 'none',
                  transition: `height 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`,
                }}
              />
              <span
                className="text-[9px] font-bold"
                style={{ color: isToday ? '#38F9D7' : 'var(--text-muted)' }}
              >
                {dayLabels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── History item ────────────────────────────────────────────── */
const HistoryItem: React.FC<{ session: ExerciseSession; index: number; isLast: boolean }> = ({
  session, index, isLast,
}) => {
  const meta = EXERCISE_META[session.exercise] ?? {
    emoji: '⚡', color: '#38F9D7', label: session.exercise.replace(/_/g, ' '),
  };

  return (
    <div
      className="relative flex gap-4 items-start"
      style={{
        animation: `slide-up 0.5s ease ${index * 60}ms both`,
        paddingLeft: 8,
      }}
    >
      {/* Timeline dot */}
      <div className="relative flex-shrink-0" style={{ width: 48 }}>
        <div
          className="w-12 h-12 rounded-[18px] flex items-center justify-center text-xl premium-shadow"
          style={{
            background: `${meta.color}15`,
            border: `1px solid ${meta.color}30`,
          }}
          aria-hidden="true"
        >
          {meta.emoji}
        </div>
        {!isLast && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 52, bottom: -16,
              width: 2,
              background: `linear-gradient(180deg, ${meta.color}40 0%, transparent 100%)`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Content card */}
      <div
        className="flex-1 card-base rounded-[28px] p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ minHeight: 80 }}
      >
        {/* Left — exercise info */}
        <div className="flex-1">
          <h4
            className="text-lg font-black capitalize tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {meta.label}
          </h4>
          <div
            className="flex items-center flex-wrap gap-3 mt-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="text-[10px] font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time dateTime={session.timestamp}>
                {new Date(session.timestamp).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </time>
            </span>
            <span
              style={{ width: 3, height: 3, borderRadius: '50%', background: 'currentColor', opacity: 0.4 }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Right — stats */}
        <div
          className="flex items-center gap-4 sm:border-l sm:pl-5"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <div className="text-center">
            <p
              className="text-[9px] font-black uppercase tracking-widest mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Impact
            </p>
            <p
              className="text-xl font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              {session.counter}
              <span
                className="text-[10px] font-bold ml-1"
                style={{ color: 'var(--text-muted)' }}
              >
                reps
              </span>
            </p>
          </div>

          <div
            className="px-5 py-3 rounded-2xl text-center"
            style={{
              background: `${meta.color}15`,
              border: `1px solid ${meta.color}25`,
              minWidth: 90,
            }}
          >
            <p
              className="text-[9px] font-black uppercase tracking-widest mb-0.5"
              style={{ color: `${meta.color}80` }}
            >
              Reward
            </p>
            <p
              className="text-xl font-black"
              style={{ color: meta.color }}
            >
              +{session.reward}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Empty state ─────────────────────────────────────────────── */
const EmptyState: React.FC = () => (
  <div
    className="flex flex-col items-center justify-center text-center"
    style={{ minHeight: '60vh', animation: 'entrance 0.6s ease both' }}
    role="region"
    aria-label="No sessions yet"
  >
    <div className="relative mb-10">
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center text-5xl animate-breathe"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          boxShadow: '0 0 40px rgba(56,249,215,0.1)',
        }}
        aria-hidden="true"
      >
        📖
      </div>
      <div
        className="absolute inset-[-12px] rounded-full animate-glow"
        style={{
          background: 'rgba(56,249,215,0.04)',
          border: '1px solid rgba(56,249,215,0.12)',
        }}
        aria-hidden="true"
      />
    </div>

    <h3
      className="text-3xl font-black mb-3"
      style={{ color: 'var(--text-primary)' }}
    >
      Your Book is Empty
    </h3>
    <p
      className="font-medium max-w-sm mx-auto mb-10 leading-relaxed"
      style={{ color: 'var(--text-muted)' }}
    >
      History isn't made by sitting still. Start your first session and we'll track every milestone.
    </p>

    <button
      onClick={() => window.history.back()}
      className="btn-primary btn-ripple px-10 py-4 rounded-2xl font-black text-sm"
      aria-label="Go back to dashboard to start a session"
    >
      Begin Your Journey →
    </button>
  </div>
);

/* ── Filter pill button ──────────────────────────────────────── */
const FilterPill: React.FC<{
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}> = ({ active, onClick, color = '#38F9D7', children }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
    style={{
      background: active ? `${color}20` : 'var(--bg-card)',
      color: active ? color : 'var(--text-muted)',
      border: `1px solid ${active ? `${color}40` : 'var(--border-card)'}`,
      boxShadow: active ? `0 0 12px ${color}20` : 'none',
    }}
  >
    {children}
  </button>
);

/* ── Main HistoryView ────────────────────────────────────────── */
export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onClear }) => {
  const [isSyncing,    setIsSyncing]    = useState(true);
  const [period,       setPeriod]       = useState<Period>('all');
  const [exFilter,     setExFilter]     = useState<ExFilter>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const tid = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(tid);
  }, []);

  if (!isSyncing && sessions.length === 0) return <EmptyState />;

  /* ── Apply filters ────────────────────────────────────── */
  const now = Date.now();
  const periodCutoff: Record<Period, number> = {
    week:  now - 7  * 86_400_000,
    month: now - 30 * 86_400_000,
    all:   0,
  };

  const filtered = sessions.filter(s => {
    const t = new Date(s.timestamp).getTime();
    if (t < periodCutoff[period]) return false;
    if (exFilter !== 'all' && s.exercise !== exFilter) return false;
    return true;
  });

  /* ── Aggregate stats from ALL sessions (not filtered) ─── */
  const totalPoints  = sessions.reduce((a, s) => a + s.reward,  0);
  const totalReps    = sessions.reduce((a, s) => a + s.counter, 0);
  const streakDays   = computeStreak(sessions);

  const exerciseTypes = Object.keys(EXERCISE_META) as ExerciseType[];

  return (
    <div
      className="space-y-10 max-w-4xl mx-auto"
      style={{ animation: 'entrance 0.5s ease both' }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        style={{ animation: 'slide-up 0.5s ease 0.05s both' }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2
              className="font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                color: 'var(--text-primary)',
              }}
            >
              Activity Log
            </h2>

            {isSyncing ? (
              <span className="badge badge-blue animate-pulse">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60A5FA' }} />
                Syncing…
              </span>
            ) : (
              <span className="badge badge-teal">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38F9D7' }} />
                Secure
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
            Tracking your path to wellness, one rep at a time.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => exportToCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
            style={{
              background: 'rgba(56,249,215,0.1)',
              color: '#38F9D7',
              border: '1px solid rgba(56,249,215,0.2)',
              opacity: filtered.length === 0 ? 0.4 : 1,
              cursor: filtered.length === 0 ? 'not-allowed' : 'pointer',
            }}
            aria-label="Export history as CSV"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black" style={{ color: '#EF4444' }}>Clear all?</span>
              <button
                onClick={() => { onClear?.(); setConfirmClear(false); }}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase"
                style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-card)' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              disabled={sessions.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all"
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.15)',
                opacity: sessions.length === 0 ? 0.4 : 1,
                cursor: sessions.length === 0 ? 'not-allowed' : 'pointer',
              }}
              aria-label="Clear all history"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Summary stat cards ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          index={0}
          label="Total Wellness Points"
          value={totalPoints}
          icon="💎"
          color="#38F9D7"
        />
        <StatCard
          index={1}
          label="Completed Repetitions"
          value={totalReps}
          icon="🔄"
          color="#60A5FA"
        />
        <StatCard
          index={2}
          label="Active Streak"
          value={streakDays}
          icon="🔥"
          color="#A78BFA"
        />
      </div>

      {/* ── Weekly chart ─────────────────────────────────── */}
      <MiniBarChart sessions={sessions} />

      {/* ── Filter bar ───────────────────────────────────── */}
      <div className="space-y-3">
        {/* Period filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[9px] font-black uppercase tracking-widest mr-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Period
          </span>
          <FilterPill active={period === 'week'}  onClick={() => setPeriod('week')}>This Week</FilterPill>
          <FilterPill active={period === 'month'} onClick={() => setPeriod('month')}>This Month</FilterPill>
          <FilterPill active={period === 'all'}   onClick={() => setPeriod('all')}>All Time</FilterPill>
        </div>

        {/* Exercise type filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[9px] font-black uppercase tracking-widest mr-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Type
          </span>
          <FilterPill active={exFilter === 'all'} onClick={() => setExFilter('all')}>All</FilterPill>
          {exerciseTypes.map(ex => {
            const meta = EXERCISE_META[ex];
            return (
              <FilterPill
                key={ex}
                active={exFilter === ex}
                onClick={() => setExFilter(ex)}
                color={meta.color}
              >
                {meta.emoji} {meta.label}
              </FilterPill>
            );
          })}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {sessions.length} sessions
          </p>
        </div>
      </div>

      {/* ── Timeline of sessions ─────────────────────────── */}
      <section aria-label="Session history timeline">
        <h3
          className="text-sm font-black uppercase tracking-[0.3em] mb-6 px-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Recent Sessions
        </h3>

        {filtered.length > 0 ? (
          <div className="relative">
            {filtered.map((session, index) => (
              <HistoryItem
                key={session.id}
                session={session}
                index={index}
                isLast={index === filtered.length - 1}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center py-16 text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-black text-lg mb-1" style={{ color: 'var(--text-primary)' }}>No sessions found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </div>
  );
};
