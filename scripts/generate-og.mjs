/**
 * generate-og.mjs
 * Generates public/og-default.png (1200×630) using Sharp.
 * Produces a branded image with the site name and subtitle as SVG → PNG.
 */
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, '..', 'public');
const outFile = join(outDir, 'og-default.png');

mkdirSync(outDir, { recursive: true });

// 1200×630 SVG — dark navy background, azure accent, white text
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Navy gradient background -->
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a1628"/>
      <stop offset="100%" stop-color="#14305e"/>
    </linearGradient>
    <!-- Subtle diagonal grid pattern -->
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0L0 0 0 60" fill="none" stroke="rgba(26,108,244,0.08)" stroke-width="1"/>
    </pattern>
    <!-- Azure accent glow -->
    <radialGradient id="glow" cx="60%" cy="40%" r="50%">
      <stop offset="0%" stop-color="rgba(26,108,244,0.18)"/>
      <stop offset="100%" stop-color="rgba(26,108,244,0)"/>
    </radialGradient>
  </defs>

  <!-- Background layers -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Left accent bar -->
  <rect x="72" y="120" width="4" height="200" rx="2" fill="#1a6cf4"/>

  <!-- Site name -->
  <text x="104" y="220"
        font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo',sans-serif"
        font-size="72"
        font-weight="700"
        fill="#ffffff"
        letter-spacing="-2">GenAI Leader</text>
  <text x="104" y="308"
        font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo',sans-serif"
        font-size="72"
        font-weight="700"
        fill="#4589f7"
        letter-spacing="-2">演習場</text>

  <!-- Subtitle -->
  <text x="104" y="380"
        font-family="'Hiragino Sans','Noto Sans JP','Yu Gothic','Meiryo',sans-serif"
        font-size="28"
        font-weight="400"
        fill="#9ba4b4"
        letter-spacing="1">Google Cloud 生成AI リーダー認定 — 無料学習サイト</text>

  <!-- Decorative dots cluster (top-right) -->
  <circle cx="1050" cy="140" r="80" fill="rgba(26,108,244,0.06)"/>
  <circle cx="1100" cy="120" r="50" fill="rgba(26,108,244,0.08)"/>
  <circle cx="1140" cy="180" r="30" fill="rgba(26,108,244,0.10)"/>

  <!-- Bottom border stripe -->
  <rect x="0" y="618" width="1200" height="12" fill="#1a6cf4" opacity="0.6"/>
  <rect x="0" y="622" width="360" height="8" rx="0" fill="#1a6cf4"/>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(outFile);

console.log(`OG image written to ${outFile}`);
