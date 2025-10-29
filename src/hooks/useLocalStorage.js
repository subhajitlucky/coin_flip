import { useState, useEffect, useCallback } from 'react';

/**
 * Fast localStorage hook for React
 * Provides get, set, and remove functionality with minimal overhead
 *
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {[*, function, function]} - [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from local storage and state
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

/**
 * Fast localStorage utilities for non-React code
 */
export const localStorageUtils = {
  /**
   * Set multiple values at once (faster than multiple setItem calls)
   */
  setMultiple: (entries) => {
    if (typeof window === 'undefined') return;

    try {
      entries.forEach(([key, value]) => {
        window.localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      console.warn('Error setting multiple localStorage values:', error);
    }
  },

  /**
   * Get multiple values at once (faster than multiple getItem calls)
   */
  getMultiple: (keys) => {
    if (typeof window === 'undefined') return {};

    try {
      const result = {};
      keys.forEach((key) => {
        const item = window.localStorage.getItem(key);
        result[key] = item ? JSON.parse(item) : null;
      });
      return result;
    } catch (error) {
      console.warn('Error getting multiple localStorage values:', error);
      return {};
    }
  },

  /**
   * Clear all localStorage data
   */
  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  },

  /**
   * Get all localStorage keys
   */
  keys: () => {
    if (typeof window === 'undefined') return [];
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.warn('Error getting localStorage keys:', error);
      return [];
    }
  }
};
