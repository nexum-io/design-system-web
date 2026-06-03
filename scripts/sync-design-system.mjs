#!/usr/bin/env node
/**
 * Design System token generator.
 *
 * Single source of truth: src/design-system/tokens/*.json (Tokens Studio format).
 * Generates:
 *   - src/design-system/styles/tokens.css  (`:root` light + `.dark` overrides + typography classes)
 *   - src/design-system/tokens.ts          (typed runtime map mirroring the CSS variables)
 *
 * Re-skin workflow: edit tokens/core.json + tokens/semantic.json, then run
 *   npm run sync:design-system
 * and the whole system updates — components are never touched.
 *
 * Usage:
 *   node scripts/sync-design-system.mjs           # regenerate (writes files)
 *   node scripts/sync-design-system.mjs --check    # verify files are in sync (CI guard); non-zero exit on drift
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
// Locate the DS package. Works in the canonical repo (package at repo root, '.')
// and in a consumer where it is mounted at src/design-system.
const DS_DIR = ['.', 'src/design-system', 'design-system']
  .map((c) => join(ROOT, c))
  .find((p) => existsSync(join(p, 'tokens', '$metadata.json')));
if (!DS_DIR) {
  throw new Error('Could not locate design-system/tokens (looked in ., src/design-system, design-system).');
}
const TOKENS_DIR = join(DS_DIR, 'tokens');
const CSS_OUT = join(DS_DIR, 'styles/tokens.css');
const TS_OUT = join(DS_DIR, 'tokens.ts');

const CHECK = process.argv.includes('--check');

// ---------------------------------------------------------------------------
// Load + merge token sets in the order declared by $metadata.json.
// ---------------------------------------------------------------------------
const meta = JSON.parse(readFileSync(join(TOKENS_DIR, '$metadata.json'), 'utf8'));
const sets = {};
for (const name of meta.tokenSetOrder) {
  sets[name] = JSON.parse(readFileSync(join(TOKENS_DIR, `${name}.json`), 'utf8'));
}
const core = sets.core;
const semantic = sets.semantic.semantic; // { light, dark }
const typography = sets.typography.type;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const kebab = (s) => String(s).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Read a literal `.value` from the core tree by dot-path array. */
function coreValue(parts) {
  let node = core;
  for (const p of parts) node = node?.[p];
  if (node && typeof node === 'object' && 'value' in node) return node.value;
  throw new Error(`Core token not found: ${parts.join('.')}`);
}

/** Map a core token dot-path to its CSS custom-property name (mirrors emitters). */
function coreVarName(parts) {
  const [g, ...rest] = parts;
  switch (g) {
    case 'color': return `--ds-color-${rest.join('-')}`;
    case 'space': return `--ds-space-${rest.join('-')}`;
    case 'radius': return `--ds-radius-${rest.join('-')}`;
    case 'shadow': return `--ds-shadow-${rest.join('-')}`;
    case 'tracking': return `--ds-tracking-${rest.join('-')}`;
    case 'zIndex': return `--ds-z-${rest.join('-')}`;
    case 'breakpoint': return `--ds-bp-${rest.join('-')}`;
    case 'font': {
      const [sub, ...r2] = rest;
      if (sub === 'family') return `--ds-font-family-${r2.join('-')}`;
      if (sub === 'weight') return `--ds-font-weight-${r2.join('-')}`;
      if (sub === 'size') return `--ds-font-size-${r2.join('-')}`;
      if (sub === 'lineHeight') return `--ds-line-height-${r2.join('-')}`;
      break;
    }
    case 'motion': {
      const [sub, ...r2] = rest;
      if (sub === 'duration') return `--ds-duration-${r2.join('-')}`;
      if (sub === 'easing') return `--ds-ease-${r2.join('-')}`;
      break;
    }
  }
  throw new Error(`No CSS var mapping for core token: ${parts.join('.')}`);
}

/**
 * Resolve a token value to a CSS value.
 * - `{a.b.c}` references → `var(--ds-…)`, except white/black which inline as literal hex
 *   (preserves the existing `--ds-bg: #ffffff` style).
 * - non-reference scalars → returned verbatim.
 */
function resolveCss(value) {
  if (typeof value !== 'string') return value;
  const m = value.match(/^\{([^}]+)\}$/);
  if (!m) return value;
  const parts = m[1].split('.');
  if (parts[0] === 'color' && (parts[1] === 'white' || parts[1] === 'black')) {
    return coreValue(parts); // inline literal
  }
  return `var(${coreVarName(parts)})`;
}

/** Resolve a value to a `var()`/literal string for the TS runtime map. */
const resolveTs = (value) => resolveCss(value);

// ---------------------------------------------------------------------------
// Emit: tokens.css
// ---------------------------------------------------------------------------
function emitPrimitiveBlock(label, group, mapName) {
  const lines = [`  /* ${label} */`];
  for (const [key, token] of Object.entries(group)) {
    if (!token || typeof token !== 'object' || !('value' in token)) continue;
    lines.push(`  ${mapName(key)}: ${token.value};`);
  }
  lines.push('');
  return lines;
}

