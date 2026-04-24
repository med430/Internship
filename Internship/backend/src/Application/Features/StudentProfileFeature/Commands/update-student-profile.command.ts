export class UpdateStudentProfileCommand {
    constructor(
        public readonly userId: string,
        public readonly bio?: string
    ) {}
}