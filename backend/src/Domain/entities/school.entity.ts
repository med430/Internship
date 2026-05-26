export class School {
    constructor(
        public readonly id: number,
        public name: string,
        public fullName: string,
        public city: string,
        public type?: string,
        public website?: string,
    ) {}
}
