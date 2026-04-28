// infrastructure/repositories/experience.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ExperienceMapper } from '../mappers/experience.mapper'
import {GenericRepository} from "./generic.repositories";
import {IExperienceRepository} from "../../../../Application/repositories/experience.repository";
import {Experience} from "../../../../Domain/entities/experience.entity";

@Injectable()
export class ExperienceRepositoryImpl
    extends GenericRepository<Experience, any>
    implements IExperienceRepository {

    constructor(prisma: PrismaService, mapper: ExperienceMapper) {
        super(prisma, 'experience', mapper)
    }
}