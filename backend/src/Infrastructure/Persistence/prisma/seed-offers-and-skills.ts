// Seeds the expanded skills table + all offers from seed-offers(2).json.
// Run: npx ts-node -r tsconfig-paths/register src/Infrastructure/Persistence/prisma/seed-offers-and-skills.ts

import { PrismaClient, SkillLevel, WorkMode, OfferType } from '@prisma/client'
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

// ── New skills ────────────────────────────────────────────────────────────────
// Added to expand coverage for software architecture, cybersecurity, embedded /
// industrial informatics, and common infrastructure tooling.
const NEW_SKILLS = [
    // Software architecture & distributed systems
    'System Design', 'Microservices Architecture', 'Design Patterns', 'gRPC',
    'WebSockets', 'RabbitMQ', 'Apache Kafka', 'Elasticsearch', 'GraphQL',
    'Event-Driven Architecture', 'Clean Architecture',
    // Testing
    'TDD', 'Unit Testing', 'E2E Testing',
    // Web / frontend additions
    'Socket.io', 'SCSS/Sass', 'Svelte', 'Bootstrap', 'Vite',
    // Languages
    'Go', 'PHP', 'Scala', 'C',
    // Mobile
    'Jetpack Compose', 'SwiftUI', 'Android Development',
    // Data / AI
    'Pandas', 'NumPy', 'Scikit-learn', 'OpenCV', 'Apache Spark',
    'HuggingFace', 'Power BI', 'Tableau', 'SQL',
    // DevOps / infra
    'Terraform', 'Ansible', 'Nginx', 'Prometheus', 'Grafana', 'Jenkins',
    'ArgoCD', 'ELK Stack',
    // Cybersecurity
    'Cybersecurity', 'Penetration Testing', 'Network Security',
    'Ethical Hacking', 'Vulnerability Assessment', 'OWASP', 'Wireshark',
    'Cryptography', 'Reverse Engineering',
    // Embedded / industrial informatics
    'Embedded Linux', 'FreeRTOS', 'RTOS', 'FPGA',
    'Verilog/VHDL', 'PLC Programming', 'SCADA', 'Arduino', 'Raspberry Pi',
    'CAN Bus', 'UART/SPI/I2C', 'Assembly',
]

