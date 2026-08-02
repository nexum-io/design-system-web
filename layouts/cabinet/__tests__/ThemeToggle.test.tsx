import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle', () => {
  it('calls onThemeChange with the opposite theme', async () => {
    const onThemeChange = vi.fn();
    render(
      <ThemeToggle
        theme="light"
        onThemeChange={onThemeChange}
        labelToLight="Light"
        labelToDark="Dark"
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });
});
