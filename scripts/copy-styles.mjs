#!/usr/bin/env node
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist', 'styles');

mkdirSync(out, { recursive: true });
cpSync(join(root, 'styles'), out, { recursive: true });

console.log('Copied styles/ → dist/styles/');