// ── Offer data (from seed-offers(2).json, both batches merged) ────────────────
const OFFERS: {
    recruiterProfileId: string
    title: string
    company: string
    location: string
    domain: string
    description: string
    workMode: WorkMode
    type: OfferType
    isPaid: boolean
    stipendMin?: number
    stipendMax?: number
    positionsCount: number
    languagesRequired: string[]
    startDate: string
    endDate: string
    applicationDeadline: string
    skills: { name: string; level: SkillLevel; mandatory: boolean }[]
}[] = [
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'MERN Full-Stack Engineer', company: 'Squadio', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Looking for a Full-Stack intern to scale our core product features using the MERN stack.\n\nResponsibilities:\n- Build dynamic components in React\n- Develop scalable API endpoints using Node.js and Express.js\n- Manage document schemas in MongoDB',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 800, stipendMax: 1200,
        positionsCount: 2, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-10',
        skills: [
            { name: 'React', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Express.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'MongoDB', level: 'BEGINNER', mandatory: false },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: true },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Remote Full-Stack Developer', company: 'Talan', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Variant of our MERN stack position, optimized entirely for remote collaboration across international delivery squads.\n\nResponsibilities:\n- Implement clean state management workflows\n- Connect frontend apps to Express.js microservices\n- Write unit tests for data layer logic',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 900, stipendMax: 1300,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-04',
        skills: [
            { name: 'React', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Express.js', level: 'BEGINNER', mandatory: true },
            { name: 'TypeScript', level: 'BEGINNER', mandatory: false },
            { name: 'Git', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '469b73b0-9728-412a-a67c-9c954a3c9600',
        title: 'Full-Stack Web Developer (Onsite)', company: 'Proxym', location: 'Sousse, Tunisia',
        domain: 'Web Development',
        description: 'Onsite implementation of our Javascript web stack, focusing on regional enterprise application dashboards.\n\nResponsibilities:\n- Design pixel-perfect modules matching Figma wireframes\n- Optimize database transactions and API response times\n- Coordinate features during daily team standups',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 500, stipendMax: 800,
        positionsCount: 3, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-15',
        skills: [
            { name: 'React', level: 'BEGINNER', mandatory: true },
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'HTML/CSS', level: 'ADVANCED', mandatory: true },
            { name: 'Communication', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '8b9b5a1c-24ba-4eb1-9d3b-7a4933b70166',
        title: 'Computer Vision & Deep Learning Intern', company: 'InstaDeep', location: 'Tunis, Tunisia',
        domain: 'Data Science',
        description: 'Focusing purely on deep learning variations, you will train and optimize multi-modal computer vision networks.\n\nResponsibilities:\n- Build data loaders and processing pipelines\n- Run model evaluations using PyTorch and TensorFlow systems\n- Log parameters and model architectures accurately',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 1000, stipendMax: 1500,
        positionsCount: 2, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-03',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Machine Learning', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PyTorch', level: 'INTERMEDIATE', mandatory: true },
            { name: 'TensorFlow', level: 'BEGINNER', mandatory: false },
            { name: 'OpenCV', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'b95e9975-968e-4337-973e-197ae8f35465',
        title: 'AI Research Engineer (Remote)', company: 'Cynapsis AI', location: 'Tunis, Tunisia',
        domain: 'Data Science',
        description: 'Fully remote variant of our AI division, specializing in natural language parsing and custom model tuning workflows.\n\nResponsibilities:\n- Fine-tune open-weights neural network structures\n- Build high-throughput inference serving architectures using Python\n- Implement semantic parsing solutions via LangChain frameworks',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 800, stipendMax: 1200,
        positionsCount: 1, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-05',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Machine Learning', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PyTorch', level: 'BEGINNER', mandatory: true },
            { name: 'LangChain', level: 'BEGINNER', mandatory: true },
            { name: 'HuggingFace', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'ebc987c8-1429-401a-a11c-dcd837935eb9',
        title: 'Data Science & MLOps Intern', company: 'Machinestalk', location: 'Ariana, Tunisia',
        domain: 'Data Science',
        description: 'Intersection of Data Science and DevOps. You will help clean telemetry data streams and encapsulate models inside cloud runtimes.\n\nResponsibilities:\n- Clean data feeds and extract analytical indicators using Python\n- Containerize analytical runtimes using Docker setups\n- Coordinate automated deployment tasks with our platform infrastructure leads',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 600, stipendMax: 900,
        positionsCount: 1, languagesRequired: ['English', 'French'],
        startDate: '2026-06-25', endDate: '2026-09-25', applicationDeadline: '2026-06-12',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Machine Learning', level: 'BEGINNER', mandatory: true },
            { name: 'Docker', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Linux', level: 'BEGINNER', mandatory: false },
            { name: 'CI/CD', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Flutter Mobile Intern', company: 'Satoripop', location: 'Sousse, Tunisia',
        domain: 'Mobile',
        description: 'Hybrid mobile app role focusing on fluid, cross-platform layouts for regional e-commerce products.\n\nResponsibilities:\n- Implement modular responsive screens with Flutter\n- Handle centralized state structures cleanly\n- Integrate application views with active backend REST APIs',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 500, stipendMax: 850,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-14',
        skills: [
            { name: 'Flutter', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Git', level: 'BEGINNER', mandatory: true },
            { name: 'Dart', level: 'INTERMEDIATE', mandatory: true },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Mobile Engineer (Remote Flutter)', company: 'Chifco', location: 'Tunis, Tunisia',
        domain: 'Mobile',
        description: 'Remote variant of our mobile engineering tract, connecting frontend mobile layout layers to internal IoT systems.\n\nResponsibilities:\n- Structure clean multi-device view logic with Flutter workflows\n- Resolve multi-threaded performance bottlenecks across target phones\n- Map native async message structures over REST APIs',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 650, stipendMax: 1000,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-15', endDate: '2026-10-15', applicationDeadline: '2026-06-08',
        skills: [
            { name: 'Flutter', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Problem Solving', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Git', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '469b73b0-9728-412a-a67c-9c954a3c9600',
        title: 'DevOps Cloud Infrastructure Intern', company: 'Expensya', location: 'Tunis, Tunisia',
        domain: 'DevOps',
        description: 'Core infrastructure track built around continuous delivery pipelines and cloud isolation engines.\n\nResponsibilities:\n- Maintain automatic release pathways via GitHub Actions automation maps\n- Containerize monolithic architectures cleanly using Docker layers\n- Configure cloud network components inside AWS resource groups',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 800, stipendMax: 1150,
        positionsCount: 2, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-06',
        skills: [
            { name: 'Docker', level: 'INTERMEDIATE', mandatory: true },
            { name: 'CI/CD', level: 'INTERMEDIATE', mandatory: true },
            { name: 'GitHub Actions', level: 'INTERMEDIATE', mandatory: true },
            { name: 'AWS', level: 'BEGINNER', mandatory: true },
            { name: 'Linux', level: 'BEGINNER', mandatory: false },
            { name: 'Terraform', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '8b9b5a1c-24ba-4eb1-9d3b-7a4933b70166',
        title: 'DevOps Specialist (Azure Variant)', company: 'Amaris Consulting', location: 'Tunis, Tunisia',
        domain: 'DevOps',
        description: 'Variation of our core DevOps track, swapping out the target cloud provider to support client setups built entirely on Azure ecosystems.\n\nResponsibilities:\n- Manage systemic image deployment operations across container networks\n- Construct continuous integration workflows within GitHub Actions environments\n- Audit storage allocation trends using native Linux tooling parameters',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 700, stipendMax: 1100,
        positionsCount: 1, languagesRequired: ['English', 'French'],
        startDate: '2026-06-15', endDate: '2026-09-15', applicationDeadline: '2026-06-02',
        skills: [
            { name: 'Docker', level: 'INTERMEDIATE', mandatory: true },
            { name: 'CI/CD', level: 'INTERMEDIATE', mandatory: true },
            { name: 'GitHub Actions', level: 'BEGINNER', mandatory: true },
            { name: 'Azure', level: 'BEGINNER', mandatory: true },
            { name: 'Linux', level: 'INTERMEDIATE', mandatory: false },
            { name: 'Terraform', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'b95e9975-968e-4337-973e-197ae8f35465',
        title: 'Java Spring Boot / Angular (PFE)', company: 'Vermeg', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Enterprise graduation project linking core relational services to structured single-page administrative platforms.\n\nResponsibilities:\n- Create thread-safe financial business logic structures utilizing Java and Spring Boot modules\n- Wire secure frontend rendering flows leveraging Angular systems\n- Refactor indexes and storage scripts inside localized MySQL environments',
        workMode: 'ONSITE', type: 'PFE', isPaid: true, stipendMin: 700, stipendMax: 1000,
        positionsCount: 4, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-12-31', applicationDeadline: '2026-06-15',
        skills: [
            { name: 'Java', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Spring Boot', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Angular', level: 'INTERMEDIATE', mandatory: true },
            { name: 'MySQL', level: 'BEGINNER', mandatory: true },
            { name: 'Agile/Scrum', level: 'BEGINNER', mandatory: false },
            { name: 'Design Patterns', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'ebc987c8-1429-401a-a11c-dcd837935eb9',
        title: 'Java Spring Boot / React Variation', company: 'Sofrecom', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Variation of our Java microservices project, modifying the front-end layout engine from Angular to React.\n\nResponsibilities:\n- Set up scalable backend APIs via Java and Spring Boot structures\n- Build high-performance, asynchronous dashboard layouts using React hooks\n- Map transactional object hierarchies securely to active MySQL containers',
        workMode: 'HYBRID', type: 'PFE', isPaid: true, stipendMin: 650, stipendMax: 950,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-12-31', applicationDeadline: '2026-06-11',
        skills: [
            { name: 'Java', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Spring Boot', level: 'INTERMEDIATE', mandatory: true },
            { name: 'React', level: 'INTERMEDIATE', mandatory: true },
            { name: 'MySQL', level: 'BEGINNER', mandatory: true },
            { name: 'Git', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Python Django Backend Developer', company: 'Think-it', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Pure backend variation built with Python web frameworks to process high-throughput analytical workloads.\n\nResponsibilities:\n- Implement secure, normalized data access engines using Django models\n- Expose comprehensive platform features via standardized REST APIs\n- Build precise data tables and execution query models within PostgreSQL storage hubs',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 850, stipendMax: 1300,
        positionsCount: 2, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-07',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Django', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PostgreSQL', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Git', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Python FastAPI Developer (Hybrid)', company: 'Vistaprint', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Variation of our Python backend track, using FastAPI to build high-performance microservices.\n\nResponsibilities:\n- Develop asynchronous API routers using FastAPI logic systems\n- Manage structured relational schemas using PostgreSQL and raw database connectors\n- Deploy localized test suites to check processing behavior across all core endpoints',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 900, stipendMax: 1400,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-05',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'FastAPI', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PostgreSQL', level: 'BEGINNER', mandatory: true },
            { name: 'REST API', level: 'ADVANCED', mandatory: true },
            { name: 'Docker', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '469b73b0-9728-412a-a67c-9c954a3c9600',
        title: 'React Native Mobile Specialist', company: 'Satoripop', location: 'Sousse, Tunisia',
        domain: 'Mobile',
        description: 'Mobile layout intersection focusing on JavaScript-driven native cross-device setups rather than Flutter engines.\n\nResponsibilities:\n- Build interactive UI configurations utilizing React Native workflows\n- Enforce component typing definitions cleanly through TypeScript parameters\n- Fetch and cache dynamic data feeds sourced directly from internal REST APIs',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 500, stipendMax: 800,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-14',
        skills: [
            { name: 'React Native', level: 'INTERMEDIATE', mandatory: true },
            { name: 'TypeScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'INTERMEDIATE', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: false },
            { name: 'Git', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '8b9b5a1c-24ba-4eb1-9d3b-7a4933b70166',
        title: 'React Native Mobile (Remote Variant)', company: 'Squadio', location: 'Tunis, Tunisia',
        domain: 'Mobile',
        description: 'Remote variant of our Javascript cross-platform mobile track.\n\nResponsibilities:\n- Debug responsive UI layout components across mobile form-factors\n- Write declarative application state management logic files via TypeScript modules\n- Coordinate system updates with backend API design groups',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 750, stipendMax: 1100,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-06-20', endDate: '2026-09-20', applicationDeadline: '2026-06-03',
        skills: [
            { name: 'React Native', level: 'INTERMEDIATE', mandatory: true },
            { name: 'TypeScript', level: 'BEGINNER', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'BEGINNER', mandatory: false },
            { name: 'Problem Solving', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'b95e9975-968e-4337-973e-197ae8f35465',
        title: 'Next.js / Node.js Fullstack Intern', company: 'Chifco', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'High performance full-stack intersection, grouping server-rendered frontend patterns with scalable database abstraction systems.\n\nResponsibilities:\n- Assemble server-optimized view architectures utilizing Next.js tools\n- Construct functional, high-speed API layers using Node.js workflows\n- Build streamlined data querying pipelines relying on Prisma and PostgreSQL',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 600, stipendMax: 950,
        positionsCount: 2, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-09',
        skills: [
            { name: 'Next.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Prisma', level: 'BEGINNER', mandatory: true },
            { name: 'PostgreSQL', level: 'BEGINNER', mandatory: true },
            { name: 'Tailwind CSS', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'ebc987c8-1429-401a-a11c-dcd837935eb9',
        title: 'Next.js / NestJS Advanced Architecture', company: 'Think-it', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Variation of our full-stack JavaScript track, shifting the backend architecture to NestJS to enforce strict object-oriented patterns.\n\nResponsibilities:\n- Design scalable, modular API controllers leveraging NestJS design concepts\n- Formulate optimized web layouts within Next.js framework blocks\n- Connect data access contexts using Prisma abstractions across PostgreSQL engines',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 900, stipendMax: 1350,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-06',
        skills: [
            { name: 'Next.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'NestJS', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Prisma', level: 'BEGINNER', mandatory: true },
            { name: 'PostgreSQL', level: 'INTERMEDIATE', mandatory: false },
            { name: 'TypeScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Clean Architecture', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Data Infrastructure Engineer', company: 'Cimpress', location: 'Tunis, Tunisia',
        domain: 'Data Science',
        description: 'Data domain intersection focused heavily on storage infrastructure modeling and cloud data transformations.\n\nResponsibilities:\n- Develop transactional ETL scripts utilizing Python automation maps\n- Design and optimize relational reporting models built within PostgreSQL environments\n- Audit data storage bottlenecks inside corporate cloud instances',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 800, stipendMax: 1300,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-06-15', endDate: '2026-09-15', applicationDeadline: '2026-06-04',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PostgreSQL', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Data Science', level: 'BEGINNER', mandatory: true },
            { name: 'Pandas', level: 'INTERMEDIATE', mandatory: false },
            { name: 'AWS', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Data Infrastructure Engineer (MySQL Variant)', company: 'Actia', location: 'Ariana, Tunisia',
        domain: 'Data Science',
        description: 'Variation of our core data engineering script tract, swapping the primary database engine to MySQL.\n\nResponsibilities:\n- Write reliable data pipelines and transformation tooling blocks via Python libraries\n- Maintain performance metrics for schemas operating across MySQL database endpoints\n- Document data mapping files clearly alongside platform developers',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 600, stipendMax: 900,
        positionsCount: 2, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-13',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'MySQL', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Data Science', level: 'BEGINNER', mandatory: true },
            { name: 'Pandas', level: 'BEGINNER', mandatory: false },
            { name: 'Git', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '469b73b0-9728-412a-a67c-9c954a3c9600',
        title: 'Frontend Vue.js Developer', company: 'Proxym', location: 'Sousse, Tunisia',
        domain: 'Web Development',
        description: 'Frontend layout variation built with lightweight Javascript frameworks to design fast enterprise software portals.\n\nResponsibilities:\n- Deliver web components structured via Vue.js design patterns\n- Refine global state setups and interface styles utilizing Tailwind CSS systems\n- Connect presentation components safely to existing backend service endpoints',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 450, stipendMax: 750,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-15',
        skills: [
            { name: 'Vue.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Tailwind CSS', level: 'INTERMEDIATE', mandatory: true },
            { name: 'HTML/CSS', level: 'ADVANCED', mandatory: true },
            { name: 'Communication', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '8b9b5a1c-24ba-4eb1-9d3b-7a4933b70166',
        title: 'Software Engineering Alternance (Vue.js / Node.js)', company: 'Sopra Steria', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'An alternate-track variation combining our Vue.js visual components with structured JavaScript backend runtime engines.\n\nResponsibilities:\n- Support ongoing maintenance of web applications using Vue.js workflows\n- Build backend integration endpoints within Node.js code layers\n- Trace system bugs and document resolutions within sprint files',
        workMode: 'ONSITE', type: 'ALTERNANCE', isPaid: true, stipendMin: 600, stipendMax: 900,
        positionsCount: 1, languagesRequired: ['French', 'English'],
        startDate: '2026-09-01', endDate: '2026-12-31', applicationDeadline: '2026-06-15',
        skills: [
            { name: 'Vue.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'BEGINNER', mandatory: true },
            { name: 'Agile/Scrum', level: 'BEGINNER', mandatory: false },
        ],
    },
    // ── Second batch ─────────────────────────────────────────────────────────
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Firmware Systems Developer', company: 'Sagemcom', location: 'Tunis, Tunisia',
        domain: 'Embedded Systems',
        description: 'Join our smart metering firmware unit. You will debug low-level hardware communication drivers and optimize runtime memory constraints.\n\nResponsibilities:\n- Develop and patch hardware abstraction layers utilizing C++ structures\n- Configure multi-threaded compilation routines on localized Linux kernels\n- Manage version branch merges using Git tools',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 600, stipendMax: 950,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-08',
        skills: [
            { name: 'C++', level: 'INTERMEDIATE', mandatory: true },
            { name: 'C', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Linux', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Embedded Linux', level: 'BEGINNER', mandatory: false },
            { name: 'Git', level: 'BEGINNER', mandatory: true },
            { name: 'Problem Solving', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Embedded Software Automation Intern', company: 'Telnet', location: 'Sfax, Tunisia',
        domain: 'Embedded Systems',
        description: 'Sfax office variant focusing on automation workflows for consumer hardware microcontrollers and board-level loop testing.\n\nResponsibilities:\n- Design diagnostic scripts using C++ modules\n- Emulate hardware operational loops over bare-metal Linux variants\n- Document structural device edge-case flaws cleanly',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 550, stipendMax: 850,
        positionsCount: 1, languagesRequired: ['French', 'English'],
        startDate: '2026-07-15', endDate: '2026-10-15', applicationDeadline: '2026-06-12',
        skills: [
            { name: 'C++', level: 'INTERMEDIATE', mandatory: true },
            { name: 'C', level: 'BEGINNER', mandatory: false },
            { name: 'Linux', level: 'BEGINNER', mandatory: true },
            { name: 'RTOS', level: 'BEGINNER', mandatory: false },
            { name: 'Problem Solving', level: 'ADVANCED', mandatory: true },
            { name: 'Communication', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '469b73b0-9728-412a-a67c-9c954a3c9600',
        title: 'Cloud Services Backend Intern', company: 'Kamioun', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Help streamline our logistics coordination platform by scaling out stateless microservice engines inside cloud clusters.\n\nResponsibilities:\n- Write predictable processing controllers using Node.js runtimes\n- Coordinate asynchronous microservice integrations leveraging native AWS components\n- Expose highly normalized data patterns through standard REST APIs',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 850, stipendMax: 1250,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-05',
        skills: [
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'AWS', level: 'INTERMEDIATE', mandatory: true },
            { name: 'REST API', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Microservices Architecture', level: 'BEGINNER', mandatory: false },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '8b9b5a1c-24ba-4eb1-9d3b-7a4933b70166',
        title: 'IoT Serverless Infrastructure Architect', company: 'Wattnow', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Variation of our backend track optimized to capture high-velocity electrical telemetry records into non-blocking queues.\n\nResponsibilities:\n- Build real-time stream ingestion points using Node.js logic frameworks\n- Map localized cloud execution routines cleanly inside AWS services\n- Version code structures efficiently via team Git workflows',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 750, stipendMax: 1100,
        positionsCount: 2, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-09',
        skills: [
            { name: 'Node.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'AWS', level: 'BEGINNER', mandatory: true },
            { name: 'WebSockets', level: 'BEGINNER', mandatory: false },
            { name: 'Git', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Problem Solving', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'b95e9975-968e-4337-973e-197ae8f35465',
        title: 'Automation QA Pipeline Engineer', company: 'RoamSmart', location: 'Tunis, Tunisia',
        domain: 'DevOps',
        description: 'Focus strictly on the intersection of programmatic testing scripts and automatic validation runners for telecom routing data.\n\nResponsibilities:\n- Author functional automation scripts utilizing Python tools\n- Deploy clean validation steps inside automated CI/CD configurations\n- Manage isolated sandbox testing systems inside Linux environments',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 700, stipendMax: 1050,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-04',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'CI/CD', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Linux', level: 'BEGINNER', mandatory: true },
            { name: 'TDD', level: 'BEGINNER', mandatory: false },
            { name: 'Git', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'ebc987c8-1429-401a-a11c-dcd837935eb9',
        title: 'Systems Verification Intern', company: 'Focus Automation', location: 'Ariana, Tunisia',
        domain: 'DevOps',
        description: 'Hybrid variation of our validation workflow track, placing greater emphasis on communication and cross-team test documentation loops.\n\nResponsibilities:\n- Implement regression checks and data generation paths with Python libraries\n- Track version anomalies and build logs cleanly using Git trees\n- Sync logic defects transparently with core platform developers',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 600, stipendMax: 900,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-06-20', endDate: '2026-09-20', applicationDeadline: '2026-06-11',
        skills: [
            { name: 'Python', level: 'BEGINNER', mandatory: true },
            { name: 'Git', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Communication', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Linux', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Enterprise Portal Web Developer', company: 'NeoXam', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Develop financial asset management layout systems. This track targets core enterprise software patterns with modern JS layout bundles.\n\nResponsibilities:\n- Scale data structures seamlessly using Java and Spring Boot ecosystems\n- Formulate type-safe interface modules relying on Angular frameworks\n- Refactor query performance rules within relational storage clusters',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 800, stipendMax: 1150,
        positionsCount: 3, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-14',
        skills: [
            { name: 'Java', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Spring Boot', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Angular', level: 'INTERMEDIATE', mandatory: true },
            { name: 'TypeScript', level: 'BEGINNER', mandatory: false },
            { name: 'Design Patterns', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Transactional Core Backend Developer', company: 'BIAT', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'An alternate-track contract variation inside our bank service automation group, targeting back-office microservice optimizations.\n\nResponsibilities:\n- Construct secure financial accounting modules utilizing Java and Spring Boot frameworks\n- Define relational structure behaviors explicitly within PostgreSQL instances\n- Apply Agile/Scrum task breakdowns inside localized sprint loops',
        workMode: 'ONSITE', type: 'ALTERNANCE', isPaid: true, stipendMin: 700, stipendMax: 1000,
        positionsCount: 1, languagesRequired: ['French'],
        startDate: '2026-09-01', endDate: '2026-12-31', applicationDeadline: '2026-06-15',
        skills: [
            { name: 'Java', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Spring Boot', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PostgreSQL', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Agile/Scrum', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '469b73b0-9728-412a-a67c-9c954a3c9600',
        title: 'UI Platform Engineer (TypeScript)', company: 'Attijari Bank', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Frontend engineering variation centered on rebuilding consumer-facing digital banking login grids with strict component typing rules.\n\nResponsibilities:\n- Model clean client-side component maps using React hooks\n- Guarantee accurate execution paths via strict TypeScript properties\n- Style unified layout segments following precise HTML/CSS wireframes',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 650, stipendMax: 950,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-10',
        skills: [
            { name: 'React', level: 'INTERMEDIATE', mandatory: true },
            { name: 'TypeScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'HTML/CSS', level: 'ADVANCED', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    {
        recruiterProfileId: '8b9b5a1c-24ba-4eb1-9d3b-7a4933b70166',
        title: 'Frontend Interface Designer', company: 'Swvl Tunisia', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Remote-first variant of our interface layout tract, built to standardize styling systems using utilities across dispatch maps.\n\nResponsibilities:\n- Draft visual presentation layouts relying on React architectures\n- Enforce strict input types with structural TypeScript schemas\n- Integrate atomic layouts cleanly using Tailwind CSS utility components',
        workMode: 'REMOTE', type: 'INTERNSHIP', isPaid: true, stipendMin: 800, stipendMax: 1200,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-10-01', applicationDeadline: '2026-06-03',
        skills: [
            { name: 'React', level: 'INTERMEDIATE', mandatory: true },
            { name: 'TypeScript', level: 'BEGINNER', mandatory: true },
            { name: 'Tailwind CSS', level: 'INTERMEDIATE', mandatory: true },
            { name: 'HTML/CSS', level: 'ADVANCED', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'b95e9975-968e-4337-973e-197ae8f35465',
        title: 'Data Pipeline Automation Intern', company: 'Orange Tunisie', location: 'Tunis, Tunisia',
        domain: 'Data Science',
        description: 'Build high-throughput extraction scripts to parse and index massive cell-tower network metric outputs into staging stores.\n\nResponsibilities:\n- Author reliable parsing engines with standard Python libraries\n- Model robust analytical tables operating in PostgreSQL schemas\n- Isolate processing runtime parameters within Docker container configurations',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 600, stipendMax: 900,
        positionsCount: 2, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-13',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'PostgreSQL', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Docker', level: 'BEGINNER', mandatory: true },
            { name: 'Pandas', level: 'INTERMEDIATE', mandatory: false },
            { name: 'Data Science', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'ebc987c8-1429-401a-a11c-dcd837935eb9',
        title: 'Cloud Analytics Infrastructure Specialist', company: 'Ooredoo Tunisia', location: 'Tunis, Tunisia',
        domain: 'Data Science',
        description: 'Hybrid iteration of our data transformation pipeline tract, mapping extracted records over globally redundant network topologies.\n\nResponsibilities:\n- Manage systemic information parsing sequences using Python automation tools\n- Orchestrate file distribution pipelines with custom AWS architecture groups\n- Audit processing bottlenecks using localized Linux logging directives',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 650, stipendMax: 1000,
        positionsCount: 1, languagesRequired: ['English', 'French'],
        startDate: '2026-06-25', endDate: '2026-09-25', applicationDeadline: '2026-06-07',
        skills: [
            { name: 'Python', level: 'INTERMEDIATE', mandatory: true },
            { name: 'AWS', level: 'BEGINNER', mandatory: true },
            { name: 'Linux', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Prometheus', level: 'BEGINNER', mandatory: false },
            { name: 'Data Science', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Jamstack Web Application Engineer', company: 'Gomycode', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Create blazingly fast educational layout screens using pre-rendered frameworks connected to distributed logic nodes.\n\nResponsibilities:\n- Construct modern application views using Next.js framework engines\n- Develop structured asynchronous interactivity through JavaScript logic blocks\n- Implement clean component hierarchies using standard HTML/CSS strategies',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 450, stipendMax: 700,
        positionsCount: 4, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-15',
        skills: [
            { name: 'Next.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: true },
            { name: 'HTML/CSS', level: 'ADVANCED', mandatory: true },
            { name: 'Git', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'c92e4e68-4d00-4bc8-82a7-f3871e44fab3',
        title: 'Fullstack Interface Prototype Developer', company: 'Minassa', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Hybrid variation of our modern JavaScript development track, swapping layout rendering layers to support rapid creative ecosystem portal launches.\n\nResponsibilities:\n- Engineer server-optimized visual landing frameworks with Next.js structures\n- Organize dynamic document data tracking hooks inside MongoDB systems\n- Wire secure JSON responses safely across standardized REST APIs',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 500, stipendMax: 800,
        positionsCount: 1, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-12',
        skills: [
            { name: 'Next.js', level: 'INTERMEDIATE', mandatory: true },
            { name: 'MongoDB', level: 'BEGINNER', mandatory: true },
            { name: 'REST API', level: 'INTERMEDIATE', mandatory: true },
            { name: 'JavaScript', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
    // ── Bonus: cybersecurity + embedded + system design ───────────────────────
    {
        recruiterProfileId: 'b95e9975-968e-4337-973e-197ae8f35465',
        title: 'Cybersecurity Analyst Intern', company: 'Securinets', location: 'Tunis, Tunisia',
        domain: 'Cybersecurity',
        description: 'Join our offensive security team. You will conduct penetration tests on web applications and internal network infrastructure.\n\nResponsibilities:\n- Perform black-box and grey-box web application penetration testing\n- Identify and document CVEs in client systems using Burp Suite and Wireshark\n- Write actionable remediation reports aligned with OWASP Top 10',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 700, stipendMax: 1050,
        positionsCount: 2, languagesRequired: ['English', 'French'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-10',
        skills: [
            { name: 'Cybersecurity', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Penetration Testing', level: 'BEGINNER', mandatory: true },
            { name: 'Network Security', level: 'INTERMEDIATE', mandatory: true },
            { name: 'OWASP', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Linux', level: 'INTERMEDIATE', mandatory: false },
            { name: 'Python', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'ebc987c8-1429-401a-a11c-dcd837935eb9',
        title: 'FPGA / Digital Design Intern', company: 'STMicroelectronics Tunisia', location: 'Tunis, Tunisia',
        domain: 'Embedded Systems',
        description: 'Work on FPGA prototyping for next-generation automotive MCU test benches.\n\nResponsibilities:\n- Design and simulate digital logic blocks in Verilog/VHDL\n- Implement FPGA bitstreams for hardware-in-the-loop test environments\n- Interface FPGA fabric with Linux host drivers via PCIe and UART',
        workMode: 'ONSITE', type: 'INTERNSHIP', isPaid: true, stipendMin: 750, stipendMax: 1100,
        positionsCount: 1, languagesRequired: ['French', 'English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-07',
        skills: [
            { name: 'FPGA', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Verilog/VHDL', level: 'INTERMEDIATE', mandatory: true },
            { name: 'C', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Linux', level: 'BEGINNER', mandatory: false },
            { name: 'Embedded Linux', level: 'BEGINNER', mandatory: false },
        ],
    },
    {
        recruiterProfileId: 'a7f02d3e-9f9d-4e50-8ec2-db2a2cbb48a3',
        title: 'Backend System Design Engineer', company: 'Talan', location: 'Tunis, Tunisia',
        domain: 'Web Development',
        description: 'Work on high-throughput distributed systems serving millions of API requests per day.\n\nResponsibilities:\n- Design scalable microservice topologies using event-driven patterns\n- Implement async message pipelines with Apache Kafka and Redis\n- Profile and optimize PostgreSQL query plans and caching layers',
        workMode: 'HYBRID', type: 'INTERNSHIP', isPaid: true, stipendMin: 950, stipendMax: 1400,
        positionsCount: 1, languagesRequired: ['English'],
        startDate: '2026-07-01', endDate: '2026-09-30', applicationDeadline: '2026-06-05',
        skills: [
            { name: 'System Design', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Microservices Architecture', level: 'INTERMEDIATE', mandatory: true },
            { name: 'Apache Kafka', level: 'BEGINNER', mandatory: true },
            { name: 'PostgreSQL', level: 'ADVANCED', mandatory: true },
            { name: 'Redis', level: 'INTERMEDIATE', mandatory: false },
            { name: 'Docker', level: 'INTERMEDIATE', mandatory: false },
        ],
    },
]

// We also need to add 'Dart' for the Flutter offer
const EXTRA_SKILLS = ['Dart']

async function getSkillMap() {
    const skills = await prisma.skill.findMany()
    return new Map(skills.map(s => [s.name, s.id]))
}

async function main() {
    console.log('Seeding new skills...')
    const allNewSkills = [...NEW_SKILLS, ...EXTRA_SKILLS]
    for (const name of allNewSkills) {
        await prisma.skill.upsert({ where: { name }, update: {}, create: { name } })
    }
    console.log(`✓ ${allNewSkills.length} new skills upserted`)

    const skillMap = await getSkillMap()

    console.log(`\nSeeding ${OFFERS.length} offers...`)
    let created = 0, skipped = 0
    for (const o of OFFERS) {
        // Resolve all skill ids — skip any unknown
        const requirements = o.skills.flatMap(s => {
            const id = skillMap.get(s.name)
            if (!id) { console.warn(`  ⚠ unknown skill "${s.name}" — skipped`); return [] }
            return [{ skillId: id, level: s.level as SkillLevel, mandatory: s.mandatory }]
        })

        try {
            await prisma.offer.create({
                data: {
                    recruiterProfileId: o.recruiterProfileId,
                    title: o.title,
                    company: o.company,
                    location: o.location,
                    domain: o.domain,
                    description: o.description,
                    workMode: o.workMode as WorkMode,
                    type: o.type as OfferType,
                    isPaid: o.isPaid,
                    stipendMin: o.stipendMin,
                    stipendMax: o.stipendMax,
                    positionsCount: o.positionsCount,
                    languagesRequired: o.languagesRequired,
                    startDate: new Date(o.startDate),
                    endDate: new Date(o.endDate),
                    applicationDeadline: new Date(o.applicationDeadline),
                    skillRequirements: { create: requirements },
                },
            })
            created++
        } catch (e: any) {
            console.error(`  ✗ ${o.title}: ${e.message}`)
            skipped++
        }
    }
    console.log(`✓ ${created} offers created, ${skipped} skipped`)
}

main()
    .catch(e => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
