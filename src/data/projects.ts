import type { Project } from '@/types/resume'

type ProjectGroup = {
  category: string
  description: string
  technologies: string[]
}

type PortfolioProject = Project & {
  sourcePath: string
}

const imageModules = import.meta.glob('../../usaressas/**/*.{jpg,jpeg,png}', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>

const driveIdsBySourcePath: Record<string, string> = {
  'AftermovieReelsEdição/After Party - Poizon - V1.png': '1jI3exMSA50AVuU-wBV5Bs52JRTQwLNWa',
  'AftermovieReelsEdição/Baile da DZ7 - Video Final V3.png': '140kn_oe9yZdIJQ056vxxlI4hWmVsvmFX',
  'AftermovieReelsEdição/Dj Luan - Visualizer - youtube.png': '1TUOu7atM5mcvLhSFNuUJYskITZsqzrvI',
  'AftermovieReelsEdição/Estetica.png': '1w6fqAzloV0UuReBYHot4Zq0gHfmBiy-y',
  'AftermovieReelsEdição/MSN - Teaser - Final.png': '1A1gyZgriCRCrys1naq1JGSKKc6g9LfIZ',
  'AftermovieReelsEdição/Poizon - DRIFT - Soukai.png': '1avHu0JNHumjmutF9NjtnG9tvwtxoXUjI',
  'AftermovieReelsEdição/Promoçao - Luciana V1.png': '1WhmcLsQKHM_Z691k3axpy1owRT_GzigN',
  'AftermovieReelsEdição/Reels DZ7 + Netflix.png': '1mDceshyGV-6LwxUsLt1FueEPUolT5_7p',
  'AftermovieReelsEdição/Teaser - B&R.png': '12iyXTUbjZNzHlwG6Pv-7D_lI5H1KhH1N',
  'AftermovieReelsEdição/v4 diggo video 1.png': '1ZoUVDWdrgUdEBZHmF-nRlKJZx6p06ve1',
  'ClipesColorgrading/10_MatueFeatBrandao_Xtranho.png': '1crpEdiXdn8K1gGvvQmOehFlUpqRfDRpP',
  'ClipesColorgrading/AUTOBAHN FT. CASHLEY FINAL .mov.png': '1K_-gkzyxe2XSmTDd7PZV8exVm6R43Bhd',
  'ClipesColorgrading/Belli - Versos (COM COLOR).png': '1YNP_q-c-vRZxnWle_CLho2ftGgHPt3uA',
  'ClipesColorgrading/BRANDAO - JAQUETA BAPE - FINAL YOUTUBE.mov.png': '1Si_PjON7BFx83S55uinwwE5Bf04dfJ9o',
  'ClipesColorgrading/BRANDAO - OK - FINAL YOUTUBE.png': '1pFmMRyyw36xULx3fhT0Dtwy53ynFKYFg',
  'ClipesColorgrading/BRANDAO_FORMULAS E MILAGRE _FINAL YOUTUBE.png': '1XXXY1RhXqgRu2eJJP3BRvKPdaG3O3qGU',
  'ClipesColorgrading/DDOT_COLOR_END.png': '1tiiTmm2y2J-uFIPTCZy63ehdoX5wTy5z',
  'ClipesColorgrading/DESSIK SANTO MUSIC VIDEO FINAL.png': '1OjkF-dvKrQMA74WpFn1G4c3rmzYt4ALl',
  'ClipesColorgrading/ICONE FT KOUTH VFX V FINAL.png': '15WXLNBu7EK_Y5uQ9IErm79XSuudc2YTK',
  'ClipesColorgrading/nle_vfinal.png': '1J8mLjG1c9Qq_hxmmRcRnVi3iuqP1E6DT',
  'ClipesColorgrading/nosso-filme-final-title-v2.png': '1rzCJ_elz1OyQykdYa5FPXrOwiPsOjXKO',
  'ClipesColorgrading/ROCKSTAR .FEAT - DESIRE - FINAL YOUTUBE - 422.png': '1R4OVLD_4lDSUKDwR0GWkYZQwgrpyUEem',
  'ClipesColorgrading/TODAS_AS_LUZES_VFX_FINAL.png': '1KMgOa_wj-Th6TuvZ_4fAm1hOsCz1v6ll',
  'ClipesColorgrading/Yuri Redicopa & Akao - Colorgrading.png': '1g-o_aswDUrWWJyHXa7JBFKX05uGtwX4O',
  'DirigidoEdiçaoColorgradingFinalizaçao/Cicatrizes da noite - final.jpg': '19p380_ArgjJgF9HEVrrcFUWJ9V3ICTAK',
  'DirigidoEdiçaoColorgradingFinalizaçao/Clipe official - Novo Ano - clipe official.jpg': '1mLrwHZ4v5KF9XYK1ilWXtaSWRCukJsJE',
  'DirigidoEdiçaoColorgradingFinalizaçao/Dnovaes & Yuri Redicopa - Eu sei que não é verdade - Final.jpg': '19jgXkZ2jhspyZMtdv5DGMrsgIn4bvEV1',
  'DirigidoEdiçaoColorgradingFinalizaçao/Dpaula  & Lazza - Padrao maloqueiro - (Clipe Official).jpg': '173-iU_1Uaa0Z2G6vej2EwetjloXCmjmi',
  'DirigidoEdiçaoColorgradingFinalizaçao/Dpaula - Atualmente (CLIPE OFFICIAL).jpg': '1tgHjC3p5g1lrFQIvKUN4OB1AutRN91Ef',
  'DirigidoEdiçaoColorgradingFinalizaçao/GEME BAIXO NO OUVIDO - MC SASA SP, MC GUEL ZN (DJ LUAN PJ)  V3.jpg': '1kzF9s7C5Eu29PPGAYY9smHtlT03xW2cm',
  'DirigidoEdiçaoColorgradingFinalizaçao/iLuvPed & Dnovaees - Nata - Final.jpg': '1aLvAQEuuBNA6VdfSrys7xdJfNnXU7aJZ',
  "DirigidoEdiçaoColorgradingFinalizaçao/M'Dep - Haters ( OFFICIAL VIDEO).jpg": '14bSHIFYJHsqJm37UDQKa9d2Jjpk_a88N',
  "DirigidoEdiçaoColorgradingFinalizaçao/M'DEP - Haters (Clipe Official).jpg": '1kmbiobiZ3cazWnP9wZYoXf_tRu6rmEPf',
  "DirigidoEdiçaoColorgradingFinalizaçao/M'DEP - Pirataria ( OFICIAL CLIPE).jpg": '18YA1Mjh69Su7bL7Q8i_TmYoqTbmgxKCN',
  'DirigidoEdiçaoColorgradingFinalizaçao/MC Paiva e MC Meno K - To passando boladao - Final - Youtube.jpg': '1WBnzvBG-Uf1ezqxn_h_4vcIoIQfG8tTo',
  'DirigidoEdiçaoColorgradingFinalizaçao/MDEP.jpg': '1PoJ59w_BowJ0KIbBDD7KHa1KeF49tgde',
  'DirigidoEdiçaoColorgradingFinalizaçao/Niink & Lazza - Liberdade ou Solidao - Final V2.jpg': '13n5spZSR0JAFx4Hay1otkPTJ3tJoIxHv',
  'DirigidoEdiçaoColorgradingFinalizaçao/Polar alone - Spii.jpg': '1b1nET_c1MAu4mTp6tFh7EkklRXtkgoJp',
  'DirigidoEdiçaoColorgradingFinalizaçao/Ramos - Inconsequente VFX Final.jpg': '19Tde4ryLP1PdY7UR0PBsLMRePoVmDYG4',
  'DirigidoEdiçaoColorgradingFinalizaçao/Ramos - Inconsequente.jpg': '1qhwxzfT1-TQw9egILluGCrNddEeUCnWj',
  'DirigidoEdiçaoColorgradingFinalizaçao/Sicko - Mizuno (Clipe Official).jpg': '1HHTF3IXIV51LoTbVsXt7Z0GV6DgQBQvg',
  'DirigidoEdiçaoColorgradingFinalizaçao/SOM DE RUA FINAL.jpg': '18xucYIRKdUXJmti5LjcxJ_9gR-aEROKf',
  'DirigidoEdiçaoColorgradingFinalizaçao/Spii - Nao chore - Clipe Official.jpg': '1qzgKSDom8iCAxE7FMpFI3QD2GyJy1ZRm',
  'DirigidoEdiçaoColorgradingFinalizaçao/Vyne - Decisoes - Clipe Official - V8.jpg': '15cwK5K32AL7BJBe9jlxseC_KrBBMVNIa',
  'Edição/Ze Felipe - Oruam - Mc Tuto (final2).png': '1esfRkcOE9vSi_5jkyzX3EAHfp-EyTSmB',
  'OP CamComerciaisColorgrading/AKA RASTA - AFTER MOVIE.png': '1aqiZGf_dLY-Kcdf4ZGGt2nTfmBHpCJD0',
  'OP CamComerciaisColorgrading/CONTENT_KENNER_FINAL FOR YOUTUBE.png': '1vj-BuDfjmaC05c92IkNVyAjx0e4lBnhL',
  'OP CamComerciaisColorgrading/CONTENT_KENNER_FOR_INSTAGRAM.png': '1-fX0NW8ZylMsjmhoFog8i3KAMGjAs8Ba',
  'OP CamComerciaisColorgrading/NEW BALANCE 1000.png': '1u5bhrBr6CV4cYroWm74-IPbJ1gp8osGe',
  'OP CamComerciaisColorgrading/SPOTIFY FINAL.png': '1X6-xvWX6qwTbfvOrsLJWGiQI5vgcLoOc',
  'OP CamComerciaisColorgrading/VANS.png': '1JlpV97RfuBEXFReTpWaJhTA8Aoxw0lnE',
  'OP CamComerciaisColorgrading/VERSÃO 2 COM VFX & SFX..png': '1x-L-MTq3gKxjNFRyoLMPIiW0nAUUGV8U',
  'OP CamComerciaisColorgrading/Video Horizontal Bonus.png': '1Ri-CJR2isWVZwFVJUeCxmMkky5wxUAkN',
  'OP CamDireçao de fotografia/Angel7rio - Baile.png': '16hevbo2pSrXB1IHYLqtGy5WJewrJtubd',
  'OP CamDireçao de fotografia/SEQUÊNCIA DE BOTAÇÃO.png': '17yqOx5yC9z6Q7EZHIomEvSbbFds5Hpla'
}

const groupDetails: Record<string, ProjectGroup> = {
  AftermovieReelsEdição: {
    category: 'Aftermovie / Reels',
    description: 'Projeto de edição para aftermovie, teaser ou conteúdo vertical.',
    technologies: ['Edição', 'Aftermovie', 'Reels']
  },
  ClipesColorgrading: {
    category: 'Videoclipe / Color Grading',
    description: 'Projeto de color grading para videoclipe.',
    technologies: ['Color Grading', 'Videoclipe']
  },
  DirigidoEdiçaoColorgradingFinalizaçao: {
    category: 'Direção / Pós-produção',
    description: 'Videoclipe com direção, edição, color grading e finalização.',
    technologies: ['Direção', 'Edição', 'Color Grading', 'Finalização']
  },
  Edição: {
    category: 'Edição',
    description: 'Projeto de edição para videoclipe.',
    technologies: ['Edição', 'Videoclipe']
  },
  'OP CamComerciaisColorgrading': {
    category: 'Comercial / Color Grading',
    description: 'Projeto comercial com operação de câmera e color grading.',
    technologies: ['Operação de Câmera', 'Color Grading', 'Comercial']
  },
  'OP CamDireçao de fotografia': {
    category: 'Direção de Fotografia',
    description: 'Projeto com operação de câmera e direção de fotografia.',
    technologies: ['Operação de Câmera', 'Direção de Fotografia']
  }
}

const normalizePath = (path: string) => path.replace(/\\/g, '/')

const cleanTitle = (filename: string) => filename
  .replace(/\.(png|jpe?g)$/i, '')
  .replace(/\.mov$/i, '')
  .replace(/_/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/\s*\((?:clipe|official)[^)]*\)\s*$/i, '')
  .replace(/\s+-?\s*(?:final(?:\s+youtube)?|youtube|vfx\s*final|v\d+)\s*$/i, '')
  .trim()

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