function emitColorPrimitives() {
  const lines = ['  /* ===== Core Primitives ===== */', ''];
  for (const [ramp, scale] of Object.entries(core.color)) {
    if (ramp === 'white' || ramp === 'black') continue; // referenced inline as literals
    lines.push(`  /* Colors - ${ramp} */`);
    for (const [step, token] of Object.entries(scale)) {
      lines.push(`  --ds-color-${ramp}-${step}: ${token.value};`);
    }
    lines.push('');
  }
  return lines;
}

function emitSemanticBlock(theme) {
  const lines = [];
  for (const [group, fields] of Object.entries(semantic[theme])) {
    lines.push(`  /* ${group} */`);
    for (const [key, token] of Object.entries(fields)) {
      const name = key === 'default' ? `--ds-${kebab(group)}` : `--ds-${kebab(group)}-${kebab(key)}`;
      lines.push(`  ${name}: ${resolveCss(token.value)};`);
    }
    lines.push('');
  }
  return lines;
}

function emitTypographyClasses() {
  const cssProp = { fontFamily: 'font-family', fontSize: 'font-size', fontWeight: 'font-weight', lineHeight: 'line-height' };
  const lines = ['@layer components {', '  /* Composite typography — overridable by Tailwind utilities */'];
  for (const [name, token] of Object.entries(typography)) {
    const decls = Object.entries(token.value)
      .map(([prop, ref]) => `    ${cssProp[prop] ?? kebab(prop)}: ${resolveCss(ref)};`)
      .join('\n');
    lines.push(`  .ds-text-${name} {`, decls, '  }');
  }
  lines.push('}', '');
  return lines;
}

function buildCss() {
  const out = [];
  out.push('/**');
  out.push(' * Design System Tokens — CSS custom properties.');
  out.push(' *');
  out.push(' * AUTO-GENERATED by scripts/sync-design-system.mjs — DO NOT EDIT BY HAND.');
  out.push(' * Edit src/design-system/tokens/*.json, then run: npm run sync:design-system');
  out.push(' */');
  out.push('');
  out.push(':root {');
  out.push(...emitColorPrimitives());
  out.push(...emitPrimitiveBlock('Spacing', core.space, (k) => `--ds-space-${k}`));
  out.push('  /* Typography */');
  for (const [k, t] of Object.entries(core.font.family)) out.push(`  --ds-font-family-${k}: ${t.value};`);
  out.push('');
  for (const [k, t] of Object.entries(core.font.weight)) out.push(`  --ds-font-weight-${k}: ${t.value};`);
  out.push('');
  for (const [k, t] of Object.entries(core.font.size)) out.push(`  --ds-font-size-${k}: ${t.value};`);
  out.push('');
  for (const [k, t] of Object.entries(core.font.lineHeight)) out.push(`  --ds-line-height-${k}: ${t.value};`);
  out.push('');
  out.push(...emitPrimitiveBlock('Letter spacing', core.tracking, (k) => `--ds-tracking-${k}`));
  out.push(...emitPrimitiveBlock('Border Radius', core.radius, (k) => `--ds-radius-${k}`));
  out.push(...emitPrimitiveBlock('Shadows', core.shadow, (k) => `--ds-shadow-${k}`));
  out.push(...emitPrimitiveBlock('Z-index', core.zIndex, (k) => `--ds-z-${k}`));
  out.push('  /* Motion */');
  for (const [k, t] of Object.entries(core.motion.duration)) out.push(`  --ds-duration-${k}: ${t.value};`);
  for (const [k, t] of Object.entries(core.motion.easing)) out.push(`  --ds-ease-${k}: ${t.value};`);
  out.push('');
  out.push(...emitPrimitiveBlock('Breakpoints (informational; Tailwind owns the real ones)', core.breakpoint, (k) => `--ds-bp-${k}`));
  out.push('  /* ===== Semantic Tokens (Light Mode) ===== */');
  out.push('');
  out.push(...emitSemanticBlock('light'));
  out.push('}');
  out.push('');
  out.push('/* ===== Dark Mode Overrides ===== */');
  out.push('');
  out.push('.dark {');
  out.push(...emitSemanticBlock('dark'));
  out.push('}');
  out.push('');
  out.push(...emitTypographyClasses());
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Emit: tokens.ts
// ---------------------------------------------------------------------------
const isBareKey = (k) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) || /^[0-9]+$/.test(k);
const tsKey = (k) => (isBareKey(k) ? k : `'${k}'`);

function serialize(obj, indent = 1) {
  const pad = '  '.repeat(indent);
  const padEnd = '  '.repeat(indent - 1);
  if (typeof obj === 'string') return `'${obj}'`;
  const entries = Object.entries(obj).map(([k, v]) => `${pad}${tsKey(k)}: ${serialize(v, indent + 1)},`);
  return `{\n${entries.join('\n')}\n${padEnd}}`;
}

