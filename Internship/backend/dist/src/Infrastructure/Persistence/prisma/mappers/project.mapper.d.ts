import { Project as PrismaProject } from '@prisma/client';
import { IGenericMapper } from './generic.mapper';
import { Project } from "../../../../Domain/entities/project.entity";
export declare class ProjectMapper implements IGenericMapper<Project, PrismaProject> {
    toDomain(raw: PrismaProject): Project;
    toPersistence(domain: Project): PrismaProject;
}
