// src/lib/url.ts
// 内部リンク用: GitHub Pages のサブパス(base)を安全に前置する。
export function withBase(path: string, base: string = import.meta.env.BASE_URL): string {
  const normalizedBase = (base === '/' ? '' : base).replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
