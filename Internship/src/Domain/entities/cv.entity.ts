import { Project } from './project.entity'
import { Experience } from './experience.entity'
import {BaseEntity} from "./base.entity";

export class CV extends BaseEntity {
    constructor(
        public readonly id: string,
        public readonly studentId: string,

        public fileUrl: string,

        public parsedData: any,

        public skills: string[],
        public projects: Project[],
        public experiences: Experience[],
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
    ) {
        super(createdAt, updatedAt, deletedAt)
    }
}