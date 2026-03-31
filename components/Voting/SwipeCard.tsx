import React, { useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface SwipeCardProps {
  abstimmung: {
    id: number;
    titel: string;
    text: string;
    kategorie: string;
    deadline: string;
    pro: string[];
    contra: string[];
  };
  onVote: (id: number, vote: 'ja' | 'nein') => void;
  onInfo: (id: number) => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ abstimmung, onVote, onInfo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX.current;
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (dragOffset > threshold) {
      // Swipe right = dafür
      onVote(abstimmung.id, 'ja');
    } else if (dragOffset < -threshold) {
      // Swipe left = dagegen
      onVote(abstimmung.id, 'nein');
    }
    
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const rotation = dragOffset * 0.1;
  const opacity = 1 - Math.abs(dragOffset) / 200;

  return (
    <div
      ref={cardRef}
      className={`swipe-card glass-card rounded-xl overflow-hidden ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
        opacity: Math.max(opacity, 0.3)
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="glass-card-header text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{abstimmung.titel}</h3>
            <p className="text-sm opacity-90">{abstimmung.kategorie}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
              <span>Frist</span>
            </div>
            <div className="text-sm font-bold">{abstimmung.deadline}</div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <p className="text-gray-700 mb-6">{abstimmung.text}</p>
        
        {/* Swipe Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ThumbsDown className="text-red-500" size={16} />
              <span>← Dagegen</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-1">
              <span>Dafür →</span>
              <ThumbsUp className="text-green-500" size={16} />
            </div>
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-2"
        >
          {showDetails ? 'Weniger Details' : 'Mehr Details'}
        </button>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <ThumbsUp className="text-green-600" size={16} />
                  Dafür sprechen
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {abstimmung.pro.map((punkt, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{punkt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                  <ThumbsDown className="text-red-600" size={16} />
                  Dagegen sprechen
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {abstimmung.contra.map((punkt, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>{punkt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2">Weitere Informationen</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>• Abstimmung läuft bis {abstimmung.deadline}</div>
                <div>• Mindestbeteiligung: 20% der Wahlberechtigten</div>
                <div>• Mehrheitsentscheidung erforderlich</div>
                <div>• Ergebnis wird öffentlich bekannt gegeben</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onVote(abstimmung.id, 'nein')}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <ThumbsDown size={18} />
            Dagegen
          </button>
          <button
            onClick={() => onInfo(abstimmung.id)}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
          >
            Info
          </button>
          <button
            onClick={() => onVote(abstimmung.id, 'ja')}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            Dafür
            <ThumbsUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;


