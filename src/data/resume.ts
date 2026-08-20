import type { ResumeData } from '@/types/resume'
import { featuredProjects } from '@/data/projects'

export const resumeData: ResumeData = {
  profile: {
    name: 'Raul Santana',
    role: 'Director & Film Editor',
    headline: 'Directing and editing high-impact visual stories, commercials, music videos and cinematic films with rhythmic editing and color grading.',
    bio: [
      'Raul Santana é diretor de cena e editor audiovisual especializado em filmes comerciais, videoclipes, documentários e produções de moda de alto impacto estético.',
      'Domínio completo de todo o fluxo de produção: concepção criativa, decupagem, direção de set com câmeras de cinema (ARRI / RED) e pós-produção avançada em DaVinci Resolve Studio (ACES Workflow) e Premiere Pro.'
    ],
    location: 'São Paulo, Brasil (Disponível Globalmente)',
    email: 'Raul.santdiretor@gmail.com',
    phone: '+55 11 96398-7741',
    website: 'https://vimeo.com/raulsantana',
    availability: {
      status: 'available',
      text: 'Disponível para Direção de Cena & Edição',
      date: 'Outubro 2026'
    },
    socials: [
      {
        platform: 'website',
        label: 'Vimeo',
        url: 'https://vimeo.com',
        username: '@raulsantana'
      },
      {
        platform: 'linkedin',
        label: 'LinkedIn',
        url: 'https://linkedin.com',
        username: 'in/raulsantana'
      },
      {
        platform: 'email',
        label: 'E-mail',
        url: 'mailto:Raul.santdiretor@gmail.com',
        username: 'Raul.santdiretor@gmail.com'
      }
    ],
    stats: [
      { label: 'Anos de Experiência', value: '8+' },
      { label: 'Projetos Dirigidos', value: '50+' },
      { label: 'Prêmios & Festivais', value: '14+' }
    ]
  },

  experiences: [
    {
      id: 'exp-1',
      role: 'Diretor de Cena & Diretor Criativo',
      company: 'Estrela Studio Filmes',
      companyUrl: 'https://estrelastudio.com',
      location: 'São Paulo & Remoto',
      period: {
        start: '2022',
        end: 'Presente'
      },
      isCurrent: true,
      description: 'Direção de cena e montagem para campanhas publicitárias nacionais e internacionais, com ênfase em estética cinematográfica, ritmo dinâmico e direção de atores.',
      achievements: [
        'Direção de campanhas comerciais veiculadas em TV e streaming com mais de 30 milhões de views.',
        'Implementação de pipeline ágil de pós-produção e color grading cinematográfico com emulação de película 35mm.'
      ],
      technologies: ['Direção de Cena', 'DaVinci Resolve Studio', 'Premiere Pro', 'ACES Workflow', 'ARRI RAW']
    },
    {
      id: 'exp-2',
      role: 'Editor de Vídeo Sênior & Colorista',
      company: 'Zulik Media Lab',
      companyUrl: 'https://zulik.co',
      location: 'São Paulo, SP',
      period: {
        start: '2019',
        end: '2022'
      },
      isCurrent: false,
      description: 'Supervisão de montagem, ritmo narrativo, sound design e color grading para documentários e videoclipes autorais.',
      achievements: [
        'Montagem e finalização de documentário premiado em festivais internacionais.',
        'Otimização do workflow de renderização e arquivamento de mídia 4K/8K.'
      ],
      technologies: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Pro Tools', 'Sound Design']
    }
  ],

  projects: featuredProjects,

  skillCategories: [
    {
      id: 'cat-direction',
      name: 'Direção & Conceito',
      description: 'Linguagem cinematográfica, decupagem e set de filmagem.',
      skills: [
        { name: 'Direção de Cena', level: 'Especialista' },
        { name: 'Direção de Fotografia (DoP)', level: 'Avançado' },
        { name: 'Roteiro & Storyboard', level: 'Especialista' },
        { name: 'Direção de Atores', level: 'Avançado' }
      ]
    },
    {
      id: 'cat-post',
      name: 'Edição & Finalização',
      description: 'Pós-produção não linear e correção de cor.',
      skills: [
        { name: 'DaVinci Resolve Studio', level: 'Especialista' },
        { name: 'Adobe Premiere Pro', level: 'Especialista' },
        { name: 'Color Grading (ACES)', level: 'Especialista' },
        { name: 'After Effects & Motion', level: 'Avançado' },
        { name: 'Sound Design & Mixagem', level: 'Avançado' }
      ]
    }
  ],

  education: [
    {
      id: 'edu-1',
      degree: 'Bacharelado em Cinema e Audiovisual',
      institution: 'Universidade de São Paulo (USP / ECA)',
      institutionUrl: 'https://usp.br',
      location: 'São Paulo, Brasil',
      period: {
        start: '2014',
        end: '2018'
      },
      description: 'Formação focada em direção cinematográfica, montagem e pós-produção.'
    }
  ],

  certifications: [
    {
      id: 'cert-1',
      title: 'DaVinci Resolve Certified Colorist',
      issuer: 'Blackmagic Design',
      issueDate: '2022',
      credentialUrl: 'https://blackmagicdesign.com'
    }
  ]
}
