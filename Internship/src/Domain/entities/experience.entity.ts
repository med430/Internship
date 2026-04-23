export class Experience {
    constructor(
        public readonly id: string,
        public readonly cvId: string,
        public company: string,
        public role: string,
        public duration: string,
        public description?: string
    ) {}
}