import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { HeaderSimple } from '../HeaderSimple';

describe('HeaderSimple', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(<HeaderSimple />);

    expect(asFragment()).toMatchSnapshot();
  });
});
