// src/lib/storage.ts
import { type Progress, emptyProgress, serialize, deserialize } from './progress';

const KEY = 'genai-leader-enshujo:progress:v1';

export function loadProgress(): Progress {
  if (typeof localStorage === 'undefined') return emptyProgress();
  const raw = localStorage.getItem(KEY);
  return raw ? deserialize(raw) : emptyProgress();
}

export function saveProgress(p: Progress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, serialize(p));
}
