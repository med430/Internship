// Commands/update-student-profile.command.ts
import { Gender } from '../../../../Domain/enums/gender'

export class UpdateStudentProfileCommand {
    constructor(
        public readonly userId: string,
        // User fields
        public readonly name?: string,
        public readonly lastname?: string,
        public readonly username?: string,
        public readonly phone?: string,
        public readonly avatarUrl?: string,
        // StudentProfile fields
        public readonly bio?: string,
        public readonly birthDate?: Date,
        public readonly gender?: Gender,
        public readonly address?: string,
        public readonly city?: string,
    ) {}
}