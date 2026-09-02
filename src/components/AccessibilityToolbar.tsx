import React from 'react';
import { AccessibilityConfig } from '../types';

interface AccessibilityToolbarProps {
  config: AccessibilityConfig;
  onUpdate: (updated: Partial<AccessibilityConfig>) => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  config,
  onUpdate,
}) => {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#12141D]/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 sm:gap-4 max-w-[95vw] overflow-x-auto">
      <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#adc6ff] uppercase font-bold pr-2 border-r border-white/10 hidden md:flex">
        <span className="material-symbols-outlined text-base">accessibility_new</span>
        <span>ACCESSIBILITY</span>
      </div>

      {/* Language Toggle */}
      <button
        onClick={() =>
          onUpdate({ language: config.language === 'English' ? 'Hindi' : 'English' })
        }
        className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
          config.language === 'Hindi'
            ? 'bg-[#4d8eff]/30 text-[#adc6ff] border-[#4d8eff]'
            : 'bg-[#1d2021] text-[#c2c6d6] border-white/10 hover:bg-[#282a2b]'
        }`}
      >
        <span className="material-symbols-outlined text-sm">translate</span>
        <span>{config.language === 'English' ? 'EN' : 'हिंदी'}</span>
      </button>

      {/* Simple Words Toggle */}
      <button
        onClick={() => onUpdate({ simpleLanguage: !config.simpleLanguage })}
        className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
          config.simpleLanguage
            ? 'bg-[#df7412]/30 text-[#ffb786] border-[#df7412]'
            : 'bg-[#1d2021] text-[#c2c6d6] border-white/10 hover:bg-[#282a2b]'
        }`}
      >
        <span className="material-symbols-outlined text-sm">nature_people</span>
        <span>{config.simpleLanguage ? 'SIMPLE: ON' : 'SIMPLE'}</span>
      </button>

      {/* Font Size Toggle */}
      <button
        onClick={() => onUpdate({ largerText: !config.largerText })}
        className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
          config.largerText
            ? 'bg-purple-500/30 text-purple-300 border-purple-500'
            : 'bg-[#1d2021] text-[#c2c6d6] border-white/10 hover:bg-[#282a2b]'
        }`}
      >
        <span className="material-symbols-outlined text-sm">format_size</span>
        <span>{config.largerText ? 'TEXT: BIG' : 'TEXT'}</span>
      </button>

      {/* High Contrast Toggle */}
      <button
        onClick={() => onUpdate({ highContrast: !config.highContrast })}
        className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
          config.highContrast
            ? 'bg-amber-500/30 text-amber-300 border-amber-500'
            : 'bg-[#1d2021] text-[#c2c6d6] border-white/10 hover:bg-[#282a2b]'
        }`}
      >
        <span className="material-symbols-outlined text-sm">contrast</span>
        <span>{config.highContrast ? 'CONTRAST: HI' : 'CONTRAST'}</span>
      </button>
    </div>
  );
};
