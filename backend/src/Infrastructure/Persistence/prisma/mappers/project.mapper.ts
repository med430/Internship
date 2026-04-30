// infrastructure/mappers/project.mapper.ts
import { Injectable } from '@nestjs/common'
import { Project as PrismaProject } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import {Project} from "../../../../Domain/entities/project.entity";

@Injectable()
export class ProjectMapper implements IGenericMapper<Project, PrismaProject> {
    toDomain(raw: PrismaProject): Project {
        return new Project(
            raw.id,
            raw.studentProfileId,
            raw.title,
            raw.description,
            raw.technologies,
            raw.githubUrl ?? undefined,
            raw.demoUrl   ?? undefined,
        )
    }

    toPersistence(domain: Project): PrismaProject {
        return {
            id:               domain.id,
            studentProfileId: domain.studentProfileId,
            title:            domain.title,
            description:      domain.description,
            technologies:     domain.technologies,
            githubUrl:        domain.githubUrl ?? null,
            demoUrl:          domain.demoUrl   ?? null,
        }
    }
}