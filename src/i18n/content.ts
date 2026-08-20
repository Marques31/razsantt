import type { Project, ResumeData } from '@/types/resume'
import type { SupportedLocale } from '@/i18n/messages'

const englishProjectTerms: Record<string, string> = {
  'Aftermovie / Reels': 'Aftermovie / Reels',
  'Videoclipe / Color Grading': 'Music Video / Color Grading',
  'Direção / Pós-produção': 'Direction / Post-production',
  'Edição': 'Editing',
  'Comercial / Color Grading': 'Commercial / Color Grading',
  'Direção de Fotografia': 'Cinematography',
  'Audiovisual': 'Audiovisual',
  'Direção': 'Direction',
  'Finalização': 'Finishing',
  'Videoclipe': 'Music Video',
  'Comercial': 'Commercial',
  'Operação de Câmera': 'Camera Operation',
  'Aftermovie': 'Aftermovie',
  'Reels': 'Reels',
  'Color Grading': 'Color Grading'
}

const englishProjectDescriptions: Record<string, string> = {
  'Projeto de edição para aftermovie, teaser ou conteúdo vertical.': 'Editing project for an aftermovie, teaser or vertical content.',
  'Projeto de color grading para videoclipe.': 'Color grading project for a music video.',
  'Videoclipe com direção, edição, color grading e finalização.': 'Music video direction, editing, color grading and finishing.',
  'Projeto de edição para videoclipe.': 'Music video editing project.',
  'Projeto comercial com operação de câmera e color grading.': 'Commercial project with camera operation and color grading.',
  'Projeto com operação de câmera e direção de fotografia.': 'Camera operation and cinematography project.',
  'Projeto audiovisual.': 'Audiovisual project.',
  'Color grading do videoclipe de Matuê com participação de Brandão.': 'Color grading for Matuê’s music video featuring Brandão.',
  'Color grading do videoclipe “Jaqueta Bape”, de Brandão.': 'Color grading for Brandão’s “Jaqueta Bape” music video.',
  'Color grading do videoclipe “Fórmulas e Milagre”, de Brandão.': 'Color grading for Brandão’s “Fórmulas e Milagre” music video.'
}

export const localizeProject = (project: Project, locale: SupportedLocale): Project => {
  if (locale === 'pt-BR') return { ...project }

  return {
    ...project,
    category: project.category ? englishProjectTerms[project.category] || project.category : undefined,
    description: englishProjectDescriptions[project.description] || project.description,
    technologies: project.technologies.map((technology) => englishProjectTerms[technology] || technology)
  }
}

export const localizeProjects = (projects: Project[], locale: SupportedLocale) => (
  projects.map((project) => localizeProject(project, locale))
)

export const localizeResume = (base: ResumeData, locale: SupportedLocale): ResumeData => {
  if (locale === 'pt-BR') {
    return {
      ...base,
      profile: {
        ...base.profile,
        role: 'Diretor & Editor de Filmes',
        headline: 'Direção e edição de histórias visuais de alto impacto, comerciais, videoclipes e filmes cinematográficos com montagem rítmica e color grading.',
        availability: {
          ...base.profile.availability,
          text: 'Disponível para direção de cena e edição'
        }
      },
      projects: localizeProjects(base.projects, locale)
    }
  }

  return {
    ...base,
    profile: {
      ...base.profile,
      role: 'Director & Film Editor',
      headline: 'Directing and editing high-impact visual stories, commercials, music videos and cinematic films with rhythmic editing and color grading.',
      bio: [
        'Raul Santana is a director and film editor specializing in commercials, music videos, documentaries and fashion productions with a strong visual identity.',
        'His work covers the complete production workflow: creative development, shot planning, on-set direction with cinema cameras (ARRI / RED), and advanced post-production in DaVinci Resolve Studio (ACES Workflow) and Premiere Pro.'
      ],
      location: 'São Paulo, Brazil (Available Worldwide)',
      availability: {
        ...base.profile.availability,
        text: 'Available for directing and editing',
        date: 'October 2026'
      },
      stats: [
        { label: 'Years of Experience', value: '8+' },
        { label: 'Directed Projects', value: '50+' },
        { label: 'Awards & Festivals', value: '14+' }
      ]
    },
    experiences: [
      {
        ...base.experiences[0],
        role: 'Director & Creative Director',
        location: 'São Paulo & Remote',
        period: { ...base.experiences[0].period, end: 'Present' },
        description: 'Directing and editing for national and international campaigns, with an emphasis on cinematic visuals, dynamic rhythm and performance direction.',
        achievements: [
          'Directed commercial campaigns distributed on TV and streaming platforms, reaching more than 30 million views.',
          'Implemented an agile post-production and cinematic color grading pipeline with 35mm film emulation.'
        ],
        technologies: ['Directing', 'DaVinci Resolve Studio', 'Premiere Pro', 'ACES Workflow', 'ARRI RAW']
      },
      {
        ...base.experiences[1],
        role: 'Senior Film Editor & Colorist',
        location: 'São Paulo, Brazil',
        description: 'Supervised editing, narrative rhythm, sound design and color grading for documentaries and independent music videos.',
        achievements: [
          'Edited and finished an award-winning documentary screened at international festivals.',
          'Optimized the rendering and media archive workflow for 4K/8K productions.'
        ]
      }
    ],
    skillCategories: [
      {
        ...base.skillCategories[0],
        name: 'Direction & Concept',
        description: 'Cinematic language, shot planning and film sets.',
        skills: [
          { name: 'Directing', level: 'Especialista' },
          { name: 'Cinematography (DoP)', level: 'Avançado' },
          { name: 'Screenwriting & Storyboarding', level: 'Especialista' },
          { name: 'Performance Direction', level: 'Avançado' }
        ]
      },
      {
        ...base.skillCategories[1],
        name: 'Editing & Finishing',
        description: 'Non-linear post-production and color correction.',
        skills: [
          { name: 'DaVinci Resolve Studio', level: 'Especialista' },
          { name: 'Adobe Premiere Pro', level: 'Especialista' },
          { name: 'Color Grading (ACES)', level: 'Especialista' },
          { name: 'After Effects & Motion', level: 'Avançado' },
          { name: 'Sound Design & Mixing', level: 'Avançado' }
        ]
      }
    ],
    education: base.education.map((education) => ({
      ...education,
      degree: 'Bachelor’s Degree in Film and Audiovisual Media',
      location: 'São Paulo, Brazil',
      description: 'Film direction, editing and post-production.'
    })),
    projects: localizeProjects(base.projects, locale)
  }
}

