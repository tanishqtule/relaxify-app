
import React from 'react';

interface ProfileModalProps {
  user: { name: string; email: string };
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-end p-6 backdrop-blur-sm animate-in fade-in"
      style={{ background: 'rgba(7,18,32,0.35)' }}
    >
      <div
        className="w-full max-w-md h-fit rounded-[48px] p-10 premium-shadow animate-in slide-in-from-right-8 duration-500"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
        }}
      >
        <div className="flex justify-between items-center mb-10">
          <h2
            className="text-2xl font-black tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Your Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 premium-gradient rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-6">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {user.name}
          </h3>
          <p style={{ color: 'var(--text-muted)' }} className="font-medium">
            {user.email}
          </p>
        </div>

        <div className="space-y-6">
          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-card)',
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Member Since
            </p>
            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div
            className="p-6 rounded-3xl"
            style={{
              background: 'rgba(56,249,215,0.06)',
              border: '1px solid rgba(56,249,215,0.15)',
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-2"
              style={{ color: 'var(--clr-primary-dark)' }}
            >
              Current Tier
            </p>
            <p className="font-bold text-lg" style={{ color: 'var(--clr-primary)' }}>
              Premium Sanctuary Member
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-5 border-2 rounded-2xl font-black transition-all flex items-center justify-center gap-2"
            style={{
              borderColor: 'rgba(239,68,68,0.2)',
              color: '#EF4444',
            }}
          >
            <span>Log out Securely</span>
          </button>
        </div>
      </div>
    </div>
  );
};
