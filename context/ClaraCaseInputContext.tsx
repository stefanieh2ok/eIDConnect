'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ClaraCaseInputBridge = {
  isActive: boolean;
  focusInput: () => void;
  appendTranscript: (text: string) => void;
  submitPlan: () => void;
  canSubmit: boolean;
  speechSupported: boolean;
  startSpeechInput: () => void;
  speechListening: boolean;
  speechMessage: string | null;
  /** Wegweiser input view: hide floating dock until plan exists or user scrolls past input. */
  showFloatingDock: boolean;
  /** Clarification sheet is open — hide dock to avoid duplicate Clara UI. */
  isClarifying: boolean;
};

export const inactiveClaraCaseInputBridge: ClaraCaseInputBridge = {
  isActive: false,
  focusInput: () => {},
  appendTranscript: () => {},
  submitPlan: () => {},
  canSubmit: false,
  speechSupported: false,
  startSpeechInput: () => {},
  speechListening: false,
  speechMessage: null,
  showFloatingDock: true,
  isClarifying: false,
};

type ClaraCaseInputContextValue = {
  bridge: ClaraCaseInputBridge;
  setBridge: (bridge: ClaraCaseInputBridge) => void;
};

const ClaraCaseInputContext = createContext<ClaraCaseInputContextValue>({
  bridge: inactiveClaraCaseInputBridge,
  setBridge: () => {},
});

export function ClaraCaseInputProvider({ children }: { children: ReactNode }) {
  const [bridge, setBridge] = useState<ClaraCaseInputBridge>(inactiveClaraCaseInputBridge);
  const value = useMemo(() => ({ bridge, setBridge }), [bridge]);
  return (
    <ClaraCaseInputContext.Provider value={value}>{children}</ClaraCaseInputContext.Provider>
  );
}

export function useClaraCaseInputBridge() {
  return useContext(ClaraCaseInputContext).bridge;
}

/** Registers Wegweiser bridge for ClaraDock while ClaraWegweiser is mounted. */
export function useClaraCaseInputBridgeRegistration(bridge: ClaraCaseInputBridge) {
  const { setBridge } = useContext(ClaraCaseInputContext);

  useEffect(() => {
    setBridge(bridge);
    return () => setBridge(inactiveClaraCaseInputBridge);
  }, [bridge, setBridge]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (bridge.isActive) {
      document.documentElement.dataset.claraWegweiserActive = 'true';
      if (bridge.showFloatingDock) {
        delete document.documentElement.dataset.claraWegweiserInputOnly;
      } else {
        document.documentElement.dataset.claraWegweiserInputOnly = 'true';
      }
      if (bridge.isClarifying) {
        document.documentElement.dataset.claraWegweiserClarifying = 'true';
      } else {
        delete document.documentElement.dataset.claraWegweiserClarifying;
      }
    } else {
      delete document.documentElement.dataset.claraWegweiserActive;
      delete document.documentElement.dataset.claraWegweiserInputOnly;
      delete document.documentElement.dataset.claraWegweiserClarifying;
    }
    return () => {
      delete document.documentElement.dataset.claraWegweiserActive;
      delete document.documentElement.dataset.claraWegweiserInputOnly;
      delete document.documentElement.dataset.claraWegweiserClarifying;
    };
  }, [bridge.isActive, bridge.showFloatingDock, bridge.isClarifying]);
}