const allProjects: PortfolioProject[] = Object.entries(imageModules)
  .map(([assetPath, image], index) => {
    const normalized = normalizePath(assetPath)
    const sourcePath = normalized.split('/usaressas/')[1]
    const pathParts = sourcePath.split('/')
    const folder = pathParts[0]
    const filename = pathParts.at(-1) || `Projeto ${index + 1}`
    const details = groupDetails[folder] || {
      category: 'Audiovisual',
      description: 'Projeto audiovisual.',
      technologies: ['Audiovisual']
    }
    const driveId = driveIdsBySourcePath[sourcePath]

    const id = `${slugify(sourcePath)}-${index + 1}`
    const driveThumbnail = driveId
      ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1600`
      : undefined

    return {
      id,
      title: cleanTitle(filename),
      description: details.description,
      technologies: details.technologies,
      category: details.category,
      image,
      driveId,
      driveThumbnail,
      // The Drive preview is used for playback. Its public thumbnail endpoint
      // can return a black quota placeholder, so the existing project still
      // remains the safe display source without adding any local downloads.
      gallery: [image, image, image],
      demoUrl: driveId ? `https://drive.google.com/file/d/${driveId}/view` : undefined,
      sourcePath
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))

const featuredDetails: Record<string, Partial<Project>> = {
  'ClipesColorgrading/10_MatueFeatBrandao_Xtranho.png': {
    id: 'xtranho',
    title: 'Matuê feat. Brandão — Xtranho',
    description: 'Color grading do videoclipe de Matuê com participação de Brandão.',
    technologies: ['Color Grading', 'Videoclipe'],
    category: 'Videoclipe / Color Grading',
    demoUrl: 'https://drive.google.com/file/d/1crpEdiXdn8K1gGvvQmOehFlUpqRfDRpP/view',
    driveId: '1crpEdiXdn8K1gGvvQmOehFlUpqRfDRpP',
    featured: true
  },
  'ClipesColorgrading/BRANDAO - JAQUETA BAPE - FINAL YOUTUBE.mov.png': {
    id: 'brandao-jaqueta-bape',
    title: 'Brandão — Jaqueta Bape',
    description: 'Color grading do videoclipe “Jaqueta Bape”, de Brandão.',
    technologies: ['Color Grading', 'Videoclipe'],
    category: 'Videoclipe / Color Grading',
    featured: true
  },
  'ClipesColorgrading/BRANDAO_FORMULAS E MILAGRE _FINAL YOUTUBE.png': {
    id: 'brandao-formulas-e-milagre',
    title: 'Brandão — Fórmulas e Milagre',
    description: 'Color grading do videoclipe “Fórmulas e Milagre”, de Brandão.',
    technologies: ['Color Grading', 'Videoclipe'],
    category: 'Videoclipe / Color Grading',
    featured: true
  },
  'OP CamComerciaisColorgrading/VANS.png': {
    id: 'vans',
    title: 'Vans',
    description: 'Projeto comercial com operação de câmera e color grading.',
    technologies: ['Operação de Câmera', 'Color Grading', 'Comercial'],
    category: 'Comercial / Color Grading',
    featured: true
  },
  'Edição/Ze Felipe - Oruam - Mc Tuto (final2).png': {
    id: 'ze-felipe-oruam-mc-tuto',
    title: 'Zé Felipe, Oruam & MC Tuto',
    description: 'Projeto de edição para videoclipe.',
    technologies: ['Edição', 'Videoclipe'],
    category: 'Edição',
    featured: true
  }
}

const featuredPaths = Object.keys(featuredDetails)

export const featuredProjects: Project[] = featuredPaths.map((sourcePath) => {
  const project = allProjects.find((item) => item.sourcePath === sourcePath)

  if (!project) {
    throw new Error(`Imagem não encontrada em usaressas: ${sourcePath}`)
  }

  const { sourcePath: _sourcePath, ...baseProject } = project
  return { ...baseProject, ...featuredDetails[sourcePath] }
})

export const archiveProjects: Project[] = allProjects
  .filter((project) => !featuredPaths.includes(project.sourcePath))
  .map(({ sourcePath: _sourcePath, ...project }) => project)

export const allPortfolioProjects: Project[] = [
  ...featuredProjects,
  ...archiveProjects
]
