// Canonical career-domain list the profile + offer UIs pick from. Each entry is a string the recommender substring-matches against.

export const CAREER_DOMAINS = [
    // Software engineering — broken down so students can pick what they actually do
    'Web Development',
    'Frontend Development',
    'Backend Development',
    'Full-Stack Development',
    'Mobile Development',
    'DevOps & SRE',
    'Cloud Engineering',
    'Cybersecurity',
    'Machine Learning & AI',
    'Data Science',
    'Data Engineering',
    'Embedded Systems & IoT',
    'Game Development',
    'Blockchain & Web3',
    'QA & Test Engineering',
    'UI/UX Design',
    'Robotics',

    // Other engineering
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Industrial Engineering',

    // Sciences & research
    'Biotechnology',
    'Pharmaceuticals',
    'Education & Research',

    // Business & ops
    'Product Management',
    'Business & Management',
    'Sales & Marketing',
    'Finance & Accounting',
    'Operations & Supply Chain',
    'Legal & Compliance',
    'Healthcare',
    'Art',
] as const

export type CareerDomain = (typeof CAREER_DOMAINS)[number]