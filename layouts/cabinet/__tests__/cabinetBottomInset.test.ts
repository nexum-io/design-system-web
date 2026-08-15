/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import tokensCss from '../../../styles/tokens.css?raw';
import themeCss from '../../../styles/theme.css?raw';

/**
 * Bottom-inset contract for app-level sticky bars (deal CTAs, create footers, dev FABs):
 * consumers reserve space above `CabinetTabBar` with `--ds-cabinet-bottom-inset`,
 * which must resolve to `0px` on the same breakpoint that hides the tab bar (`md`).
 * jsdom does not evaluate stylesheets, so the contract is guarded at the source
 * (tokens.css is generated from tokens/core.json; theme.css holds the responsive reset).
 */
const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');
const squash = (css: string): string => stripComments(css).replace(/\s+/g, ' ');

describe('cabinet bottom inset contract', () => {
  it('tokens.css defines the tab-bar height and the derived bottom inset', () => {
    const css = squash(tokensCss);
    expect(css).toContain('--ds-cabinet-tab-bar-height: 3.5rem;');
    expect(css).toContain(
      '--ds-cabinet-bottom-inset: calc(var(--ds-cabinet-tab-bar-height) + 1px + env(safe-area-inset-bottom, 0px));',
    );
  });

  it('theme.css resets the bottom inset to 0px on the md variant (tab bar hidden)', () => {
    const css = squash(themeCss);
    // `0px`, not unitless `0`: consumers compose `calc(var(--ds-cabinet-bottom-inset) + 1rem)`.
    expect(css).toMatch(/:root \{[^}]*@variant md \{ --ds-cabinet-bottom-inset: 0px; \}/);
  });
});
