import React, { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  category: 'wahl' | 'engagement' | 'streak' | 'special';
  requirement: string;
}

interface User {
  level: number;
  points: number;
  votes: number;
  badges: string[];
  streak: number;
  joinDate: Date;
}

interface RewardSystemProps {
  user: User;
  onLevelUp: (newLevel: number) => void;
}

const RewardSystem: React.FC<RewardSystemProps> = ({ user, onLevelUp }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Erweiterte Badges
  const badges: Badge[] = [
    // Wahl-Badges
    { id: 'erstwahl', name: 'Erstwähler', description: 'Erste Wahl abgegeben', icon: '🗳️', points: 100, unlocked: user.badges.includes('erstwahl'), category: 'wahl', requirement: '1 Wahl' },
    { id: 'bundeswahl', name: 'Bundesbürger', description: 'An Bundestagswahl teilgenommen', icon: '🇩🇪', points: 100, unlocked: user.badges.includes('bundeswahl'), category: 'wahl', requirement: 'Bundestagswahl' },
    { id: 'landeswahl', name: 'Landesbürger', description: 'An Landtagswahl teilgenommen', icon: '🏛️', points: 75, unlocked: user.badges.includes('landeswahl'), category: 'wahl', requirement: 'Landtagswahl' },
    { id: 'kommunalwahl', name: 'Kommunalbürger', description: 'An Kommunalwahl teilgenommen', icon: '🏘️', points: 50, unlocked: user.badges.includes('kommunalwahl'), category: 'wahl', requirement: 'Kommunalwahl' },
    { id: 'alle-ebenen', name: 'Föderalismus-Experte', description: 'Auf allen 5 Ebenen gewählt', icon: '⭐', points: 500, unlocked: user.badges.includes('alle-ebenen'), category: 'wahl', requirement: 'Alle Ebenen' },
    
    // Engagement-Badges
    { id: 'informiert', name: 'Informiert', description: '10 Wahlprogramme gelesen', icon: '📚', points: 200, unlocked: user.badges.includes('informiert'), category: 'engagement', requirement: '10 Programme' },
    { id: 'ki-fan', name: 'KI-Fan', description: '50 Clara-Fragen gestellt', icon: '🤖', points: 150, unlocked: user.badges.includes('ki-fan'), category: 'engagement', requirement: '50 Fragen' },
    { id: 'diskussion', name: 'Diskutierer', description: 'An 5 Diskussionen teilgenommen', icon: '💬', points: 100, unlocked: user.badges.includes('diskussion'), category: 'engagement', requirement: '5 Diskussionen' },
    { id: 'petition', name: 'Petitionär', description: '3 Petitionen unterzeichnet', icon: '📝', points: 75, unlocked: user.badges.includes('petition'), category: 'engagement', requirement: '3 Petitionen' },
    
    // Streak-Badges
    { id: 'streak-3', name: 'Kontinuierlich', description: '3 Wahlen in Folge', icon: '🔥', points: 200, unlocked: user.streak >= 3, category: 'streak', requirement: '3 Streak' },
    { id: 'streak-5', name: 'Streak Master', description: '5 Wahlen in Folge', icon: '⚡', points: 300, unlocked: user.streak >= 5, category: 'streak', requirement: '5 Streak' },
    { id: 'streak-10', name: 'Demokratie-Champion', description: '10 Wahlen in Folge', icon: '👑', points: 500, unlocked: user.streak >= 10, category: 'streak', requirement: '10 Streak' },
    
    // Special-Badges
    { id: 'beta-tester', name: 'Beta-Tester', description: 'App vor Release getestet', icon: '🧪', points: 300, unlocked: user.badges.includes('beta-tester'), category: 'special', requirement: 'Beta-Programm' },
    { id: 'feedback', name: 'Feedback-Geber', description: '10 konstruktive Rückmeldungen', icon: '💡', points: 150, unlocked: user.badges.includes('feedback'), category: 'special', requirement: '10 Feedback' },
    { id: 'botschafter', name: 'Botschafter', description: '5 Freunde zur App eingeladen', icon: '🤝', points: 200, unlocked: user.badges.includes('botschafter'), category: 'special', requirement: '5 Einladungen' },
    { id: 'jahresabschluss', name: 'Jahresabschluss', description: 'Ein Jahr aktiv dabei', icon: '🎊', points: 400, unlocked: user.badges.includes('jahresabschluss'), category: 'special', requirement: '1 Jahr' }
  ];

  // Level-System
  const levels = [
    { level: 1, name: 'Bürger', min: 0, max: 100, color: '#6B7280', icon: '👤' },
    { level: 2, name: 'Aktiver Bürger', min: 100, max: 500, color: '#3B82F6', icon: '⭐' },
    { level: 3, name: 'Demokrat', min: 500, max: 1000, color: '#8B5CF6', icon: '🏛️' },
    { level: 4, name: 'Demokratie-Experte', min: 1000, max: 2000, color: '#F59E0B', icon: '🎓' },
    { level: 5, name: 'Demokratie-Champion', min: 2000, max: 5000, color: '#EF4444', icon: '👑' },
    { level: 6, name: 'Demokratie-Legende', min: 5000, max: 10000, color: '#10B981', icon: '🌟' }
  ];

  const currentLevel = levels.find(l => user.points >= l.min && user.points < l.max) || levels[levels.length - 1];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  const progressToNext = nextLevel ? ((user.points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  // Kategorien
  const categories = [
    { id: 'all', name: 'Alle', icon: '🏆' },
    { id: 'wahl', name: 'Wahlen', icon: '🗳️' },
    { id: 'engagement', name: 'Engagement', icon: '💪' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'special', name: 'Spezial', icon: '✨' }
  ];

  // Gefilterte Badges
  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || badge.unlocked;
    return categoryMatch && unlockedMatch;
  });

  // Statistiken
  const stats = {
    totalBadges: badges.length,
    unlockedBadges: badges.filter(b => b.unlocked).length,
    totalPoints: badges.reduce((sum, b) => sum + (b.unlocked ? b.points : 0), 0),
    categoryStats: categories.map(cat => ({
      ...cat,
      total: badges.filter(b => b.category === cat.id || cat.id === 'all').length,
      unlocked: badges.filter(b => (b.category === cat.id || cat.id === 'all') && b.unlocked).length
    }))
  };

  return (
    <div className="space-y-6">
      {/* Level Progress */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Level {currentLevel.level}: {currentLevel.name}</h2>
              <p className="text-sm opacity-90">{user.points} Punkte gesammelt</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt zu Level {currentLevel.level + 1}</span>
              <span>{Math.round(progressToNext)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="level-progress h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              ></div>
            </div>
            {nextLevel && (
              <div className="text-sm text-gray-600 mt-2">
                Noch {nextLevel.min - user.points} Punkte bis &quot;{nextLevel.name}&quot;
              </div>
            )}
          </div>

          {/* Level Benefits */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-2">Aktuelle Vorteile</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Erweiterte Clara-Features</li>
                <li>• Exklusive Badges verfügbar</li>
                <li>• Früher Zugang zu neuen Features</li>
                <li>• Priorität im Support</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-800 mb-2">Nächste Vorteile</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Persönliche Demokratie-Beratung</li>
                <li>• Einladung zu Bürgerforen</li>
                <li>• Beta-Tester für neue Funktionen</li>
                <li>• Exklusive Events</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiken */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-green-200">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Deine Statistiken</h2>
              <p className="text-sm opacity-90">Fortschritt und Erfolge</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.unlockedBadges}</div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.votes}</div>
              <div className="text-sm text-gray-600">Wahlen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{user.streak}</div>
              <div className="text-sm text-gray-600">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">Punkte</div>
            </div>
          </div>

          {/* Kategorie-Statistiken */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">Fortschritt nach Kategorien</h3>
            {stats.categoryStats.map(stat => {
              const percentage = stat.total > 0 ? (stat.unlocked / stat.total) * 100 : 0;
              return (
                <div key={stat.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{stat.name}</span>
                    <span>{stat.unlocked}/{stat.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold">Badges</h2>
                <p className="text-sm opacity-90">{stats.unlockedBadges} von {stats.totalBadges} freigeschaltet</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  showUnlockedOnly 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {showUnlockedOnly ? 'Alle' : 'Nur Freigeschaltet'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Kategorie-Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Badge Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map(badge => (
              <div 
                key={badge.id} 
                className={`p-4 rounded-lg border-2 transition-all ${
                  badge.unlocked 
                    ? 'border-green-200 bg-green-50 badge-unlock' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-gray-800">{badge.name}</div>
                      {badge.unlocked ? (
                        <span className="text-green-600 text-xs font-bold">OFFEN</span>
                      ) : (
                        <span className="text-gray-400 text-xs font-bold">GESPERRT</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{badge.description}</div>
                    <div className="text-xs text-blue-600 font-medium">+{badge.points} Punkte</div>
                    <div className="text-xs text-gray-500 mt-1">Erfordert: {badge.requirement}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Punkte sammeln */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold">Punkte sammeln</h2>
              <p className="text-sm opacity-90">So erreichst du das nächste Level</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Wahlen & Abstimmungen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bundestagswahl</span>
                  <span className="font-bold text-green-600">+100 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>Landtagswahl</span>
                  <span className="font-bold text-green-600">+75 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>Kreistagswahl</span>
                  <span className="font-bold text-green-600">+50 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>Kommunalwahl</span>
                  <span className="font-bold text-green-600">+25 Punkte</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Engagement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Wahlprogramm lesen</span>
                  <span className="font-bold text-blue-600">+10 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>Clara fragen</span>
                  <span className="font-bold text-blue-600">+5 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>Petition unterzeichnen</span>
                  <span className="font-bold text-blue-600">+25 Punkte</span>
                </div>
                <div className="flex justify-between">
                  <span>Feedback geben</span>
                  <span className="font-bold text-blue-600">+15 Punkte</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardSystem;





