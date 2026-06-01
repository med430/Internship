// One-shot script: enriches 3 existing student profiles with projects, experiences,
// education, certifications, skills, and preferences so semantic scoring has real
// signal to work with. Run once: npx ts-node -r tsconfig-paths/register src/Infrastructure/Persistence/prisma/seed-rich-profiles.ts

import { PrismaClient, SkillLevel } from '@prisma/client'
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

// Profile IDs pulled directly from the DB.
const PROFILES = {
    // Wissem — fullstack/devops, strong backend; should rank high on NestJS/Docker/cloud offers.
    wissem: 'b9446237-371b-4380-a6e7-a83c21aeac87',
    // Alice — ML/data science; should rank high on Python/ML/data offers.
    alice:  'eeb8a567-149f-4f84-be21-333ceb221ba6',
    // Medps4fr — mobile/cross-platform; should rank high on Flutter/React Native offers.
    medps4fr: '4319bd6b-1c42-45c3-ac44-8072acd24613',
}

// Skill ids from the DB (SELECT id, name FROM "Skill").
const S = {
    React: 1, Vue: 2, TypeScript: 5, JavaScript: 6, Tailwind: 8,
    Node: 10, NestJS: 11, FastAPI: 16, GraphQL: 17, REST: 18,
    Postgres: 19, MongoDB: 21, Redis: 22,
    Docker: 29, Kubernetes: 30, AWS: 31, GCP: 32, CI: 34, GHActions: 35,
    Linux: 36, Python: 37, TensorFlow: 38, PyTorch: 39, ML: 40, DataScience: 41,
    Git: 43,
    Flutter: 26, ReactNative: 25, Kotlin: 28,
    Next: 4,
}

async function upsertProfile(id: string, data: object) {
    await (prisma.studentProfile as any).update({ where: { id }, data })
}

async function addSkill(profileId: string, skillId: number, level: SkillLevel) {
    const exists = await prisma.skillAssignment.findFirst({
        where: { studentProfileId: profileId, skillId },
    })
    if (!exists) {
        await prisma.skillAssignment.create({
            data: { studentProfileId: profileId, skillId, level },
        })
    }
}

