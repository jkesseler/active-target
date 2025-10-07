import { useLocalStorage } from '@mantine/hooks'
import { themes } from '@/themes'
import type { ThemeName } from '@/themes/types'

export function useThemes() {
  const [theme, setTheme] = useLocalStorage<ThemeName>({
    key: 'theme',
    defaultValue: 'dracula',
    serialize: value => value,
    deserialize: (value) => {
      if (value !== undefined && Object.keys(themes).includes(value)) {
        return value as ThemeName
      }
      return 'dracula'
    },
  })

  return { themes, currentThemeName: theme, setCurrentThemeName: setTheme }
}
