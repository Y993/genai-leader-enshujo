import { describe, it, expect } from 'vitest';
import { withBase } from './url';

describe('withBase', () => {
  it('prefixes the base path and avoids double slashes', () => {
    expect(withBase('/categories/fundamentals/', '/genai-leader-enshujo')).toBe(
      '/genai-leader-enshujo/categories/fundamentals/'
    );
  });
  it('handles base without trailing slash and path with leading slash', () => {
    expect(withBase('/about/', '/genai-leader-enshujo')).toBe('/genai-leader-enshujo/about/');
  });
  it('treats empty/root base as no prefix', () => {
    expect(withBase('/about/', '')).toBe('/about/');
    expect(withBase('/about/', '/')).toBe('/about/');
  });
});
