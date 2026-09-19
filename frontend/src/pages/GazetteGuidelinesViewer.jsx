import React, { useState } from 'react';
import { BookOpen, Scale, Award, FileText, CheckCircle2, ChevronDown, ChevronRight, Info, Search, Download } from 'lucide-react';
import { assessmentApi } from '../services/assessmentApi';
import { useTheme } from '../context/ThemeContext';

export default function GazetteGuidelinesViewer() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeSection, setActiveSection] = useState('sectionA_upper');

  const questionnairesPdfUrl = assessmentApi.getQuestionnairesPdfDownloadUrl();

  const sections = [
    {
      id: 'sectionA_upper',
      title: '1. Upper Extremity Guidelines (Arm & Hand)',
      subtitle: 'Ministry Notification Section 1.1 - 1.3',
      badge: '90% Max Arm / 90% Max Hand',
      content: {
        intro: 'The upper extremity is divided into two components: Arm Component (90% max) and Hand Component (90% max). Total disability percentage is calculated using the official Gazette combining formula.',
        joints: [
          { name: 'Shoulder Joint', weight: 'Up to 20%', rules: 'Mild (<1/3 loss) = 6.7% | Moderate (1/3 to 2/3 loss) = 13.3% | Severe (>2/3 loss) = 20.0%' },
          { name: 'Elbow Joint', weight: 'Up to 20%', rules: 'Mild (<1/3 loss) = 6.7% | Moderate (1/3 to 2/3 loss) = 13.3% | Severe (>2/3 loss) = 20.0%' },
          { name: 'Wrist Joint', weight: 'Up to 10%', rules: 'Mild (<1/3 loss) = 3.3% | Moderate (1/3 to 2/3 loss) = 6.7% | Severe (>2/3 loss) = 10.0%' },
          { name: 'Hand Component', weight: 'Up to 40%', rules: 'Prehension (30%) + Sensation (30%) + Strength (30%)' }
        ],
        formula: 'Combining Formula: a + [b(90 - a) / 90] where a = higher impairment value, b = lower value.',
        factors: [
          { factor: 'Dominant Right Extremity Involvement', addition: '+10% additional weightage' },
          { factor: 'Mild Pain (slightly interfering)', addition: '+3% PPI' },
          { factor: 'Moderate Pain (interfering with function)', addition: '+6% PPI' },
          { factor: 'Severe Pain (grossly interfering)', addition: '+9% PPI' },
          { factor: 'Deformity in functional position', addition: '+3% PPI' },
          { factor: 'Deformity in non-functional position', addition: '+6% PPI' }
        ]
      }
    },
    {
      id: 'sectionA_lower',
      title: '2. Lower Extremity Guidelines (Mobility & Stability)',
      subtitle: 'Ministry Notification Section 2.1 - 2.3',
      badge: '90% Max Mobility',
      content: {
        intro: 'Lower extremity evaluation is divided into Mobility Component (90% max) and Stability Component (90% max).',
        joints: [
          { name: 'Hip Joint', weight: 'Up to 35%', rules: 'Mild (<1/3 loss) = 11.6% | Moderate (1/3-2/3) = 23.3% | Severe (>2/3) = 35.0%' },
          { name: 'Knee Joint', weight: 'Up to 35%', rules: 'Mild (<1/3 loss) = 11.6% | Moderate (1/3-2/3) = 23.3% | Severe (>2/3) = 35.0%' },
          { name: 'Ankle Joint', weight: 'Up to 20%', rules: 'Mild (<1/3 loss) = 6.7% | Moderate (1/3-2/3) = 13.3% | Severe (>2/3) = 20.0%' }
        ],
        formula: 'Combining Formula for Mobility & Muscle Strength: a + [b(90 - a) / 90]',
        factors: [
          { factor: 'Muscle Power Grade 0 (Zero)', addition: '100% loss of strength (* 0.30 factor)' },
          { factor: 'Muscle Power Grade 1 (Trace)', addition: '80% loss of strength (* 0.30 factor)' },
          { factor: 'Muscle Power Grade 2 (Poor)', addition: '60% loss of strength (* 0.30 factor)' },
          { factor: 'Muscle Power Grade 3 (Fair)', addition: '40% loss of strength (* 0.30 factor)' },
          { factor: 'Muscle Power Grade 4 (Good)', addition: '20% loss of strength (* 0.30 factor)' },
          { factor: 'True Limb Shortening', addition: 'First 1/2 inch = Nil | Every 1/2 inch beyond = +4%' }
        ]
      }
    },
    {
      id: 'sectionB_spine',
      title: '3. Spine Guidelines (Cervical, Thoracolumbar & Deformities)',
      subtitle: 'Ministry Notification Section 3.1 - 4.9',
      badge: 'Cobb Angle & Plumb Line',
      content: {
        intro: 'Spine evaluation covers Cervical Injuries, Disc Lesions, Thoracolumbar Compression, Cobb Angle Kyphoscoliosis, and Torso Imbalance.',
        cobb_angles: [
          { group: 'Group 1 (10° - 20° Cobb Angle)', ppi: '1% to 5% PPI' },
          { group: 'Group 2 (21° - 30° Cobb Angle)', ppi: '6% to 9% PPI' },
          { group: 'Group 3 (31° - 50° Cobb Angle)', ppi: '10% to 19% PPI' },
          { group: 'Group 4 (51° - 75° Cobb Angle)', ppi: '20% to 29% PPI' },
          { group: 'Group 5 (76° - 100° Cobb Angle)', ppi: '30% to 39% PPI' },
          { group: 'Group 6 (101° - 125° Cobb Angle)', ppi: '40% to 60% PPI' },
          { group: 'Group 7 (≥ 126° Cobb Angle)', ppi: '61% to 70% PPI' }
        ],
        plumb_line: [
          { deviation: 'Plumb line deviation up to 1.5 cm', ppi: '4% PPI' },
          { deviation: 'Plumb line deviation 1.6 cm - 3.0 cm', ppi: '8% PPI' },
          { deviation: 'Plumb line deviation 3.1 cm - 5.0 cm', ppi: '16% PPI' },
          { deviation: 'Plumb line deviation ≥ 5.1 cm', ppi: '32% PPI' }
        ]
      }
    },
    {
      id: 'sectionC_amputation',
      title: '4. Amputation Guidelines (Upper & Lower Limb)',
      subtitle: 'Ministry Notification Section 5.1 - 5.3',
      badge: 'Amputee Scale',
      content: {
        intro: 'Pre-determined Gazette rating scale for amputations at various anatomical levels.',
        amputations: [
          { level: 'Fore-quarter amputation', ppi: '100% PPI' },
          { level: 'Shoulder Disarticulation', ppi: '90% PPI' },
          { level: 'Trans Humeral (Above Elbow upper 1/3)', ppi: '85% PPI' },
          { level: 'Trans Radial (Below Elbow lower 1/3)', ppi: '65% PPI' },
          { level: 'Wrist Disarticulation', ppi: '60% PPI' },
          { level: 'Hip Disarticulation', ppi: '90% PPI' },
          { level: 'Trans Femoral (Above Knee)', ppi: '80% - 85% PPI' },
          { level: 'Trans Tibial (Below Knee)', ppi: '60% - 70% PPI' },
          { level: 'Through Ankle / Syme\'s', ppi: '50% - 55% PPI' }
        ]
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className={`p-6 rounded-3xl border space-y-4 transition-all ${
        isLight
          ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md border-slate-700/50'
          : 'bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white border-blue-500/20 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-300 border border-white/20 inline-flex items-center gap-1.5 mb-2 backdrop-blur-md">
              <Scale className="w-3.5 h-3.5" /> Gazette Notification S.O. 1338(E) - 12th March 2024
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Official RPwD Act 2016 Locomotor Disability Guidelines
            </h2>
            <p className="text-slate-300 text-xs mt-1">
              Ministry of Social Justice and Empowerment (Department of Empowerment of Persons with Disabilities - Divyangjan)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={questionnairesPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Questionnaires PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((s) => {
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left p-4 rounded-xl border text-xs transition-all space-y-1 ${
                  active
                    ? isLight
                      ? 'bg-blue-50 border-blue-600 text-slate-900 ring-2 ring-blue-600/20 shadow-2xs font-semibold'
                      : 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/10 font-semibold'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{s.title.split('(')[0]}</span>
                  {active && <ChevronRight className="w-4 h-4 text-blue-600 dark:text-cyan-400" />}
                </div>
                <span className={`text-[11px] block font-mono ${isLight ? 'text-blue-700 font-semibold' : 'text-cyan-400'}`}>{s.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Details Inspector View */}
        <div className={`lg:col-span-3 rounded-2xl p-6 space-y-6 border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-2xs'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          {sections.map((s) => {
            if (s.id !== activeSection) return null;

            return (
              <div key={s.id} className="space-y-6">
                <div>
                  <h3 className={`text-xl font-bold mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{s.title}</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{s.subtitle}</p>
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300'
                }`}>
                  <Info className="w-4 h-4 text-blue-600 dark:text-cyan-400 inline mr-2" />
                  {s.content.intro}
                </div>

                {/* Joints breakdown */}
                {s.content.joints && (
                  <div className="space-y-3">
                    <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
                      Range of Motion (ROM) Joint Weightages & Loss Brackets
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {s.content.joints.map((j, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border space-y-2 ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{j.name}</span>
                            <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                              isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {j.weight}
                            </span>
                          </div>
                          <p className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{j.rules}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Factors */}
                {s.content.factors && (
                  <div className="space-y-3">
                    <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
                      Accompanying Functional Factors & Additions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {s.content.factors.map((f, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{f.factor}</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{f.addition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cobb Angle Table */}
                {s.content.cobb_angles && (
                  <div className="space-y-3">
                    <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
                      Kyphoscoliosis Cobb Angle Permanent Impairment Table
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead className={isLight ? 'bg-slate-50 text-slate-700 font-semibold border-b border-slate-200' : 'bg-slate-950 text-slate-400 font-semibold border-b border-slate-800'}>
                          <tr>
                            <th className="p-3">Cobb Angle Group</th>
                            <th className="p-3">Gazette Disability PPI %</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/60 text-slate-300'}`}>
                          {s.content.cobb_angles.map((c, idx) => (
                            <tr key={idx} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                              <td className="p-3 font-semibold">{c.group}</td>
                              <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{c.ppi}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Amputations Scale */}
                {s.content.amputations && (
                  <div className="space-y-3">
                    <h4 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-blue-800' : 'text-cyan-400'}`}>
                      Amputation Assessment Rating Scale
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {s.content.amputations.map((a, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                        }`}>
                          <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{a.level}</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{a.ppi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
