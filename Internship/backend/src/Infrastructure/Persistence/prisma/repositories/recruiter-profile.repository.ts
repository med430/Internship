// infrastructure/repositories/recruiter-profile.repository.impl.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { RecruiterProfileMapper } from '../mappers/recruiter-profile.mapper'
import { IRecruiterProfileRepository } from '../../../../Application/repositories/recruiter-profile.repository'
import { RecruiterProfile } from '../../../../Domain/entities/recruiter-profile.entity'
import {GenericRepository} from "./generic.repositories";

const RECRUITER_PROFILE_INCLUDE = {
    offers: {
        include: {
            skillRequirements: {
                include: { skill: true }
            }
        }
    }
} as const

@Injectable()
export class RecruiterProfileRepositoryImpl
    extends GenericRepository<RecruiterProfile, any>
    implements IRecruiterProfileRepository {

    constructor(
        prisma: PrismaService,
        mapper: RecruiterProfileMapper
    ) {
        super(prisma, 'recruiterProfile', mapper)
    }

    async findById(id: string): Promise<RecruiterProfile | null> {
        const result = await this.prisma.recruiterProfile.findUnique({
            where: { id },
            include: RECRUITER_PROFILE_INCLUDE
        })
        return result ? this.mapper.toDomain(result) : null
    }

    async findByUserId(userId: string): Promise<RecruiterProfile | null> {
        const result = await this.prisma.recruiterProfile.findUnique({
            where: { userId },
            include: RECRUITER_PROFILE_INCLUDE
        })
        return result ? this.mapper.toDomain(result) : null
    }

    async update(profile: RecruiterProfile): Promise<RecruiterProfile> {
        const result = await this.prisma.recruiterProfile.update({
            where: { id: profile.id },
            data: this.mapper.toPersistence(profile),
            include: RECRUITER_PROFILE_INCLUDE
        })
        return this.mapper.toDomain(result)
    }
}