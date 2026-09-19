import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function RegionSelector({ selectedRegion, setSelectedRegion, onNext }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const regions = [
    {
      id: 'Upper Limb',
      title: 'Upper Limb',
      desc: 'Shoulder, Elbow, Wrist, Hand motion analysis & functional ROM',
      icon: '💪',
      badge: '4 Joints / Section 1.2'
    },
    {
      id: 'Lower Limb',
      title: 'Lower Limb',
      desc: 'Hip, Knee, Ankle, Foot gait & flexion restriction tests',
      icon: '🦵',
      badge: '4 Joints / Section 2.1'
    },
    {
      id: 'Neck',
      title: 'Neck (Cervical Spine)',
      desc: 'Forward flexion & head rotation cervical alignment',
      icon: '👤',
      badge: 'Cervical / Section 3.3'
    },
    {
      id: 'Spine',
      title: 'Spine (Thoracolumbar)',
      desc: 'Lumbar flexion & lateral spinal bending angle tracking',
      icon: '🦴',
      badge: 'Thoracolumbar / Section 4.0'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className={`text-2xl font-bold tracking-tight mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          Step 1: Select Anatomical Region
        </h3>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Select target body region for standardized Range of Motion (ROM) assessment per Gazette criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((reg) => {
          const isSelected = selectedRegion === reg.id;
          return (
            <motion.div
              key={reg.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedRegion(reg.id)}
              className={`cursor-pointer p-6 rounded-2xl border transition-all duration-150 ${
                isSelected
                  ? isLight
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                    : 'bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/40'
                  : isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{reg.icon}</span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                  isLight
                    ? 'bg-slate-100 border-slate-200 text-blue-700'
                    : 'bg-slate-800 border border-slate-700 text-cyan-400'
                }`}>
                  {reg.badge}
                </span>
              </div>
              <h4 className={`text-base font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{reg.title}</h4>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{reg.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
        >
          <span>Continue to Joint Selection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
