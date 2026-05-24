export declare class Project {
    readonly id: string;
    readonly studentProfileId: string;
    title: string;
    description: string;
    technologies: string[];
    githubUrl?: string | undefined;
    demoUrl?: string | undefined;
    constructor(id: string, studentProfileId: string, title: string, description: string, technologies: string[], githubUrl?: string | undefined, demoUrl?: string | undefined);
}
