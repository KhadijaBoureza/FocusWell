import { useState, useEffect } from "react";

/*
  Custom hook that syncs React state with localStorage.
  Useful for persisting user data such as tasks, notes, or preferences.
*/

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);

      if (!item) {
        return initialValue;
      }

      return JSON.parse(item) as T;
    } catch {
      // If parsing fails, fallback to initial value
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}