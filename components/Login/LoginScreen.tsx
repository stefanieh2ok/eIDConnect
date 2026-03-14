'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { THEME_NAMES } from '@/data/constants';
import { UserPreferences } from '@/types';

const LoginScreen: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleAnredeSelect = (anrede: 'sie' | 'du') => {
    dispatch({ type: 'SET_ANREDE', payload: anrede });
    dispatch({ type: 'SET_LOGIN_STEP', payload: 2 });
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: number) => {
    dispatch({ type: 'SET_PREFERENCES', payload: { [key]: value } });
  };

  const handleLogin = () => {
    dispatch({ type: 'SET_LOGGED_IN', payload: true });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-10 text-center text-white">
          <h1 className="text-3xl font-light tracking-widest mb-2">BÜRGER APP</h1>
          <p className="text-sm opacity-90">Swipe. Vote. Change.</p>
        </div>

        <div className="p-8">
          {state.loginStep === 1 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Wie möchten Sie angesprochen werden?
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handleAnredeSelect('sie')}
                  className="p-6 border-2 border-gray-200 hover:border-blue-700 rounded-xl transition-all hover:shadow-md"
                >
                  <div className="text-xl font-semibold mb-1">Sie</div>
                  <div className="text-sm text-gray-600">Förmlich</div>
                </button>
                <button
                  onClick={() => handleAnredeSelect('du')}
                  className="p-6 border-2 border-gray-200 hover:border-blue-700 rounded-xl transition-all hover:shadow-md"
                >
                  <div className="text-xl font-semibold mb-1">Du</div>
                  <div className="text-sm text-gray-600">Persönlich</div>
                </button>
              </div>
            </div>
          )}

          {state.loginStep === 2 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {state.anrede === 'du' ? 'Dein' : 'Ihr'} Politik-Barometer
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Für personalisierte Clara-Empfehlungen
              </p>

              <div className="space-y-5 mb-6">
                {Object.entries(THEME_NAMES).map(([key, name]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{name}</span>
                      <span className="text-sm font-semibold text-blue-700">
                        {state.preferences[key as keyof UserPreferences]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={state.preferences[key as keyof UserPreferences]}
                      onChange={(e) => 
                        handlePreferenceChange(
                          key as keyof UserPreferences, 
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                App starten
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
