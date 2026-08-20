import { createI18n } from 'vue-i18n'
import { messages, type SupportedLocale } from '@/i18n/messages'

const STORAGE_KEY = 'raul-santana-locale'

const getInitialLocale = (): SupportedLocale => {
  const storedLocale = window.localStorage.getItem(STORAGE_KEY)
  if (storedLocale === 'pt-BR' || storedLocale === 'en') return storedLocale

  return window.navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages
})

export const persistLocale = (locale: SupportedLocale) => {
  window.localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

persistLocale(i18n.global.locale.value as SupportedLocale)

