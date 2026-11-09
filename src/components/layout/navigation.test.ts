import { navigationForRole } from './navigation';

describe('navigationForRole', () => {
  it('does not expose admin management routes to teachers', () => {
    const hrefs = navigationForRole('TEACHER').map((item) => item.href);

    expect(hrefs).toEqual(['/dashboard', '/sections', '/attendance', '/settings']);
  });

  it('includes academic management routes for administrators', () => {
    expect(navigationForRole('ADMIN').map((item) => item.href)).toContain('/teachers');
  });
});
