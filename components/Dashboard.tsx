
import React, { useState, useEffect, useRef } from 'react';
import { ExerciseType, UserMonitoring } from '../types';
import { TiltCard } from './TiltCard';

interface DashboardProps {
  onStartExercise: (type: ExerciseType) => void;
  userName: string;
  monitoring?: UserMonitoring;
}

const QUOTES = [
  "Self-care is how you take your power back.",
  "Your mind is a sanctuary. Keep it clean.",
  "Calmness is a superpower.",
  "Health is a relationship between you and your body.",
  "Breathe. You are where you need to be.",
  "Small consistent steps create monumental change.",
];

const EXERCISE_IMAGES = {
  [ExerciseType.NECK_TILT]:     "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.HEAD_MOVEMENT]: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.SHOULDER_SHRUG]:"https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.MEDITATION]:    "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.EYE_FOCUS]:     "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=600",
};

/* ── Animated eye health ring ───────────────────────────────────── */
const BlinkRing: React.FC<{ rate: number; isStrained: boolean }> = ({ rate, isStrained }) => {
  const ringRef = useRef<SVGCircleElement>(null);
  const ideal   = 18; // ideal blinks per minute
  const pct     = Math.min(rate / ideal, 1);
  const dashOff = 283 * (1 - pct);

  useEffect(() => {
    if (!ringRef.current) return;
    ringRef.current.style.strokeDashoffset = `${dashOff}`;
  }, [dashOff]);

  return (
    <svg width="80" height="80" viewBox="0 0 100 100" aria-hidden="true">
      {/* Background ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(56,249,215,0.1)" strokeWidth="8" />
      {/* Progress ring */}
      <circle
        ref={ringRef}
        cx="50" cy="50" r="45"
        fill="none"
        stroke={isStrained ? '#EF4444' : '#38F9D7'}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="283"
        strokeDashoffset="283"
        transform="rotate(-90 50 50)"
        style={{
          transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34,1.56,0.64,1), stroke 0.4s ease',
          filter: isStrained
            ? 'drop-shadow(0 0 6px rgba(239,68,68,0.8))'
            : 'drop-shadow(0 0 6px rgba(56,249,215,0.8))',
        }}
      />
      {/* Center number */}
      <text
        x="50" y="54"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fontFamily="Plus Jakarta Sans, Inter, sans-serif"
        fill={isStrained ? '#EF4444' : '#38F9D7'}
      >
        {rate}
      </text>
    </svg>
  );
};

