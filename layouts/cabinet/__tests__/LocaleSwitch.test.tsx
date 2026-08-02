import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleSwitch } from '../LocaleSwitch';

describe('LocaleSwitch', () => {
  it('marks the active locale and notifies on change', async () => {
    const onLocaleChange = vi.fn();
    render(
      <LocaleSwitch
        locale="en"
        onLocaleChange={onLocaleChange}
        ariaLabel="Language"
      />,
    );
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'RU' }));
    expect(onLocaleChange).toHaveBeenCalledWith('ru');
  });
});
