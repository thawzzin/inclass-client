import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroupItem', () => {
  it('renders the text passed to an attendance status choice', () => {
    render(
      <RadioGroup value="PRESENT">
        <RadioGroupItem value="PRESENT" className="ic-attendance-choice">
          Present
        </RadioGroupItem>
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', { name: 'Present' })).toHaveTextContent(
      'Present',
    );
  });
});
