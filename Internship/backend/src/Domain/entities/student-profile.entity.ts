import { CV } from './cv.entity'
import { Application } from './application.entity'
import {Skill} from "./skill.entity";
import {SkillAssignment} from "./skill-assignment.entity";

export class StudentProfile {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public cvs: CV[] = [],
        public skills: SkillAssignment[],
        public applications: Application[] = [],
        public bio?: string,
    ) {}
}