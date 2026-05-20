import type { Magneto } from "../types";

const STORAGE_KEY = "magnetos-history";

export function loadMagnetos(): Magneto[] {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveMagnetos(magnetos: Magneto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(magnetos));
}