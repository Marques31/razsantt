import { ref, onMounted } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'razsantt_resume_theme'
const theme = ref<Theme>('light')

export function useTheme() {
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // ignore storage errors
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  const initTheme = () => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme)
        return
      }
    } catch {
      // ignore storage errors
    }

    // Default to light theme matching Segerman white design
    setTheme('light')
  }

  onMounted(() => {
    initTheme()
  })

  return {
    theme,
    setTheme,
    toggleTheme,
    initTheme
  }
}
