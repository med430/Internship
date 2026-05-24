import { Gender } from '../../../../Domain/enums/gender';
export declare class UpdateStudentProfileCommand {
    readonly userId: string;
    readonly name?: string | undefined;
    readonly lastname?: string | undefined;
    readonly username?: string | undefined;
    readonly phone?: string | undefined;
    readonly avatarUrl?: string | undefined;
    readonly bio?: string | undefined;
    readonly birthDate?: Date | undefined;
    readonly gender?: Gender | undefined;
    readonly address?: string | undefined;
    readonly city?: string | undefined;
    constructor(userId: string, name?: string | undefined, lastname?: string | undefined, username?: string | undefined, phone?: string | undefined, avatarUrl?: string | undefined, bio?: string | undefined, birthDate?: Date | undefined, gender?: Gender | undefined, address?: string | undefined, city?: string | undefined);
}
