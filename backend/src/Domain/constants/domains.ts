export const CAREER_DOMAINS = [
    'Art',
    'Business & Management',
    'Education & Research',
    'Engineering',
    'Finance & Accounting',
    'Healthcare',
    'IT & Software Engineering',
    'Legal & Compliance',
    'Operations & Supply Chain',
    'Sales & Marketing',
] as const

export type CareerDomain = (typeof CAREER_DOMAINS)[number]
