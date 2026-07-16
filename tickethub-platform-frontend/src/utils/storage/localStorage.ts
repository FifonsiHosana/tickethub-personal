import { logger } from "../logger";

export function setItem(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    logger.error(`Error setting ${key} in localstorage`, err);
  }
}

export function getItem<T>(key: string): T | undefined {
  try {
    const data = localStorage.getItem(key);
    return data ? (JSON.parse(data) as T) : undefined;
  } catch (err) {
    logger.error(`Error getting ${key} in localStorage`, err);
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    logger.error(`Error removing ${key} in localstorage`, err);
  }
}
