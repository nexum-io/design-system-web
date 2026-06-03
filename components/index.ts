/**
 * Design System Components
 *
 * Production components used throughout the application. Low-level shadcn/Radix
 * primitives (Button, Input, Dialog, …) live in `../primitives` and are exposed
 * via the design-system barrel.
 */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from './Card';
export type { CardProps } from './Card';

export { IconBox } from './IconBox';
export type { IconBoxProps, IconBoxVariant, IconBoxSize } from './IconBox';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusVariant, StatusBadgeVariant } from './StatusBadge';

export { KpiCard } from './KpiCard';
export type { KpiCardProps, DeltaTone } from './KpiCard';

export { CopyChip } from './CopyChip';
export type { CopyChipProps } from './CopyChip';
