import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import {IRecruiterProfileRepository} from "../../../../Application/repositories/recruiter-profile.repository";

@Injectable()
export class RecruiterProfileRepository implements IRecruiterProfileRepository {

    constructor(private prisma: PrismaService) {}

    async create(data: { id: string; userId: string }): Promise<void> {
        await this.prisma.recruiterProfile.create({
            data
        })
    }
    async findByUserId(userId: string) {
        return this.prisma.recruiterProfile.findUnique({
            where: { userId }
        })
    }
}