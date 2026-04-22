import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { IStudentProfileRepository } from '../../../../Application/repositories/student-profile.repository'
import {StudentProfile} from "../../../../Domain/entities/student-profile.entity";

@Injectable()
export class StudentProfileRepository implements IStudentProfileRepository {

    constructor(private prisma: PrismaService) {}

    async create(data: { id: string; userId: string }): Promise<void> {
        await this.prisma.studentProfile.create({
            data
        })
    }
    async findByUserId(userId: string): Promise<StudentProfile | null> {

        const res = await this.prisma.studentProfile.findUnique({
            where: { userId }
        })

        if (!res) return null

        return new StudentProfile(
            res.id,
            res.userId,
            [], // cvs (tu peux laisser vide)
            [], // skills
            []  // applications
        )
    }
}