import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { Navbar } from '../NavBar';

describe('Navbar', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(<Navbar />);

    expect(asFragment()).toMatchSnapshot();
  });
});