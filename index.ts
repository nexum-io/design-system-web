/**
 * Design System - Main Export
 * 
 * Token-based design system compatible with Tokens Studio for Figma.
 * All tokens are defined in /src/design-system/tokens/ and mapped to CSS variables.
 */

// Tokens (standalone module — no circular deps)
export { tokens, getToken, css } from './tokens';
export type {
  ColorToken,
  SemanticGroup,
  SpaceToken,
  FontSizeToken,
  FontWeightToken,
  LineHeightToken,
  TrackingToken,
  RadiusToken,
  ShadowToken,
  ZIndexToken,
  BreakpointToken,
  TypographyToken,
} from './tokens';

// Utilities
export { cx, cn } from './utils/cx';

// Primitives (shadcn/Radix, bridged to --ds-* tokens)
export * from './primitives';

// Components
export * from './components';

// Blocks
export * from './blocks';

// Layouts
export * from './layouts';
