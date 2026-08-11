import { useState, useEffect } from "react";

type DispatchAction<T> = T | ((prevState: T) => T);

export default function useSessionStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    try {
      const data = sessionStorage.getItem(key);
      return (data ? (JSON.parse(data) as T) : initialValue) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === key) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
        setValue(newValue);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  function handleDispatch(action: DispatchAction<T>) {
    if (typeof action === "function") {
      setValue((prevState) => {
        const newValue = (action as (prevState: T) => T)(prevState);
        try {
          sessionStorage.setItem(key, JSON.stringify(newValue));
        } catch {
          // no-op
        }
        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: JSON.stringify(newValue),
          }),
        );
        return newValue;
      });
    } else {
      setValue(action);
      try {
        sessionStorage.setItem(key, JSON.stringify(action));
      } catch {
        // no-op
      }
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: JSON.stringify(action) }),
      );
    }
  }

  function clearState() {
    setValue(undefined as T);
    try {
      sessionStorage.removeItem(key);
    } catch {
      // no-op
    }
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: null }));
  }

  return [value, handleDispatch, clearState] as const;
}
