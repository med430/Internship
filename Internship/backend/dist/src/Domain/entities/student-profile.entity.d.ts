import { CV } from './cv.entity';
import { SkillAssignment } from "./skill-assignment.entity";
import { Experience } from "./experience.entity";
import { Project } from "./project.entity";
import { Education } from "./education.entity";
import { Certification } from "./certification.entity";
import { Gender } from "../enums/gender";
export declare class StudentProfile {
    readonly id: string;
    readonly userId: string;
    bio?: string | undefined;
    birthDate?: Date | undefined;
    gender?: Gender | undefined;
    address?: string | undefined;
    city?: string | undefined;
    skills: SkillAssignment[];
    experiences: Experience[];
    projects: Project[];
    educations: Education[];
    certifications: Certification[];
    cvs: CV[];
    constructor(id: string, userId: string, bio?: string | undefined, birthDate?: Date | undefined, gender?: Gender | undefined, address?: string | undefined, city?: string | undefined, skills?: SkillAssignment[], experiences?: Experience[], projects?: Project[], educations?: Education[], certifications?: Certification[], cvs?: CV[]);
}
