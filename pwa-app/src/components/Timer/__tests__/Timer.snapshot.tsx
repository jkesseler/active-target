import { describe, expect, it } from 'vitest';
import { render } from '@/test-utils';
import { Timer } from '../Timer';

describe('Timer', () => {
  it('renders without crashing', () => {
    const { asFragment } = render(<Timer />);

    expect(asFragment()).toMatchSnapshot();
  });
});