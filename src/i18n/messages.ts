export const messages = {
  'pt-BR': {
    language: {
      current: 'Português',
      switchTo: 'Mudar para inglês'
    },
    nav: {
      info: 'Info',
      contact: 'Contato',
      allWork: 'Todos os projetos',
      selected: 'Selecionados',
      index: 'Índice'
    },
    home: {
      title: 'DIRETOR',
      archiveTitle: 'ARQUIVO',
      archiveSummary: '{count} projetos de direção, edição, fotografia e color grading.',
      contact: 'Contato',
      available: 'Disponível',
      instagram: 'Instagram',
      index: 'Índice',
      selectedProjects: 'Projetos selecionados',
      allProjects: 'Todos os projetos',
      projectsIndex: 'Índice de projetos'
    },
    project: {
      open: 'Abrir projeto {title}',
      image: 'Imagem do projeto',
      type: 'Tipo',
      work: 'Trabalho',
      video: 'Vídeo',
      openVideo: 'Reproduzir aqui',
      openVideoExternal: 'Abrir vídeo ↗',
      playVideo: 'Reproduzir vídeo de {title}',
      closeVideo: 'Fechar vídeo'
    },
    feedback: {
      emailCopied: 'E-mail copiado!'
    },
    transition: {
      selectedWork: 'Projetos selecionados'
    },
    info: {
      title: 'Informações & trajetória',
      close: 'Fechar informações',
      bio: 'Bio',
      directContact: 'Contato direto',
      copied: 'Copiado!',
      copy: 'Copiar',
      experience: 'Experiência',
      skills: 'Competências',
      education: 'Formação'
    },
    theme: {
      toLight: 'Mudar para tema claro',
      toDark: 'Mudar para tema escuro',
      light: 'Tema claro',
      dark: 'Tema escuro'
    }
  },
  en: {
    language: {
      current: 'English',
      switchTo: 'Switch to Brazilian Portuguese'
    },
    nav: {
      info: 'Info',
      contact: 'Contact',
      allWork: 'All Work',
      selected: 'Selected',
      index: 'Index'
    },
    home: {
      title: 'DIRECTOR',
      archiveTitle: 'ARCHIVE',
      archiveSummary: '{count} directing, editing, cinematography and color grading projects.',
      contact: 'Contact',
      available: 'Available',
      instagram: 'Instagram',
      index: 'Index',
      selectedProjects: 'Selected projects',
      allProjects: 'All projects',
      projectsIndex: 'Projects index'
    },
    project: {
      open: 'Open project {title}',
      image: 'Project image',
      type: 'Type',
      work: 'Work',
      video: 'Video',
      openVideo: 'Play here',
      openVideoExternal: 'Open video ↗',
      playVideo: 'Play video for {title}',
      closeVideo: 'Close video'
    },
    feedback: {
      emailCopied: 'Email copied!'
    },
    transition: {
      selectedWork: 'Selected Work'
    },
    info: {
      title: 'Info & Background',
      close: 'Close information',
      bio: 'Bio',
      directContact: 'Direct contact',
      copied: 'Copied!',
      copy: 'Copy',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education'
    },
    theme: {
      toLight: 'Switch to light theme',
      toDark: 'Switch to dark theme',
      light: 'Light theme',
      dark: 'Dark theme'
    }
  }
} as const

export type SupportedLocale = keyof typeof messages
