/**
 * Identicon — детерминированный цветовой «отпечаток» адреса/строки.
 * Помогает визуально сверять адреса (одинаковый ввод → одинаковый круг).
 */
import { cx } from '../utils/cx';

export function Identicon({ seed, className }: { seed: string; className?: string }) {
  const angle = seed.length > 5 ? (seed.charCodeAt(5) * 7) % 360 : 0;
  return (
    <span
      aria-hidden
      className={cx('inline-block size-4 shrink-0 rounded-full', className)}
      style={{
        background: `conic-gradient(from ${angle}deg, var(--ds-color-purple-500), var(--ds-color-purple-700), var(--ds-info), var(--ds-color-purple-500))`,
      }}
    />
  );
}
