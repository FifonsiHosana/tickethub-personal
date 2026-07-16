import { getItem, removeItem, setItem } from "@/utils/storage/localStorage";
import { useState, useEffect } from "react";

type DispatchAction<T> = T | ((prevState: T) => T);

export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(() => {
    const data = getItem(key);
    return (data || initialValue) as T;
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
        setItem(key, newValue);
        // Manually dispatch so same-tab listeners fire
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
      setItem(key, action);
      window.dispatchEvent(
        new StorageEvent("storage", { key, newValue: JSON.stringify(action) }),
      );
    }
  }

  function clearState() {
    setValue(undefined as T);
    removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: null }));
  }

  return [value, handleDispatch, clearState] as const;
}
