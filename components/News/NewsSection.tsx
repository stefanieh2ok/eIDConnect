'use client';

import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { NEWS_DATA } from '@/data/constants';

const NewsSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Newspaper size={20} />
        Berichterstattung
      </h2>
      
      {NEWS_DATA.map(news => (
        <div key={news.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Newspaper size={24} className="text-blue-900" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{news.title}</h3>
              <div className="text-xs text-gray-600 mb-2">
                {news.source} • {news.date}
              </div>
              <p className="text-xs text-gray-700 mb-2">{news.snippet}</p>
              <a 
                href={news.url} 
                className="text-xs text-blue-900 font-semibold flex items-center gap-1 hover:underline"
              >
                Artikel lesen
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsSection;
