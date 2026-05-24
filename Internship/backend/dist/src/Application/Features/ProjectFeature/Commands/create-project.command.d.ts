export declare class CreateProjectCommand {
    readonly userId: string;
    readonly title: string;
    readonly description: string;
    readonly technologies: string[];
    readonly githubUrl?: string | undefined;
    readonly demoUrl?: string | undefined;
    constructor(userId: string, title: string, description: string, technologies: string[], githubUrl?: string | undefined, demoUrl?: string | undefined);
}
