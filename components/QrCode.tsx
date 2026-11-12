import { useMemo } from 'react';
import { buildQrSvgPath } from '../utils/qrSvgPath';
import { cx } from '../utils/cx';

/**
 * Renders `payload` as a scannable QR. Modules use `currentColor` on a white
 * pad — keep that color near-black. `text-foreground` follows the dark Sign
 * sheet and paints modules almost white, so the code disappears.
 */
export function QrCode({
  payload,
  label,
  className,
}: {
  payload: string;
  label: string;
  className?: string;
}) {
  const { size, path } = useMemo(() => buildQrSvgPath(payload), [payload]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cx('size-44 text-black', className)}
    >
      <rect width={size} height={size} fill="white" />
      <path d={path} fill="currentColor" />
    </svg>
  );
}
