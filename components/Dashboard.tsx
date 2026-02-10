
import React, { useState, useEffect } from 'react';
import { ExerciseType, UserMonitoring } from '../types';

interface DashboardProps {
  onStartExercise: (type: ExerciseType) => void;
  userName: string;
  monitoring?: UserMonitoring;
}

const QUOTES = [
  "Self-care is how you take your power back.",
  "Your mind is a sanctuary. Keep it clean.",
  "Calmness is a superpower.",
  "Health is a relationship between you and your body."
];

const EXERCISE_IMAGES = {
  [ExerciseType.NECK_TILT]: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.HEAD_MOVEMENT]: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.SHOULDER_SHRUG]: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.MEDITATION]: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=600",
  [ExerciseType.EYE_FOCUS]: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=600"
};

export const Dashboard: React.FC<DashboardProps> = ({ onStartExercise, userName, monitoring }) => {
  const [quote, setQuote] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Prominent Greeting Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <p className="text-teal-500 font-black text-xs uppercase tracking-[0.4em]">{greeting}</p>
          </div>
          <h2 className="text-6xl font-black text-[#2C3E50] tracking-tighter leading-tight">
            {userName}<span className="text-teal-400">.</span>
          </h2>
          <p className="text-gray-400 font-medium mt-4 text-lg max-w-xl">
            Focus on your digital wellbeing today.
          </p>
        </div>

        {/* Real-time Eye Health Widget */}
        <div className="bg-white p-6 rounded-[32px] premium-shadow border border-teal-50 min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Eye Health</h4>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black ${monitoring?.isStrained ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
              {monitoring?.isStrained ? 'STRAIN DETECTED' : 'OPTIMAL'}
            </div>
          </div>
          <div className="flex gap-4">
             <div className="flex-1">
               <p className="text-2xl font-black text-gray-800">{monitoring?.blinkRate || 0}</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase">Blinks / Min</p>
             </div>
             <div className="w-px h-8 bg-gray-100 self-center" />
             <div className="flex-1">
               <p className="text-2xl font-black text-gray-800">{monitoring?.sessionBlinks || 0}</p>
               <p className="text-[9px] font-bold text-gray-400 uppercase">Total Blinks</p>
             </div>
          </div>
          <button 
            onClick={() => onStartExercise(ExerciseType.EYE_FOCUS)}
            className="w-full mt-4 py-2 bg-teal-50 text-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-colors"
          >
            Start 20-20-20 Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#2C3E50] rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-teal-400 font-black text-xs uppercase tracking-[0.3em] mb-4">Daily Momentum</p>
              <h2 className="text-3xl font-black mb-4">Ready to Focus?</h2>
              <p className="text-gray-400 font-medium max-w-sm">Consistency is key. Every session improves cognitive performance and physical longevity.</p>
            </div>
            
            <div className="mt-8 flex items-end gap-6">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2">
                  <span>Progress towards goal</span>
                  <span className="text-teal-400">85%</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden p-1">
                  <div className="h-full w-[85%] bg-teal-400 rounded-full shadow-[0_0_15px_rgba(56,249,215,0.6)]" />
                </div>
              </div>
              <button 
                onClick={() => onStartExercise(ExerciseType.MEDITATION)}
                className="px-8 py-4 bg-white text-[#2C3E50] rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Zen Mode
              </button>
            </div>
          </div>
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-teal-400/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-100px] left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="bg-white rounded-[48px] p-10 premium-shadow border border-gray-100 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">Activity Intensity</p>
              <div className="relative">
                <svg className="w-4 h-4 text-gray-300 cursor-help peer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#2C3E50] text-white p-3 rounded-xl text-[10px] opacity-0 peer-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                  Brighter squares mean higher wellness activity on that day.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md transition-all duration-300 hover:scale-125 hover:shadow-md cursor-default ${
                    i > 20 ? 'bg-teal-400' : 
                    i > 15 ? 'bg-teal-200' : 
                    i > 10 ? 'bg-teal-100' : 'bg-gray-50'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-50">
            <h4 className="text-sm font-black text-gray-800 italic leading-snug">"{quote}"</h4>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-3xl font-black text-[#2C3E50] tracking-tight">Active Programs</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ExerciseCard 
            title="Eye Reset"
            description="The 20-20-20 rule to prevent digital eye strain."
            intensity="Zero"
            time="1 min"
            image={EXERCISE_IMAGES[ExerciseType.EYE_FOCUS]}
            onClick={() => onStartExercise(ExerciseType.EYE_FOCUS)}
            isRecommended={monitoring?.isStrained}
          />
          <ExerciseCard 
            title="Neck Tilt Flow"
            description="Reduce stiffness with targeted lateral neck stretches."
            intensity="Low"
            time="5 min"
            image={EXERCISE_IMAGES[ExerciseType.NECK_TILT]}
            onClick={() => onStartExercise(ExerciseType.NECK_TILT)}
          />
          <ExerciseCard 
            title="Head Rotation"
            description="Improve mobility with gentle 360° neck circles."
            intensity="Medium"
            time="3 min"
            image={EXERCISE_IMAGES[ExerciseType.HEAD_MOVEMENT]}
            onClick={() => onStartExercise(ExerciseType.HEAD_MOVEMENT)}
          />
          <ExerciseCard 
            title="Shoulder Shrugs"
            description="Release upper body tension and reset your posture."
            intensity="Low"
            time="4 min"
            image={EXERCISE_IMAGES[ExerciseType.SHOULDER_SHRUG]}
            onClick={() => onStartExercise(ExerciseType.SHOULDER_SHRUG)}
          />
        </div>
      </section>
    </div>
  );
};

interface ExerciseCardProps {
  title: string;
  description: string;
  intensity: string;
  time: string;
  image: string;
  onClick?: () => void;
  isRecommended?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ title, description, intensity, time, image, onClick, isRecommended }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-[40px] p-5 premium-shadow border border-gray-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
    >
      {isRecommended && (
        <div className="absolute top-4 right-4 z-20 bg-teal-400 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg animate-pulse">Critical</div>
      )}
      <div className="h-40 w-full rounded-[30px] overflow-hidden mb-5 relative bg-gray-50 flex items-center justify-center">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 px-3 py-1 rounded-full border border-gray-100">{intensity}</span>
        <span className="text-[9px] font-black uppercase tracking-widest bg-teal-50 text-teal-600 px-3 py-1 rounded-full border border-teal-100">{time}</span>
      </div>
      <h4 className="text-lg font-black text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">{title}</h4>
      <p className="text-xs text-gray-400 font-medium leading-relaxed">{description}</p>
    </div>
  );
};
