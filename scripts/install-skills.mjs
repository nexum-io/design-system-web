#!/usr/bin/env node
/**
 * Install the shared design-system skills into a target project, in both the
 * Cursor (.cursor/skills) and Claude Code (.claude/skills) locations.
 *
 * Usage: node scripts/install-skills.mjs --to <app-root> [--from <canonical-root>] [--dry-run]
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (n) => {
  const i = argv.indexOf(n);
  return i >= 0 ? argv[i + 1] : undefined;
};
const DRY = argv.includes('--dry-run');
const FROM = resolve(opt('--from') ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
const TO = opt('--to') ? resolve(opt('--to')) : undefined;
if (!TO) {
  console.error('ERROR: --to <app-root> is required.');
  process.exit(2);
}

const SKILLS_DIR = join(FROM, 'skills');
const skills = readdirSync(SKILLS_DIR).filter(
  (n) => statSync(join(SKILLS_DIR, n)).isDirectory() && existsSync(join(SKILLS_DIR, n, 'SKILL.md')),
);
const targets = ['.cursor/skills', '.claude/skills'];

for (const skill of skills) {
  for (const t of targets) {
    const dest = join(TO, t, skill);
    console.log(`${DRY ? '[dry] ' : ''}${skill} → ${t}/${skill}`);
    if (!DRY) {
      mkdirSync(dirname(dest), { recursive: true });
      cpSync(join(SKILLS_DIR, skill), dest, { recursive: true });
    }
  }
}
console.log(DRY ? '\n(dry run — nothing written)' : `\n✓ Installed ${skills.length} skill(s) into ${TO} (.cursor + .claude)`);
