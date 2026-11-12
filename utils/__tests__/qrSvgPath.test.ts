import { describe, expect, it } from 'vitest';
import { buildQrSvgPath } from '../qrSvgPath';

const PAYLOAD = 'nexum-id://login?v=1&id=abc123&exp=1789000000&iss=https://sso.example';

describe('buildQrSvgPath', () => {
  it('encodes a payload into a module grid with a quiet zone', () => {
    const { size, path } = buildQrSvgPath(PAYLOAD);

    // Smallest QR version is 21 modules; the default quiet zone adds 2 per side.
    expect(size).toBeGreaterThanOrEqual(25);
    expect(path.startsWith('M')).toBe(true);
    expect(path).toContain('h1v1h-1z');
  });

  it('produces a different path for a different payload', () => {
    const first = buildQrSvgPath(PAYLOAD);
    const second = buildQrSvgPath(`${PAYLOAD}&other=1`);

    expect(second.path).not.toBe(first.path);
  });

  it('keeps every module inside the viewBox', () => {
    const { size, path } = buildQrSvgPath(PAYLOAD, 4);
    const coordinates = [...path.matchAll(/M(\d+) (\d+)/g)];

    expect(coordinates.length).toBeGreaterThan(0);
    for (const [, x, y] of coordinates) {
      expect(Number(x)).toBeGreaterThanOrEqual(4);
      expect(Number(y)).toBeGreaterThanOrEqual(4);
      expect(Number(x)).toBeLessThan(size - 4);
      expect(Number(y)).toBeLessThan(size - 4);
    }
  });

  it('is deterministic for the same payload', () => {
    const payload = 'nexum-id://login?i=abc';
    const first = buildQrSvgPath(payload);
    const second = buildQrSvgPath(payload);

    expect(second).toEqual(first);
    expect(first.path.startsWith('M')).toBe(true);
  });
});