/* ── Floating stat pill ─────────────────────────────────────────── */
const StatPill: React.FC<{
  icon: string; value: string; label: string; color: string; delay?: number;
}> = ({ icon, value, label, color, delay = 0 }) => (
  <div
    className="stat-pill"
    style={{ animation: `entrance 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}
  >
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
      style={{ background: `${color}18`, border: `1px solid ${color}30`, flexShrink: 0 }}
    >
      {icon}
    </div>
    <div>
      <p
        className="text-xl font-black leading-none animate-number"
        style={{ color, animationDelay: `${delay + 100}ms` }}
      >
        {value}
      </p>
      <p
        className="text-[9px] font-black uppercase tracking-widest mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
    </div>
  </div>
);

/* ── Animated activity cell ─────────────────────────────────────── */
const ActivityCell: React.FC<{ level: 0|1|2|3|4; delay: number }> = ({ level, delay }) => {
  const classes = [
    'activity-cell activity-cell-0',
    'activity-cell activity-cell-1',
    'activity-cell activity-cell-2',
    'activity-cell activity-cell-3',
    'activity-cell activity-cell-4',
  ];

  return (
    <div
      className={classes[level]}
      style={{
        animation: `entrance 0.4s ease ${delay}ms both`,
      }}
      title={`Activity level: ${['None','Low','Moderate','High','Peak'][level]}`}
    />
  );
};

/* ── Exercise card ──────────────────────────────────────────────── */
interface ExerciseCardProps {
  title: string;
  description: string;
  intensity: string;
  intensityColor: string;
  time: string;
  image: string;
  onClick?: () => void;
  isRecommended?: boolean;
  index: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title, description, intensity, intensityColor, time, image,
  onClick, isRecommended, index,
}) => {
  return (
    /* Outer wrapper adds rotating conic glow border on hover */
    <div
      className="exercise-card-outer"
      style={{ animation: `entrance 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
    >
      <TiltCard
        className="card-base rounded-[36px] p-5 relative overflow-hidden"
        intensity={10}
        shine
        onClick={onClick}
        style={{ cursor: 'pointer' } as React.CSSProperties}
      >
        {/* Recommended badge */}
        {isRecommended && (
          <div
            className="absolute top-4 right-4 z-20 badge badge-neon animate-pulse"
            role="status"
            aria-label="Recommended: eye strain detected"
          >
            ⚡ Critical
          </div>
        )}

        {/* Image area — zoom driven by CSS via exercise-card-outer:hover */}
        <div
          className="h-44 w-full rounded-[26px] mb-5 overflow-hidden relative"
          style={{ background: 'var(--border-card)' }}
        >
          <img
            src={image}
            alt={title}
            className="exercise-card-img w-full h-full object-cover"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(10,22,40,0.55) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="badge"
            style={{
              background: `${intensityColor}15`,
              color: intensityColor,
              border: `1px solid ${intensityColor}30`,
            }}
          >
            {intensity}
          </span>
          <span className="badge badge-teal">{time}</span>
        </div>

        {/* Text */}
        <h4
          className="text-lg font-black mb-1.5"
          style={{ color: 'var(--text-primary)', transition: 'color 0.2s ease' }}
        >
          {title}
        </h4>
        <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>

        {/* Start button hint — arrow slides right on hover via CSS */}
        <div
          className="mt-4 flex items-center gap-2 exercise-start-label"
          style={{ color: '#38F9D7', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', transition: 'color 0.3s ease' }}
        >
          <span>START SESSION</span>
          <svg className="exercise-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </TiltCard>
    </div>
  );
};

/* ── Dashboard ──────────────────────────────────────────────────── */
export const Dashboard: React.FC<DashboardProps> = ({
  onStartExercise, userName, monitoring,
}) => {
  const [quote,    setQuote]    = useState('');
  const [greeting, setGreeting] = useState('');
  const [mounted,  setMounted]  = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');

    // Stagger entrance
    const tid = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(tid);
  }, []);

  // Activity grid data — 28 cells with varied intensity
  const activityData: (0|1|2|3|4)[] = Array.from({ length: 28 }, (_, i) => {
    if (i > 22) return 4;
    if (i > 18) return 3;
    if (i > 13) return 2;
    if (i > 8)  return 1;
    return 0;
  });

  return (
    <div className="space-y-8 max-w-7xl" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>

      {/* ── Greeting row ──────────────────────────────────── */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        style={{ animation: 'entrance 0.65s cubic-bezier(0.16,1,0.3,1) 50ms both' }}
      >
        {/* Hero greeting */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#38F9D7',
                boxShadow: '0 0 12px rgba(56,249,215,0.8)',
                animation: 'glow-pulse 2s ease-in-out infinite',
              }}
            />
            <p
              className="font-black text-xs uppercase tracking-[0.4em]"
              style={{ color: '#38F9D7' }}
            >
              {greeting}
            </p>
          </div>

          <h2
            className="font-black tracking-tighter leading-none fluid-hero"
            style={{ color: 'var(--text-primary)' }}
          >
            {userName}<span style={{ color: '#38F9D7' }}>.</span>
          </h2>

          <p
            className="font-medium mt-4 text-lg max-w-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            Focus on your digital wellbeing today. Your body thanks you.
          </p>
        </div>

        {/* ── Eye health widget ─────────────────────────── */}
        <div
          className="card-base rounded-[36px] p-7 min-w-[300px]"
          style={{ animation: 'entrance 0.65s cubic-bezier(0.16,1,0.3,1) 150ms both' }}
          role="region"
          aria-label="Digital eye health metrics"
        >
          <div className="flex items-center justify-between mb-5">
            <h4
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Digital Eye Health
            </h4>
            <span className={`badge ${monitoring?.isStrained ? 'badge-red' : 'badge-teal'}`}>
              {monitoring?.isStrained ? '⚠ Strain' : '✓ Optimal'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Blink rate ring */}
            <BlinkRing
              rate={monitoring?.blinkRate ?? 0}
              isStrained={monitoring?.isStrained ?? false}
            />

            <div className="flex-1 space-y-3">
              <div>
                <p
                  className="text-2xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {monitoring?.blinkRate ?? 0}
                </p>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Blinks / Min
                </p>
              </div>
              <div>
                <p
                  className="text-2xl font-black"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {monitoring?.sessionBlinks ?? 0}
                </p>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Total Blinks
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onStartExercise(ExerciseType.EYE_FOCUS)}
            className="w-full mt-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest btn-ripple"
            style={{
              background: 'rgba(56,249,215,0.1)',
              color: '#38F9D7',
              border: '1px solid rgba(56,249,215,0.2)',
              transition: 'all 0.2s ease',
            }}
            aria-label="Start 20-20-20 eye relief exercise"
          >
            👁 Start 20-20-20 Rule
          </button>
        </div>
      </div>

      {/* ── Floating stats strip ─────────────────────────── */}
      <div
        className="flex gap-4 flex-wrap"
        style={{ animation: 'entrance 0.65s cubic-bezier(0.16,1,0.3,1) 120ms both' }}
        role="region"
        aria-label="Wellness stats"
      >
        <StatPill icon="⚡" value="2,840" label="Total XP"   color="#38F9D7" delay={0}   />
        <StatPill icon="🔥" value="7"     label="Day Streak" color="#F59E0B" delay={80}  />
        <StatPill icon="💎" value="24"    label="Sessions"   color="#A78BFA" delay={160} />
        <StatPill icon="🎯" value="92%"   label="Wellness"   color="#60A5FA" delay={240} />
      </div>

      {/* ── Hero cards row ────────────────────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{ animation: 'entrance 0.65s cubic-bezier(0.16,1,0.3,1) 260ms both' }}
      >
        {/* Daily momentum — dark card */}
        <TiltCard
          className="lg:col-span-2 rounded-[48px] p-10 relative overflow-hidden"
          intensity={6}
          shine
          style={{
            background: 'linear-gradient(145deg, #0D1F35 0%, #132A45 50%, #091825 100%)',
          } as React.CSSProperties}
        >
          {/* Perspective depth grid */}
          <div className="hero-depth-grid" style={{ borderRadius: 48, opacity: 0.6 }} />

          {/* Ambient glow orbs inside card */}
          <div
            className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(56,249,215,0.3) 0%, transparent 70%)',
              filter: 'blur(30px)',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-[-80px] left-10 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              animation: 'float 11s ease-in-out 2s infinite',
            }}
          />
          {/* Extra corner orb */}
          <div
            className="absolute bottom-10 right-[-30px] w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
              filter: 'blur(25px)',
              animation: 'float 9s ease-in-out 1s infinite',
            }}
          />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p
                className="font-black text-xs uppercase tracking-[0.3em] mb-5"
                style={{ color: '#38F9D7' }}
              >
                Daily Momentum
              </p>
              <h2
                className="font-black mb-4"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#DCF0EC' }}
              >
                Ready to Focus?
              </h2>
              <p style={{ color: 'rgba(122,171,184,0.9)', maxWidth: 360, lineHeight: 1.7 }}>
                Consistency is key. Every session improves cognitive performance and physical longevity.
              </p>
            </div>

            <div className="mt-8 flex items-end gap-6">
              {/* Progress bar */}
              <div className="flex-1">
                <div
                  className="flex justify-between text-xs font-black uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(220,240,236,0.8)' }}
                >
                  <span>Progress towards goal</span>
                  <span style={{ color: '#38F9D7' }}>85%</span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden p-0.5"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-full rounded-full progress-fill"
                    style={{
                      width: '85%',
                      background: 'linear-gradient(90deg, #38F9D7, #20C997)',
                      boxShadow: '0 0 12px rgba(56,249,215,0.7)',
                    }}
                  />
                </div>

                {/* Progress ticks */}
                <div className="flex justify-between mt-2">
                  {[0,25,50,75,100].map(v => (
                    <span
                      key={v}
                      className="text-[8px] font-bold"
                      style={{ color: 'rgba(122,171,184,0.5)' }}
                    >
                      {v}%
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => onStartExercise(ExerciseType.MEDITATION)}
                className="btn-ripple rounded-2xl font-black text-sm px-7 py-4"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  color: '#0D1F35',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                aria-label="Enter Zen Mode meditation"
              >
                ✦ Zen Mode
              </button>
            </div>
          </div>
        </TiltCard>

        {/* Activity intensity card */}
        <TiltCard
          className="card-base holo-card rounded-[48px] p-8 flex flex-col justify-between"
          intensity={8}
          shine
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <p
                className="text-[10px] font-black uppercase tracking-[0.3em]"
                style={{ color: 'var(--text-muted)' }}
              >
                Activity Intensity
              </p>
              <div className="relative group">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <path
                    strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {/* Tooltip */}
                <div
                  className="absolute bottom-full right-0 mb-2 w-52 p-3 rounded-xl text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 premium-shadow-lg"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-secondary)',
                  }}
                  role="tooltip"
                >
                  Brighter squares = higher wellness activity on that day.
                </div>
              </div>
            </div>

            {/* 4-week grid */}
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
              role="img"
              aria-label="28-day wellness activity heatmap"
            >
              {activityData.map((level, i) => (
                <ActivityCell key={i} level={level} delay={i * 20} />
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Less</span>
              {([0,1,2,3,4] as (0|1|2|3|4)[]).map(l => (
                <div key={l} className={`w-3 h-3 rounded-sm activity-cell-${l}`} />
              ))}
              <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>More</span>
            </div>
          </div>

          {/* Inspirational quote */}
          <div
            className="mt-6 pt-6"
            style={{ borderTop: '1px solid var(--border-card)' }}
          >
            <p
              className="text-sm font-semibold italic leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              "{quote}"
            </p>
          </div>
        </TiltCard>
      </div>

      {/* ── Active Programs ───────────────────────────────── */}
      <section
        aria-labelledby="programs-heading"
        style={{ animation: 'entrance 0.65s cubic-bezier(0.16,1,0.3,1) 350ms both' }}
      >
        <div className="flex items-center justify-between mb-8 px-1">
          <h2
            id="programs-heading"
            className="font-black tracking-tight"
            style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', color: 'var(--text-primary)' }}
          >
            Active Programs
          </h2>
          <span
            className="badge badge-teal"
            aria-label="4 programs available"
          >
            4 Programs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <ExerciseCard
            index={0}
            title="Eye Reset"
            description="The 20-20-20 rule to prevent digital eye strain instantly."
            intensity="Zero"
            intensityColor="#38F9D7"
            time="1 min"
            image={EXERCISE_IMAGES[ExerciseType.EYE_FOCUS]}
            onClick={() => onStartExercise(ExerciseType.EYE_FOCUS)}
            isRecommended={monitoring?.isStrained}
          />
          <ExerciseCard
            index={1}
            title="Neck Tilt Flow"
            description="Reduce stiffness with targeted lateral neck stretches."
            intensity="Low"
            intensityColor="#60A5FA"
            time="5 min"
            image={EXERCISE_IMAGES[ExerciseType.NECK_TILT]}
            onClick={() => onStartExercise(ExerciseType.NECK_TILT)}
          />
          <ExerciseCard
            index={2}
            title="Head Rotation"
            description="Improve mobility with gentle 360° neck circles."
            intensity="Medium"
            intensityColor="#F59E0B"
            time="3 min"
            image={EXERCISE_IMAGES[ExerciseType.HEAD_MOVEMENT]}
            onClick={() => onStartExercise(ExerciseType.HEAD_MOVEMENT)}
          />
          <ExerciseCard
            index={3}
            title="Shoulder Shrugs"
            description="Release upper body tension and reset your posture."
            intensity="Low"
            intensityColor="#60A5FA"
            time="4 min"
            image={EXERCISE_IMAGES[ExerciseType.SHOULDER_SHRUG]}
            onClick={() => onStartExercise(ExerciseType.SHOULDER_SHRUG)}
          />
        </div>
      </section>
    </div>
  );
};
