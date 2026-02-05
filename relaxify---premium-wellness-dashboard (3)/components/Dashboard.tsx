
import React from 'react';
import { ExerciseType } from '../types';

interface DashboardProps {
  onStartExercise: (type: ExerciseType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartExercise }) => {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#2C3E50]">Core Programs</h2>
          <div className="text-sm font-medium text-teal-600 cursor-pointer hover:underline">View All</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ExerciseCard 
            title="Neck Tilt Flow"
            description="Lateral stretches to reduce stiffness in the cervical spine."
            intensity="Low"
            time="5 min"
            image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"
            onClick={() => onStartExercise(ExerciseType.NECK_TILT)}
          />
          <ExerciseCard 
            title="Head Rotation"
            description="360° circular movements to release upper shoulder tension."
            intensity="Medium"
            time="3 min"
            image="https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=600"
            onClick={() => onStartExercise(ExerciseType.HEAD_MOVEMENT)}
          />
          <ExerciseCard 
            title="Shoulder Shrugs"
            description="Vertical tension release for the trapezius and upper back."
            intensity="Low"
            time="4 min"
            image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600"
            onClick={() => onStartExercise(ExerciseType.SHOULDER_SHRUG)}
          />
        </div>
      </section>

      <section className="bg-white p-8 rounded-[40px] premium-shadow border border-gray-100 flex items-center gap-12">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-3">Daily Health Insight</h3>
          <p className="text-gray-500 leading-relaxed mb-6">
            Based on your activity, your neck tension usually peaks around 3:00 PM. 
            Schedule a short break now to prevent evening fatigue.
          </p>
          <button className="px-8 py-3 bg-[#2C3E50] text-white rounded-full font-bold hover:bg-black transition-colors">
            Personalize Plan
          </button>
        </div>
        <div className="hidden lg:block w-64 h-48 premium-gradient rounded-[30px] premium-shadow rotate-3 flex items-center justify-center text-white">
          <svg className="w-20 h-20 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
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
  locked?: boolean;
  onClick?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ title, description, intensity, time, image, locked, onClick }) => {
  return (
    <div 
      onClick={!locked ? onClick : undefined}
      className={`group relative bg-white rounded-[40px] p-6 premium-shadow border border-gray-100 transition-all duration-300 ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-2 cursor-pointer'}`}
    >
      <div className="h-48 w-full rounded-[30px] overflow-hidden mb-6 relative">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {locked && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest bg-teal-50 text-teal-600 px-3 py-1 rounded-full">{intensity}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-50 text-gray-500 px-3 py-1 rounded-full">{time}</span>
      </div>
      
      <h4 className="text-xl font-bold mb-2 group-hover:text-teal-600 transition-colors">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{description}</p>
      
      {!locked && (
        <div className="mt-6 flex justify-end">
          <div className="w-10 h-10 premium-gradient rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
