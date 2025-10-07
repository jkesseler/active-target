import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test-utils'
import { Stopwatch } from '../Stopwatch'

describe('Stopwatch', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(<Stopwatch />)

    expect(asFragment()).toMatchSnapshot()
  })
})
