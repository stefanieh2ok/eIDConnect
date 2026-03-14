'use client';

import React from 'react';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 p-4 fixed bottom-0 left-0 right-0" style={{maxWidth: '430px', margin: '0 auto'}}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs text-gray-600">Transparenz • Datenschutz • Sicherheit</span>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-bold">DSGVO</span>
        <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-bold">EU-AI-ACT</span>
        <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs font-bold">eIDAS 2.0</span>
      </div>
      <p className="text-center text-xs text-gray-500 mt-1">
        Deutsche KI • Daten in Deutschland
      </p>
    </footer>
  );
};

export default AppFooter;
