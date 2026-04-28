export class UpdateProjectCommand {
    constructor(
        public readonly userId: string,
        public readonly id: string,
        public readonly title?: string,
        public readonly description?: string,
        public readonly technologies?: string[],
        public readonly githubUrl?: string,
        public readonly demoUrl?: string
    ) {}
}