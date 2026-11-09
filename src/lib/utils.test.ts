import { cn } from './utils';

describe('cn', () => {
  it('merges conflicting Tailwind classes', () => {
    expect(cn('px-2', undefined, 'px-4')).toBe('px-4');
  });
});
