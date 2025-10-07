import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test-utils'
import { Timer } from '../Timer'

describe('Timer', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(<Timer />)

    expect(asFragment()).toMatchSnapshot()
  })
})
