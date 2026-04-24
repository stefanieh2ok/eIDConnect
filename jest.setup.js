require('@testing-library/jest-dom');

// localStorage mock für Tests (Persistenz)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i] ?? null,
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// jsdom: scrollTo loggt sonst „Not implemented“ (wirkt wie throw) — stiller No-Op für Tests
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
