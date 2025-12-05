import React from 'react';
import { useTreeStore } from './store';

export const UI = () => {
  const addPhoto = useTreeStore(s => s.addPhoto);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          addPhoto(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-8">
      <h1 className="text-4xl md:text-6xl font-serif text-[#FFD700] text-center drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
        GRAND LUXURY CHRISTMAS
      </h1>

      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <label className="cursor-pointer group flex items-center space-x-3 bg-gradient-to-r from-[#004030] to-[#002018] border border-[#FFD700] px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          <span className="text-[#FFD700] font-bold tracking-widest uppercase text-sm">Upload Memory</span>
          <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-[#004030] font-bold text-xl">
            +
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#FFD700]/60 text-sm font-mono text-center">
        <p>GESTURE CONTROL ACTIVE</p>
        <p>Open Hands: EXPLODE • Fists: ASSEMBLE</p>
      </div>
    </div>
  );
};