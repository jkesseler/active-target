import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { IconDashboard } from '@tabler/icons-react';
import { NavLinksGroup } from '../NavLinksGroup';

describe('NavLinksGroup', () => {
  it('renders without crashing with basic props', () => {
    const { asFragment } = renderWithProviders(
      <NavLinksGroup
        icon={IconDashboard}
        label="Test Label"
        link="/test"
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with links and initially opened', () => {
    const { asFragment } = renderWithProviders(
      <NavLinksGroup
        icon={IconDashboard}
        label="Test Group"
        initiallyOpened
        links={[
          { label: 'Sub Link 1', link: '/sub1' },
          { label: 'Sub Link 2', link: '/sub2' }
        ]}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});