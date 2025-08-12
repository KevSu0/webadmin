// Custom hook for localStorage management
import { useState, useEffect } from 'react';

type SetValue<T> = T | ((val: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: SetValue<T>) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

// Hook for managing cart in localStorage
export function useCartStorage() {
  return useLocalStorage('camera-world-cart', {
    items: [],
    totalItems: 0,
    totalAmount: 0
  });
}

// Hook for managing user preferences
export function useUserPreferences() {
  return useLocalStorage('camera-world-preferences', {
    theme: 'light',
    currency: 'USD',
    language: 'en',
    notifications: true
  });
}

// Hook for managing recently viewed products
export function useRecentlyViewed() {
  return useLocalStorage<string[]>('camera-world-recent', []);
}