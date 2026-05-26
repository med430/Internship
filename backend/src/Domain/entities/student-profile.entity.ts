import { CV } from './cv.entity'
import {SkillAssignment} from "./skill-assignment.entity";
import {Experience} from "./experience.entity";
import {Project} from "./project.entity";
import {Education} from "./education.entity";
import {Certification} from "./certification.entity";
import {Gender} from "../enums/gender";
import {WorkMode} from "../enums/workMode";
import {OfferType} from "../enums/offer-type.enum";

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

        // Recommendation preferences
        public preferredDomains: string[] = [],
        public preferredCities: string[] = [],
        public preferredWorkMode?: WorkMode,
        public availableFrom?: Date,
        public availableTo?: Date,
        public paidOnly: boolean = false,
        public preferredOfferTypes: OfferType[] = [],
        public languages: string[] = [],
        public maxCommuteCities: string[] = [],

        // Academic context
        public schoolId?: number,
        public currentYear?: number,
        public currentProgram?: string,
    ) {}
}
