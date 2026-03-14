'use client';

import React, { memo } from 'react';
import { Clock, Sparkles, Check, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { VotingCard as VotingCardType, VoteType } from '@/types';
import ClaraInfoBox from '@/components/Clara/ClaraInfoBox';

interface VotingCardProps {
  card: VotingCardType;
  canVote: boolean;
  dragOffset: number;
  isDragging: boolean;
  showKIAnalysis: boolean;
  onDragStart: (clientX: number) => void;
  onDragMove: (clientX: number) => void;
  onDragEnd: () => void;
  onVote: (voteType: VoteType) => void;
  onToggleKIAnalysis: () => void;
  onOpenClaraChat: () => void;
}

const VotingCard: React.FC<VotingCardProps> = memo(({
  card,
  canVote,
  dragOffset,
  isDragging,
  showKIAnalysis,
  onDragStart,
  onDragMove,
  onDragEnd,
  onVote,
  onToggleKIAnalysis,
  onOpenClaraChat
}) => {
  return (
    <div
      className="glass-card rounded-3xl overflow-hidden"
      style={{
        transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
        opacity: isDragging ? 0.9 : 1,
        transition: isDragging ? 'none' : 'all 0.3s'
      }}
      onMouseDown={(e) => canVote && onDragStart(e.clientX)}
      onMouseMove={(e) => canVote && onDragMove(e.clientX)}
      onMouseUp={() => canVote && onDragEnd()}
      onMouseLeave={() => canVote && onDragEnd()}
      onTouchStart={(e) => canVote && onDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => canVote && onDragMove(e.touches[0].clientX)}
      onTouchEnd={() => canVote && onDragEnd()}
    >
      {/* Card Header */}
      <div className="relative h-64 glass-card-header flex items-center justify-center">
        <div className="text-7xl">{card.emoji}</div>
        {card.urgent && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
            {card.deadline}
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1.5 rounded-full text-xs font-semibold">
          {card.category}
        </div>
        {card.claraMatch > 70 && (
          <div className="absolute bottom-4 right-4 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
            <Sparkles size={14} />
            {card.claraMatch}%
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {card.nummer && (
          <div className="text-xs text-gray-500 mb-2">Vorlage {card.nummer}</div>
        )}
        <h2 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h2>
        <p className="text-sm text-gray-600 mb-4">{card.description}</p>

        {/* Quick Facts */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            {card.quickFacts.map((fact, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs">
                <Check size={14} className="text-blue-900 mt-0.5 flex-shrink-0" />
                <span>{fact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Status */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span className="font-semibold">Live-Status</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Wird gerade gezählt
            </span>
          </div>
          <div className="flex h-12 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-green-600 flex items-center justify-center text-white text-sm font-bold" 
              style={{width: `${card.yes}%`}}
            >
              {card.yes}%
            </div>
            <div 
              className="bg-red-600 flex items-center justify-center text-white text-sm font-bold" 
              style={{width: `${card.no}%`}}
            >
              {card.no}%
            </div>
            {card.abstain > 0 && (
              <div 
                className="bg-gray-400 flex items-center justify-center text-white text-sm font-bold" 
                style={{width: `${card.abstain}%`}}
              >
                {card.abstain}%
              </div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{card.votes.toLocaleString('de-DE')} Abstimmende</span>
            <span className="font-bold text-blue-900">+{card.points} Punkte</span>
          </div>
        </div>

        {/* Regionale Ergebnisse */}
        {card.regionalResults && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4 border border-blue-200">
            <h4 className="font-semibold text-sm mb-2">Regionale Verteilung</h4>
            {card.regionalResults.map((region, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 text-xs">
                <span className="font-medium">{region.land}</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-700 font-bold">{region.yes}%</span>
                  <span className="text-gray-500">/</span>
                  <span className="text-red-700 font-bold">{region.no}%</span>
                  {region.trend && (
                    <span className="text-gray-600 italic ml-2">{region.trend}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KI Analysis Button */}
        <button
          onClick={onToggleKIAnalysis}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 hover:shadow-lg transition-all"
        >
          <Sparkles size={16} />
          {showKIAnalysis ? 'Clara ausblenden' : 'Clara-KI Deep Dive'}
        </button>

        {/* Clara AI Analysis */}
        {showKIAnalysis && (
          <ClaraInfoBox card={card} onOpenChat={onOpenClaraChat} />
        )}
      </div>
    </div>
  );
});

VotingCard.displayName = 'VotingCard';

export default VotingCard;
