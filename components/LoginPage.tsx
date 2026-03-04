import React, { useState, useCallback } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../src/lib/firebase';

interface LoginPageProps {
  onLogin?: (name: string, email: string) => void;
}

/* ── Ripple hook ─────────────────────────────────────────── */
function useRipple() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  }, []);

  return { ripples, addRipple };
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const { ripples, addRipple } = useRipple();

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setIsSuccess(true);
      // Let the central App.tsx listener handle the global state optionally
      if (onLogin) {
        setTimeout(() => {
          onLogin(result.user.displayName || 'Relaxed User', result.user.email || '');
        }, 800);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || 'Failed to sign in securely. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* ── Immersive background ────────────────────────── */}
      <div
        className="absolute animate-morph"
        style={{
          width: 700, height: 700,
          top: '-20%', left: '-15%',
          background: 'radial-gradient(circle at 40% 40%, rgba(56,249,215,0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute animate-morph"
        style={{
          width: 600, height: 600,
          bottom: '-18%', right: '-12%',
          background: 'radial-gradient(circle at 60% 60%, rgba(167,139,250,0.15) 0%, transparent 65%)',
          filter: 'blur(70px)',
          animationDelay: '6s',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute"
        style={{
          width: 400, height: 400,
          top: '45%', left: '55%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 65%)',
          filter: 'blur(50px)',
          animation: 'morph-blob 20s ease-in-out 10s infinite',
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56,249,215,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,249,215,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* ── Login card ──────────────────────────────────── */}
      <div
        className={`relative z-10 glass-card rounded-[52px] w-full premium-shadow-lg ${shake ? 'animate-shake' : ''
          } ${isSuccess ? 'animate-fade-scale' : 'animate-entrance'}`}
        style={{
          maxWidth: 460,
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          border: '1px solid var(--border-subtle)',
        }}
        role="main"
      >
        {/* ── Success overlay ───────────────────────────── */}
        {isSuccess && (
          <div
            className="absolute inset-0 rounded-[52px] flex flex-col items-center justify-center z-20"
            style={{
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(24px)',
              animation: 'fade-scale-in 0.4s ease both',
            }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #38F9D7, #20C997)',
                boxShadow: '0 0 40px rgba(56,249,215,0.5)',
                animation: 'glow-pulse 1.5s ease-in-out infinite',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#071220" strokeWidth="3" strokeLinecap="round" className="w-10 h-10">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="font-black text-xl text-gradient">Entering Sanctuary…</p>
          </div>
        )}

        {/* ── Logo & title ──────────────────────────────── */}
        <div className="text-center mb-10">
          <div
            className="relative w-24 h-24 mx-auto mb-6"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className="absolute inset-0 rounded-[28px] animate-spin-slow"
              style={{
                background: 'linear-gradient(135deg, rgba(56,249,215,0.4), rgba(167,139,250,0.4), rgba(56,249,215,0.4))',
                padding: 2,
                borderRadius: 28,
              }}
              aria-hidden="true"
            >
              <div
                className="w-full h-full rounded-[26px]"
                style={{ background: 'var(--bg-page)' }}
              />
            </div>
            <div
              className="relative z-10 w-20 h-20 rounded-[24px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #38F9D7 0%, #20C997 100%)',
                boxShadow: '0 16px 40px rgba(56,249,215,0.45)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-10 h-10"
                fill="none"
                stroke="#071220"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#071220" fillOpacity="0.2" />
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
              </svg>
            </div>
          </div>

          <h1
            className="font-black tracking-tight mb-2"
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.8rem)',
              color: 'var(--text-primary)',
            }}
          >
            Relaxify
          </h1>
          <p
            className="font-medium italic"
            style={{ color: 'var(--text-muted)' }}
          >
            Empowering your digital wellness.
          </p>
        </div>

        {/* ── Google Auth Action ─────────────────────────────── */}
        <div className="space-y-4">
          {error && (
            <div className="text-center p-3 rounded-xl mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <p className="text-sm font-bold text-red-500">{error}</p>
            </div>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => { addRipple(e); handleGoogleSignIn(); }}
            className="btn-ripple w-full py-5 rounded-2xl font-black text-lg mt-3 flex items-center justify-center gap-3"
            style={{
              background: isSubmitting
                ? 'var(--bg-card)'
                : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              color: '#071220',
              boxShadow: '0 12px 36px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              border: isSubmitting ? '1px solid var(--border-subtle)' : 'none',
            }}
            aria-label="Sign in with Google"
          >
            {ripples.map(r => (
              <span
                key={r.id}
                className="ripple"
                style={{ left: r.x - 10, top: r.y - 10, background: 'rgba(0,0,0,0.05)' }}
                aria-hidden="true"
              />
            ))}

            {isSubmitting ? (
              <>
                <div
                  className="w-6 h-6 rounded-full border-4"
                  style={{
                    borderColor: 'rgba(7,18,32,0.2)',
                    borderTopColor: '#071220',
                    animation: 'spin-slow 0.8s linear infinite',
                  }}
                />
                <span style={{ color: 'var(--text-primary)' }}>Connecting…</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <p
          className="text-center text-[10px] font-medium mt-6"
          style={{ color: 'var(--text-muted)' }}
        >
          All data is E2E encrypted locally before syncing to your cloud profile.
        </p>
      </div>
    </div>
  );
};
