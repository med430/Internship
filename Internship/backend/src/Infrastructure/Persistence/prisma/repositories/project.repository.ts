// infrastructure/repositories/project.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ProjectMapper } from '../mappers/project.mapper'
import {GenericRepository} from "./generic.repositories";
import {IProjectRepository} from "../../../../Application/repositories/project.repository";
import {Project} from "../../../../Domain/entities/project.entity";

@Injectable()
export class ProjectRepositoryImpl
    extends GenericRepository<Project, any>
    implements IProjectRepository {

    constructor(prisma: PrismaService, mapper: ProjectMapper) {
        super(prisma, 'project', mapper)
    }
}