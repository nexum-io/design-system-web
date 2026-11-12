import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QrCode } from '../QrCode';

describe('QrCode', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an accessible image with a white pad and currentColor modules', () => {
    render(<QrCode payload="nexum-id://login?v=1&id=invite-1" label="Nexum ID sign-in code" />);

    const svg = screen.getByRole('img', { name: 'Nexum ID sign-in code' });

    expect(svg.getAttribute('aria-label')).toBe('Nexum ID sign-in code');
    expect(svg.querySelector('rect')?.getAttribute('fill')).toBe('white');
    expect(svg.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
  });

  it('keeps modules near-black so a white pad stays scannable in a dark sheet', () => {
    render(<QrCode payload="nexum-id://login?v=1&id=invite-1" label="code" />);

    const className = screen.getByRole('img', { name: 'code' }).getAttribute('class') ?? '';

    expect(className).toContain('text-black');
    expect(className).not.toContain('text-foreground');
  });

  it('keeps text-black when a sizing className is passed', () => {
    render(<QrCode payload="nexum-id://login?i=abc" label="code" className="size-40" />);

    const className = screen.getByRole('img', { name: 'code' }).getAttribute('class') ?? '';

    expect(className).toContain('text-black');
    expect(className).toContain('size-40');
    expect(className).not.toContain('size-44');
  });
});