async function main() {
    // ── Wissem: fullstack + devops ─────────────────────────────────────────────
    await upsertProfile(PROFILES.wissem, {
        bio: 'Software engineering student at INSAT, passionate about building production-grade distributed systems. Experienced with NestJS, React, and container-based deployment on AWS. Looking for backend or fullstack internships where I can contribute to real systems.',
        preferredDomains: ['Backend Development', 'DevOps & SRE', 'Web Development'],
        preferredCities: ['Tunis', 'Remote'],
        currentYear: 3,
        currentProgram: 'Software Engineering',
    })
    for (const [id, level] of [
        [S.TypeScript, 'ADVANCED'], [S.NestJS, 'ADVANCED'], [S.Node, 'ADVANCED'],
        [S.React, 'INTERMEDIATE'], [S.Next, 'INTERMEDIATE'], [S.Postgres, 'INTERMEDIATE'],
        [S.Redis, 'INTERMEDIATE'], [S.Docker, 'ADVANCED'], [S.AWS, 'INTERMEDIATE'],
        [S.GHActions, 'INTERMEDIATE'], [S.Git, 'ADVANCED'], [S.Linux, 'INTERMEDIATE'],
        [S.GraphQL, 'BEGINNER'],
    ] as [number, SkillLevel][]) {
        await addSkill(PROFILES.wissem, id, level)
    }
    await prisma.project.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.wissem,
            title: 'Internship Matching Platform',
            description: 'A full-stack platform connecting Tunisian students with internship offers. Built a NestJS CQRS backend with Prisma/NeonDB, a Next.js frontend, Supabase auth, and a Python FastAPI ML sidecar serving BGE-M3 semantic recommendations.',
            technologies: ['NestJS', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker', 'Python', 'FastAPI'],
        },
        {
            studentProfileId: PROFILES.wissem,
            title: 'Distributed Task Queue',
            description: 'Redis-backed task queue with worker pools and retry logic. Exposed a REST API for task submission and real-time status via SSE.',
            technologies: ['Node.js', 'Redis', 'TypeScript', 'Docker'],
        },
    ]})
    await prisma.experience.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.wissem,
            role: 'Backend Engineering Intern',
            company: 'Hexastack',
            startDate: new Date('2024-07-01'),
            endDate:   new Date('2024-09-30'),
            description: 'Built and maintained NestJS microservices, wrote database migrations with Prisma, and deployed services on AWS ECS with GitHub Actions CI/CD.',
        },
    ]})
    await prisma.education.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.wissem,
            school: 'INSAT',
            degree: 'Engineering',
            field: 'Software Engineering',
            startDate: new Date('2022-09-01'),
        },
    ]})
    await prisma.certification.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.wissem,
            name: 'AWS Cloud Practitioner',
            organization: 'Amazon Web Services',
            issueDate: new Date('2024-03-01'),
        },
    ]})
    console.log('✓ wissem enriched')

    // ── Alice: ML / data science ───────────────────────────────────────────────
    await upsertProfile(PROFILES.alice, {
        bio: 'Final-year data science student at ENIT with hands-on experience training neural networks for computer vision and NLP. Looking for AI/ML internships or data science positions. Comfortable working end-to-end from data wrangling to model deployment.',
        preferredDomains: ['Machine Learning', 'Data Science', 'AI Research'],
        preferredCities: ['Tunis', 'Remote', 'Paris'],
        currentYear: 5,
        currentProgram: 'Data Science & AI',
    })
    for (const [id, level] of [
        [S.Python, 'ADVANCED'], [S.TensorFlow, 'ADVANCED'], [S.PyTorch, 'INTERMEDIATE'],
        [S.ML, 'ADVANCED'], [S.DataScience, 'ADVANCED'], [S.Postgres, 'INTERMEDIATE'],
        [S.MongoDB, 'BEGINNER'], [S.FastAPI, 'INTERMEDIATE'], [S.Docker, 'INTERMEDIATE'],
        [S.Git, 'ADVANCED'], [S.Linux, 'INTERMEDIATE'],
    ] as [number, SkillLevel][]) {
        await addSkill(PROFILES.alice, id, level)
    }
    await prisma.project.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.alice,
            title: 'Arabic Sentiment Analysis for Social Media',
            description: 'Fine-tuned AraBERT on a custom-labeled Tunisian dialect dataset. Achieved 87% F1 on a held-out test set. Deployed as a FastAPI service with a Gradio demo.',
            technologies: ['Python', 'PyTorch', 'FastAPI', 'HuggingFace', 'Docker'],
        },
        {
            studentProfileId: PROFILES.alice,
            title: 'Defect Detection on PCBs',
            description: 'YOLOv8-based object detection pipeline for printed circuit board quality control. Trained on a synthetic dataset augmented with real factory images, reaching 94% mAP@0.5.',
            technologies: ['Python', 'TensorFlow', 'OpenCV', 'YOLOv8'],
        },
    ]})
    await prisma.experience.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.alice,
            role: 'ML Research Intern',
            company: 'Digital Research Center of Sfax',
            startDate: new Date('2024-06-01'),
            endDate:   new Date('2024-08-31'),
            description: 'Researched low-resource NLP techniques for Tunisian Arabic. Implemented and benchmarked three transformer fine-tuning strategies. Contributed to an academic paper submission.',
        },
    ]})
    await prisma.education.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.alice,
            school: 'ENIT',
            degree: 'Engineering',
            field: 'Data Science and Artificial Intelligence',
            startDate: new Date('2020-09-01'),
        },
    ]})
    await prisma.certification.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.alice,
            name: 'Deep Learning Specialization',
            organization: 'DeepLearning.AI / Coursera',
            issueDate: new Date('2023-11-01'),
        },
        {
            studentProfileId: PROFILES.alice,
            name: 'TensorFlow Developer Certificate',
            organization: 'Google',
            issueDate: new Date('2024-01-15'),
        },
    ]})
    console.log('✓ alice enriched')

    // ── Medps4fr: mobile / cross-platform ─────────────────────────────────────
    await upsertProfile(PROFILES.medps4fr, {
        bio: 'Software engineering student specialising in cross-platform mobile development with Flutter and React Native. Published two apps on the Play Store. Interested in mobile-first startups and fintech.',
        preferredDomains: ['Mobile Development', 'Cross-Platform', 'Frontend'],
        preferredCities: ['Tunis', 'Remote'],
        currentYear: 4,
        currentProgram: 'Software Engineering',
    })
    for (const [id, level] of [
        [S.Flutter, 'ADVANCED'], [S.ReactNative, 'ADVANCED'], [S.Kotlin, 'INTERMEDIATE'],
        [S.JavaScript, 'ADVANCED'], [S.TypeScript, 'INTERMEDIATE'], [S.React, 'INTERMEDIATE'],
        [S.Node, 'BEGINNER'], [S.REST, 'INTERMEDIATE'], [S.Git, 'ADVANCED'],
        [S.Docker, 'BEGINNER'],
    ] as [number, SkillLevel][]) {
        await addSkill(PROFILES.medps4fr, id, level)
    }
    await prisma.project.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.medps4fr,
            title: 'Stagio Mobile App',
            description: 'Flutter app for internship seekers. Features include offer browsing, one-tap application, real-time chat with recruiters, and push notifications. Published on Play Store with 500+ downloads.',
            technologies: ['Flutter', 'Dart', 'Firebase', 'REST API'],
        },
        {
            studentProfileId: PROFILES.medps4fr,
            title: 'Campus Event Tracker',
            description: 'React Native app for INSAT students to discover and RSVP to campus events. Integrated with a Node.js/Express backend and PostgreSQL.',
            technologies: ['React Native', 'JavaScript', 'Node.js', 'PostgreSQL'],
        },
    ]})
    await prisma.experience.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.medps4fr,
            role: 'Mobile Developer Intern',
            company: 'Vermeg',
            startDate: new Date('2024-07-01'),
            endDate:   new Date('2024-09-30'),
            description: 'Built new screens and REST API integrations for a Flutter-based banking app used by 10k+ customers. Wrote unit and widget tests achieving 80% coverage.',
        },
    ]})
    await prisma.education.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.medps4fr,
            school: 'INSAT',
            degree: 'Engineering',
            field: 'Software Engineering',
            startDate: new Date('2021-09-01'),
        },
    ]})
    await prisma.certification.createMany({ skipDuplicates: true, data: [
        {
            studentProfileId: PROFILES.medps4fr,
            name: 'Google Associate Android Developer',
            organization: 'Google',
            issueDate: new Date('2024-05-01'),
        },
    ]})
    console.log('✓ medps4fr enriched')
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
