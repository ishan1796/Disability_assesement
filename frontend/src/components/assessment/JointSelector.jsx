import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function JointSelector({
  bodyRegion,
  bodySide,
  setBodySide,
  selectedJoint,
  setSelectedJoint,
  onPrev,
  onNext
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const getJointsForRegion = (region) => {
    if (region === 'Upper Limb') {
      return [
        { id: 'shoulder', name: 'Shoulder Joint', desc: 'Flexion & Abduction angles (Max 20% PPI)', maxPpi: '20%' },
        { id: 'elbow', name: 'Elbow Joint', desc: 'Flexion / Extension angles (Max 20% PPI)', maxPpi: '20%' },
        { id: 'wrist', name: 'Wrist Joint', desc: 'Wrist Flexion & Extension (Max 10% PPI)', maxPpi: '10%' },
        { id: 'hand', name: 'Hand Component', desc: 'Finger flexion & fist closure (Max 40% PPI)', maxPpi: '40%' },
      ];
    } else if (region === 'Lower Limb') {
      return [
        { id: 'hip', name: 'Hip Joint', desc: 'Hip Flexion & Mobility (Max 35% PPI)', maxPpi: '35%' },
        { id: 'knee', name: 'Knee Joint', desc: 'Knee Flexion & Extension (Max 35% PPI)', maxPpi: '35%' },
        { id: 'ankle', name: 'Ankle Joint', desc: 'Plantardorsiflexion (Max 20% PPI)', maxPpi: '20%' },
        { id: 'foot', name: 'Foot Component', desc: 'Toe movement & weight bearing (Max 20% PPI)', maxPpi: '20%' },
      ];
    } else if (region === 'Neck') {
      return [
        { id: 'neck', name: 'Cervical Spine', desc: 'Forward Flexion & Rotation (Section 3.3)', maxPpi: '20%' },
      ];
    } else {
      return [
        { id: 'spine', name: 'Thoracolumbar Spine', desc: 'Spinal Flexion & Trunk Mobility (Section 4.0)', maxPpi: '30%' },
      ];
    }
  };

  const joints = getJointsForRegion(bodyRegion);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className={`text-2xl font-bold tracking-tight mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
          Step 2: Select Side & Target Joint
        </h3>
        <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          Target articulation for {bodyRegion} evaluation per Gazette guidelines.
        </p>
      </div>

      {/* Side Selection (Left / Right / Both) */}
      {(bodyRegion === 'Upper Limb' || bodyRegion === 'Lower Limb') && (
        <div className="space-y-2">
          <label className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            Target Side
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Left', 'Right', 'Both'].map((side) => {
              const active = bodySide === side;
              return (
                <button
                  key={side}
                  onClick={() => setBodySide(side)}
                  className={`py-2.5 rounded-xl font-semibold text-xs border transition-all flex items-center justify-center gap-2 ${
                    active
                      ? isLight
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : isLight
                        ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {active && <Check className="w-4 h-4" />}
                  <span>{side}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Joint Selection */}
      <div className="space-y-2">
        <label className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Select Joint
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {joints.map((j) => {
            const isSelected = selectedJoint === j.id;
            return (
              <motion.div
                key={j.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedJoint(j.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? isLight
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-2xs'
                      : 'bg-blue-900/30 border-blue-500 text-slate-100 shadow-md shadow-blue-500/20'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{j.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                    isLight ? 'bg-slate-100 text-blue-700 border-slate-200' : 'bg-slate-800 text-cyan-400 border-slate-700'
                  }`}>
                    {j.maxPpi}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{j.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onPrev}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-xs transition ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
        >
          <span>Proceed to Motion Test</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
