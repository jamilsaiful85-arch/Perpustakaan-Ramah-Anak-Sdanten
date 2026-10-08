import React from 'react';

// Official Library Logo: PERPUSTAKAAN SD NEGERI 1 SRIMENGANTEN
export function LibraryLogo({ className = "w-16 h-16", showBadge = false }: { className?: string; showBadge?: boolean }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img 
        src="https://iili.io/CJcYCCJ.png" 
        alt="Logo Perpustakaan SD Negeri 1 Srimenganten" 
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105"
        loading="eager"
      />
    </div>
  );
}

// Official School Logo: SD NEGERI 1 SRIMENGANTEN (SDANTEN)
export function SchoolLogo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img 
        src="https://iili.io/CpoEzXf.png" 
        alt="Logo SD Negeri 1 Srimenganten" 
        className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-105"
        loading="eager"
      />
    </div>
  );
}

