import { corporate } from './corporate'
import { dracula } from './dracula'
import { synthwave } from './synthwave'
import { ThemeName } from './types'

export const themes = {
  corporate,
  dracula,
  synthwave,
}

export const sortedThemeNames = Object.keys(themes)
  .map(key => key as ThemeName)
  .sort()
