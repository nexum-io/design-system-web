import QRCode from 'qrcode';

export interface QrSvgPath {
  /** Module grid side in modules, including the quiet zone. */
  size: number;
  /** SVG `d` covering every dark module; one `M…h1v1h-1z` box per module. */
  path: string;
}

/**
 * Encode `payload` into an SVG path over a module grid. Rendering stays in React
 * (see `QrCode`) so no markup from the encoder reaches `innerHTML`.
 */
export function buildQrSvgPath(payload: string, quietZone = 2): QrSvgPath {
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: 'M' });
  const side = modules.size;
  const boxes: string[] = [];

  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      if (modules.data[y * side + x]) {
        boxes.push(`M${x + quietZone} ${y + quietZone}h1v1h-1z`);
      }
    }
  }

  return { size: side + quietZone * 2, path: boxes.join('') };
}