function buildColorMap() {
  const map = {};
  for (const [ramp, scale] of Object.entries(core.color)) {
    if (ramp === 'white' || ramp === 'black') {
      map[ramp] = scale.value; // literal hex
    } else {
      map[ramp] = Object.fromEntries(Object.keys(scale).map((step) => [step, `var(--ds-color-${ramp}-${step})`]));
    }
  }
  return map;
}

function buildSemanticMap() {
  const map = {};
  for (const [group, fields] of Object.entries(semantic.light)) {
    map[group] = Object.fromEntries(
      Object.keys(fields).map((key) => {
        const name = key === 'default' ? `--ds-${kebab(group)}` : `--ds-${kebab(group)}-${kebab(key)}`;
        return [key, `var(${name})`];
      }),
    );
  }
  return map;
}

const mapPrimitive = (group, varFn) => Object.fromEntries(Object.keys(group).map((k) => [k, `var(${varFn(k)})`]));

function buildTypographyMap() {
  return Object.fromEntries(
    Object.entries(typography).map(([name, token]) => [
      name,
      Object.fromEntries(Object.entries(token.value).map(([prop, ref]) => [prop, resolveTs(ref)])),
    ]),
  );
}

function buildTs() {
  const tokens = {
    color: buildColorMap(),
    semantic: buildSemanticMap(),
    space: mapPrimitive(core.space, (k) => `--ds-space-${k}`),
    font: {
      family: mapPrimitive(core.font.family, (k) => `--ds-font-family-${k}`),
      weight: mapPrimitive(core.font.weight, (k) => `--ds-font-weight-${k}`),
      size: mapPrimitive(core.font.size, (k) => `--ds-font-size-${k}`),
      lineHeight: mapPrimitive(core.font.lineHeight, (k) => `--ds-line-height-${k}`),
    },
    tracking: mapPrimitive(core.tracking, (k) => `--ds-tracking-${k}`),
    radius: mapPrimitive(core.radius, (k) => `--ds-radius-${k}`),
    shadow: mapPrimitive(core.shadow, (k) => `--ds-shadow-${k}`),
    zIndex: mapPrimitive(core.zIndex, (k) => `--ds-z-${k}`),
    motion: {
      duration: mapPrimitive(core.motion.duration, (k) => `--ds-duration-${k}`),
      easing: mapPrimitive(core.motion.easing, (k) => `--ds-ease-${k}`),
    },
    breakpoint: mapPrimitive(core.breakpoint, (k) => `--ds-bp-${k}`),
    typography: buildTypographyMap(),
  };

  return `/**
 * Design System Tokens — runtime object.
 *
 * AUTO-GENERATED by scripts/sync-design-system.mjs — DO NOT EDIT BY HAND.
 * Edit src/design-system/tokens/*.json, then run: npm run sync:design-system
 *
 * Maps every design-system CSS variable to a typed JS value. Import directly
 * (not via the barrel) when inside the design-system package to avoid circular refs.
 */

export const tokens = ${serialize(tokens)} as const;

// Type exports for autocomplete
export type ColorToken = keyof typeof tokens.color;
export type SemanticGroup = keyof typeof tokens.semantic;
export type SpaceToken = keyof typeof tokens.space;
export type FontSizeToken = keyof typeof tokens.font.size;
export type FontWeightToken = keyof typeof tokens.font.weight;
export type LineHeightToken = keyof typeof tokens.font.lineHeight;
export type TrackingToken = keyof typeof tokens.tracking;
export type RadiusToken = keyof typeof tokens.radius;
export type ShadowToken = keyof typeof tokens.shadow;
export type ZIndexToken = keyof typeof tokens.zIndex;
export type BreakpointToken = keyof typeof tokens.breakpoint;
export type TypographyToken = keyof typeof tokens.typography;

// Resolve a token by dot-path (e.g. "semantic.primary.default").
export function getToken(path: string): string {
  const parts = path.split('.');
  let value: unknown = tokens;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      console.warn(\`Token not found: \${path}\`);
      return '';
    }
  }
  return typeof value === 'string' ? value : '';
}

// Convert a camelCase style object to kebab-case CSS keys.
export function css(styles: Record<string, string | number>) {
  return Object.entries(styles).reduce(
    (acc, [key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (letter) => \`-\${letter.toLowerCase()}\`);
      return { ...acc, [cssKey]: value };
    },
    {} as Record<string, string | number>,
  );
}
`;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
const cssContent = buildCss();
const tsContent = buildTs();

if (CHECK) {
  let drift = false;
  for (const [file, next] of [[CSS_OUT, cssContent], [TS_OUT, tsContent]]) {
    let current = '';
    try { current = readFileSync(file, 'utf8'); } catch { /* missing */ }
    if (current !== next) {
      drift = true;
      console.error(`✗ Out of sync: ${file} — run \`npm run sync:design-system\``);
    }
  }
  if (drift) process.exit(1);
  console.log('✓ Design system tokens are in sync.');
} else {
  writeFileSync(CSS_OUT, cssContent);
  writeFileSync(TS_OUT, tsContent);
  console.log(`✓ Generated ${CSS_OUT}`);
  console.log(`✓ Generated ${TS_OUT}`);
}
