import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategory } from './categories';
import { CATEGORY_SLUGS } from '../lib/schema';

describe('CATEGORIES', () => {
  it('defines exactly the 4 official slugs', () => {
    expect(CATEGORIES.map((c) => c.slug).sort()).toEqual([...CATEGORY_SLUGS].sort());
  });
  it('weights sum to 100', () => {
    expect(CATEGORIES.reduce((s, c) => s + c.weightPercent, 0)).toBe(100);
  });
  it('every category has a non-empty Japanese title and intro', () => {
    for (const c of CATEGORIES) {
      expect(c.titleJa.length).toBeGreaterThan(0);
      expect(c.intro.length).toBeGreaterThan(20);
      expect(c.targetCount).toBeGreaterThan(0);
    }
  });
});

describe('getCategory', () => {
  it('returns the category for a known slug', () => {
    expect(getCategory('fundamentals')?.slug).toBe('fundamentals');
  });
  it('returns undefined for an unknown slug', () => {
    expect(getCategory('nope')).toBeUndefined();
  });
});
