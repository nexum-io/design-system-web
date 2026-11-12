import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Identicon } from '../Identicon';

describe('Identicon', () => {
  afterEach(() => {
    cleanup();
  });

  it('is hidden from assistive tech', () => {
    const { container } = render(<Identicon seed="0xabcdef123456" />);

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders the same background for the same seed and differs for another', () => {
    const bg = (seed: string) => {
      const { container, unmount } = render(<Identicon seed={seed} />);
      const value = (container.firstElementChild as HTMLElement).getAttribute('style');
      unmount();
      return value;
    };

    expect(bg('0xabcdef123456')).toBeTruthy();
    expect(bg('0xabcdef123456')).toBe(bg('0xabcdef123456'));
    expect(bg('0xabcdef123456')).not.toBe(bg('0xabcxef123456'));
  });

  it('merges className', () => {
    const { container } = render(<Identicon seed="x" className="size-8" />);

    expect(container.firstElementChild?.getAttribute('class')).toContain('size-8');
  });
});
