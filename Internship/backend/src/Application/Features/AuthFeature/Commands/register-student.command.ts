// Commands/register-student.command.ts
export class RegisterStudentCommand {
    constructor(
        public readonly email: string,
        public readonly name: string,
        public readonly lastname: string,
        public readonly username: string,
        public readonly password: string
    ) {}
}