import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test-utils'
import { ToggleStageButton } from '../ToggleStageButton'

describe('ToggleStageButton', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(<ToggleStageButton />)

    expect(asFragment()).toMatchSnapshot()
  })
})
