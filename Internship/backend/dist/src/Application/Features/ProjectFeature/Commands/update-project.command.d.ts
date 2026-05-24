export declare class UpdateProjectCommand {
    readonly userId: string;
    readonly id: string;
    readonly title?: string | undefined;
    readonly description?: string | undefined;
    readonly technologies?: string[] | undefined;
    readonly githubUrl?: string | undefined;
    readonly demoUrl?: string | undefined;
    constructor(userId: string, id: string, title?: string | undefined, description?: string | undefined, technologies?: string[] | undefined, githubUrl?: string | undefined, demoUrl?: string | undefined);
}
