
import React, { useState, useRef, useCallback } from 'react';

interface LoginPageProps {
  onLogin: (name: string, email: string) => void;
}

/* ── Password strength calc ─────────────────────────────── */
function getPasswordStrength(pw: string): { score: 0|1|2|3|4; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;

  const map: Record<number, { label: string; color: string }> = {
    0: { label: 'Weak',   color: '#EF4444' },
    1: { label: 'Fair',   color: '#F59E0B' },
    2: { label: 'Good',   color: '#60A5FA' },
    3: { label: 'Strong', color: '#38F9D7' },
    4: { label: 'Elite',  color: '#A78BFA' },
  };

  return { score: Math.min(score, 4) as 0|1|2|3|4, ...map[Math.min(score, 4)] };
}

/* ── Ripple hook ─────────────────────────────────────────── */
function useRipple() {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;
    const id   = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  }, []);

  return { ripples, addRipple };
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [errors,      setErrors]      = useState<{ name?: string; email?: string; password?: string }>({});
  const [isSubmitting,setIsSubmitting]= useState(false);
  const [isSuccess,   setIsSuccess]   = useState(false);
  const [shake,       setShake]       = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { ripples, addRipple } = useRipple();

  const passwordStrength = getPasswordStrength(password);

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!name.trim())           newErrors.name     = "What's your name?";
    if (!validateEmail(email))  newErrors.email    = "Please enter a valid email address.";
    if (password.length < 8)   newErrors.password = "Password must be at least 8 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);

    // Success state before login callback
    setTimeout(() => {
      setIsSuccess(true);
      setTimeout(() => onLogin(name, email), 800);
    }, 1000);
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* ── Immersive background ────────────────────────── */}
      {/* Large morphing orbs */}
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

      {/* Subtle grid */}
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
        ref={formRef}
        className={`relative z-10 glass-card rounded-[52px] w-full premium-shadow-lg ${
          shake ? 'animate-shake' : ''
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
          {/* Logo mark */}
          <div
            className="relative w-24 h-24 mx-auto mb-6"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Outer spinning ring */}
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

            {/* Logo content */}
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

        {/* ── Form ─────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Name field */}
          <div>
            <div className="fl-group">
              <input
                type="text"
                id="login-name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder=" "
                className={errors.name ? 'input-error' : ''}
                autoComplete="name"
                aria-label="Your name"
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={!!errors.name}
              />
              <label htmlFor="login-name">Your Name</label>
            </div>
            {errors.name && (
              <span id="name-error" className="fl-error-msg" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email field */}
          <div>
            <div className="fl-group">
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder=" "
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
                aria-label="Work email address"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
              />
              <label htmlFor="login-email">Work Email</label>
            </div>
            {errors.email && (
              <span id="email-error" className="fl-error-msg" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="fl-group" style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                id="login-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                placeholder=" "
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
                aria-label="Password"
                aria-describedby={errors.password ? 'pw-error' : 'pw-strength'}
                aria-invalid={!!errors.password}
              />
              <label htmlFor="login-password">Password</label>

              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 4 }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errors.password && (
              <span id="pw-error" className="fl-error-msg" role="alert">
                {errors.password}
              </span>
            )}

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mt-2.5 px-1" id="pw-strength" aria-live="polite">
                <div
                  className="flex gap-1 mb-1.5"
                  role="progressbar"
                  aria-valuenow={passwordStrength.score}
                  aria-valuemin={0}
                  aria-valuemax={4}
                  aria-label={`Password strength: ${passwordStrength.label}`}
                >
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full"
                      style={{
                        background: i <= passwordStrength.score
                          ? passwordStrength.color
                          : 'var(--border-card)',
                        boxShadow: i <= passwordStrength.score
                          ? `0 0 6px ${passwordStrength.color}80`
                          : 'none',
                        transition: 'background 0.3s ease, box-shadow 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-[10px] font-bold"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={addRipple}
            className="btn-ripple w-full py-5 rounded-2xl font-black text-lg mt-3 flex items-center justify-center gap-3"
            style={{
              background: isSubmitting
                ? 'rgba(56,249,215,0.6)'
                : 'linear-gradient(135deg, #38F9D7 0%, #20C997 100%)',
              color: '#071220',
              boxShadow: '0 12px 36px rgba(56,249,215,0.35)',
              transition: 'all 0.2s ease',
            }}
            aria-label="Submit and enter Relaxify sanctuary"
          >
            {/* Ripple effects */}
            {ripples.map(r => (
              <span
                key={r.id}
                className="ripple"
                style={{ left: r.x - 10, top: r.y - 10 }}
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
                <span>Entering…</span>
              </>
            ) : (
              <>
                <span>Enter Sanctuary</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p
          className="text-center text-[10px] font-medium mt-6"
          style={{ color: 'var(--text-muted)' }}
        >
          All biometric data is processed locally — never transmitted.
        </p>
      </div>
    </div>
  );
};
