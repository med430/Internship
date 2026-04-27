import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {IRecruiterProfileRepository} from "../../../../Application/repositories/recruiter-profile.repository";
import {RecruiterProfile} from "../../../../Domain/entities/recruiter-profile.entity";
import {RecruiterProfilePrismaMapper} from "../mappers/recruiter-profile.mapper";
@Injectable()
export class RecruiterProfileRepository implements IRecruiterProfileRepository {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: RecruiterProfilePrismaMapper
    ) {}
    async create(data: { id: string; userId: string; company: string }): Promise<void> {
        await this.prisma.recruiterProfile.create({
            data: {
                id: data.id,
                userId: data.userId,
                company: data.company
            }
        })
    }
    async findByUserId(userId: string): Promise<RecruiterProfile | null> {

        const res: RecruiterDB | null =
            await this.prisma.recruiterProfile.findUnique({
                where: { userId }
            })

        if (!res) return null

        return new RecruiterProfile(
            res.id,
            res.userId,
            res.company // ✔ maintenant reconnu
        )
    }

    // 🔥 CQRS (propre)
    async findDomainByUserId(userId: string): Promise<RecruiterProfile | null> {
        const res = await this.prisma.recruiterProfile.findUnique({
            where: { userId }
        })

        if (!res) return null

        return this.mapper.toDomain(res)
    }

    async update(profile: RecruiterProfile): Promise<RecruiterProfile> {
        const result = await this.prisma.recruiterProfile.update({
            where: { userId: profile.userId },
            data: {
                company: profile.company
            }
        })

        return this.mapper.toDomain(result)
    }
}