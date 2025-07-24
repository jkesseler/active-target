export function useTranslation(nameSpace: string | string[]) {
  return {
    t: (key: string) => key,
    i18n: {
    }
  }
}