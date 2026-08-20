export interface SocialLink {
  platform: 'github' | 'linkedin' | 'email' | 'twitter' | 'website' | 'other'
  label: string
  url: string
  username?: string
}

export interface StatItem {
  label: string
  value: string
  description?: string
}

export interface Profile {
  name: string
  role: string
  headline: string
  bio: string[]
  location: string
  email: string
  phone?: string
  website?: string
  availability: {
    status: 'available' | 'employed' | 'open_to_offers'
    text: string
    date?: string
  }
  socials: SocialLink[]
  stats?: StatItem[]
}

export interface Experience {
  id: string
  role: string
  company: string
  companyUrl?: string
  location: string
  period: {
    start: string
    end: string | 'Presente'
  }
  isCurrent?: boolean
  description: string
  achievements: string[]
  technologies: string[]
}

export interface Project {
  id: string
  title: string
  description: string
  highlights?: string[]
  technologies: string[]
  demoUrl?: string
  repoUrl?: string
  featured?: boolean
  category?: string
  image?: string
  driveId?: string
  driveThumbnail?: string
  gallery?: string[]
  videoUrl?: string
  videoPreview?: string
}

export interface SkillItem {
  name: string
  level?: 'Básico' | 'Intermediário' | 'Avançado' | 'Especialista'
}

export interface SkillCategory {
  id: string
  name: string
  description?: string
  skills: SkillItem[]
}

export interface Education {
  id: string
  degree: string
  institution: string
  institutionUrl?: string
  location: string
  period: {
    start: string
    end: string
  }
  description?: string
}

export interface Certification {
  id: string
  title: string
  issuer: string
  issueDate: string
  credentialUrl?: string
}

export interface ResumeData {
  profile: Profile
  experiences: Experience[]
  projects: Project[]
  skillCategories: SkillCategory[]
  education: Education[]
  certifications?: Certification[]
}
