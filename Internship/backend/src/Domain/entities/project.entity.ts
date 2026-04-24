export class Project {
    constructor(
        public readonly id: string,
        public readonly studentProfileId: string,

        public title: string,
        public description: string,

        public technologies: string[]
    ) {}
}