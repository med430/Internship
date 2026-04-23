export class Project {
    constructor(
        public readonly id: string,
        public readonly cvId: string,
        public title: string,
        public description: string,
        public technologies: string[]
    ) {}
}