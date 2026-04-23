import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {IRecruiterProfileRepository} from "../../../../Application/repositories/recruiter-profile.repository";
import {RecruiterProfile} from "../../../../Domain/entities/recruiter-profile.entity";
import { RecruiterProfile as RecruiterDB } from '@prisma/client'

@Injectable()
export class RecruiterProfileRepository implements IRecruiterProfileRepository {

    constructor(private prisma: PrismaService) {}

    async create(data: {
        id: string
        userId: string
        company: string
    }): Promise<void> {

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
}