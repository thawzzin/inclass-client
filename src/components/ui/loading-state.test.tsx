import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingState } from './loading-state';

describe('LoadingState', () => {
  it('announces the pending content without showing a text placeholder', () => {
    render(<LoadingState label="Loading courses" />);

    expect(
      screen.getByRole('status', { name: 'Loading courses' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Loading courses')).not.toBeInTheDocument();
  });
});
