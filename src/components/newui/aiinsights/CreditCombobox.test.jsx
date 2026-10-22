import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreditCombobox from './CreditCombobox';

const NAMES = ['Allu Arjun', 'Fahadh Faasil', 'Rashmika Mandanna', 'Sunil'];

function Multi({ onChange = () => {} }) {
  const [value, setValue] = useState([]);
  return (
    <CreditCombobox
      multiple
      max={2}
      names={NAMES}
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

function Single() {
  const [value, setValue] = useState('');
  return (
    <>
      <CreditCombobox names={NAMES} value={value} onChange={setValue} />
      <span data-testid="value">{value}</span>
    </>
  );
}

describe('CreditCombobox', () => {
  it('multi: picks from the list, adds a typed new name, and stops at max', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Multi onChange={onChange} />);

    await user.type(screen.getByRole('combobox'), 'fah');
    await user.click(screen.getByRole('option', { name: 'Fahadh Faasil' }));
    await user.type(screen.getByRole('combobox'), 'Debut Star{Enter}');

    expect(onChange).toHaveBeenLastCalledWith(['Fahadh Faasil', 'Debut Star']);
    // At the cap the input disappears, so no fifth name can be added.
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('single: free text is the value, and a case-insensitive hit snaps to the canonical name', async () => {
    const user = userEvent.setup();
    render(<Single />);

    await user.type(screen.getByRole('combobox'), 'sunil');
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('value')).toHaveTextContent(/^Sunil$/);

    await user.clear(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'Brand New Lead');
    expect(screen.getByTestId('value')).toHaveTextContent('Brand New Lead');
    expect(screen.getByText(/New name/)).toBeInTheDocument();
  });
});
