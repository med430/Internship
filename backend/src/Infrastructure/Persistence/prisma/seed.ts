import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import { existsSync } from 'fs'
import { resolve } from 'path'

const envCandidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '..', '.env'),
]
dotenv.config({ path: envCandidates.find(p => existsSync(p)) ?? envCandidates[0] })

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DB_URL }),
})

const SKILLS = [
  // Frontend
  'React',
  'Vue.js',
  'Angular',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'HTML/CSS',
  'Tailwind CSS',
  'Redux',
  // Backend
  'Node.js',
  'NestJS',
  'Express.js',
  'Django',
  'Spring Boot',
  'Laravel',
  'FastAPI',
  'GraphQL',
  'REST API',
  // Database
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Prisma',
  'TypeORM',
  // Mobile
  'React Native',
  'Flutter',
  'Swift',
  'Kotlin',
  // DevOps / Cloud
  'Docker',
  'Kubernetes',
  'AWS',
  'GCP',
  'Azure',
  'CI/CD',
  'GitHub Actions',
  'Linux',
  // AI / Data
  'Python',
  'TensorFlow',
  'PyTorch',
  'Machine Learning',
  'Data Science',
  'LangChain',
  // General
  'Git',
  'Agile/Scrum',
  'Problem Solving',
  'Communication',
  'C++',
  'Java',
  'Rust',
]

async function main() {
  console.log('Seeding skills...')

  for (const name of SKILLS) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log(`✓ ${SKILLS.length} skills seeded`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())