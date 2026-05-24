import { Gender } from '../../../../Domain/enums/gender';
export declare class UpdateStudentProfileDto {
    name?: string;
    lastname?: string;
    username?: string;
    phone?: string;
    avatarUrl?: string;
    bio?: string;
    birthDate?: Date;
    gender?: Gender;
    address?: string;
    city?: string;
}
