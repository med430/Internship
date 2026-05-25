import { CV } from './cv.entity'
import {SkillAssignment} from "./skill-assignment.entity";
import {Experience} from "./experience.entity";
import {Project} from "./project.entity";
import {Education} from "./education.entity";
import {Certification} from "./certification.entity";
import {Gender} from "../enums/gender";

export class StudentProfile {
    constructor(
        public readonly id: string,
        public readonly userId: string,

        public bio?: string,

        public birthDate?: Date,
        public gender?: Gender,

        public address?: string,
        public city?: string,

        public skills: SkillAssignment[] = [],
        public experiences: Experience[] = [],
        public projects: Project[] = [],

        public educations: Education[] = [],
        public certifications: Certification[] = [],

        public cvs: CV[] = [],

        public domains: string[] = [],
    ) {}
}