
import React from 'react';

interface ProfileModalProps {
  user: { name: string; email: string };
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-end p-6 bg-black/20 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-fit bg-white rounded-[48px] p-10 premium-shadow border border-white animate-in slide-in-from-right-8 duration-500">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Your Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 premium-gradient rounded-[32px] flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-6">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
          <p className="text-gray-400 font-medium">{user.email}</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-3xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Member Since</p>
            <p className="font-bold text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div className="p-6 bg-teal-50 border border-teal-100 rounded-3xl">
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">Current Tier</p>
            <p className="font-bold text-teal-800 text-lg">Premium Sanctuary Member</p>
          </div>

          <button 
            onClick={onLogout}
            className="w-full py-5 border-2 border-red-50 rounded-2xl text-red-500 font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <span>Log out Securely</span>
          </button>
        </div>
      </div>
    </div>
  );
};
