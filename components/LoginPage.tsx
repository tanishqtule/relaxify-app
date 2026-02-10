
import React, { useState } from 'react';

export const LoginPage: React.FC<{ onLogin: (name: string, email: string) => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) newErrors.name = "What's your name?";
    if (!validateEmail(email)) newErrors.email = "Please enter a valid email address.";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(name, email);
    }, 1200);
  };

  return (
    <div className="h-screen w-screen bg-[#F4F7F6] flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px] animate-pulse" />

      <div className={`max-w-[440px] w-full glass-card rounded-[48px] p-8 sm:p-12 premium-shadow border border-white/50 relative z-10 transition-transform duration-500 ${shake ? 'animate-shake' : ''}`}>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        `}</style>

        <div className="text-center mb-10">
          <div className="w-24 h-24 premium-gradient rounded-[32px] flex items-center justify-center text-white mx-auto mb-6 shadow-[0_20px_40px_rgba(102,217,196,0.4)] transform hover:rotate-12 transition-transform overflow-hidden p-4">
             <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" fillOpacity="0.2" />
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
             </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-3">Relaxify</h1>
          <p className="text-gray-500 font-medium italic">Empowering your wellness.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g. Alex"
              className="w-full px-6 py-4 bg-white/60 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-teal-400/20 focus:border-teal-400 transition-all font-semibold text-gray-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Work Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="name@company.com"
              className="w-full px-6 py-4 bg-white/60 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-teal-400/20 focus:border-teal-400 transition-all font-semibold text-gray-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              className="w-full px-6 py-4 bg-white/60 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-teal-400/20 focus:border-teal-400 transition-all font-semibold text-gray-700"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 premium-gradient text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Sanctuary</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
