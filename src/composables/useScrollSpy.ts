import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollSpy(sectionIds: string[]) {
  const activeSection = ref<string>(sectionIds[0] || '')
  let observer: IntersectionObserver | null = null

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const headerOffset = 70
      const elementPosition = el.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      activeSection.value = id
    }
  }

  onMounted(() => {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -50% 0px',
      threshold: 0
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    }, options)

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observer?.observe(element)
      }
    })
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    activeSection,
    scrollTo
  }
}
