import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ProfileViewMapper } from '../mappers/profile-view.mapper'
import { IProfileViewRepository } from '../../../../Application/repositories/profile-view.repository'
import { ProfileView } from '../../../../Domain/entities/profile-view.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class ProfileViewRepositoryImpl
    extends GenericRepository<ProfileView, any>
    implements IProfileViewRepository {

    constructor(prisma: PrismaService, mapper: ProfileViewMapper) {
        super(prisma, 'profileView', mapper)
    }

    async findByRecruiter(recruiterUserId: string, limit = 100): Promise<ProfileView[]> {
        const rows = await this.prisma.profileView.findMany({
            where: { recruiterUserId },
            orderBy: { viewedAt: 'desc' },
            take: limit,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }

    async findByStudentProfile(studentProfileId: string, limit = 100): Promise<ProfileView[]> {
        const rows = await this.prisma.profileView.findMany({
            where: { studentProfileId },
            orderBy: { viewedAt: 'desc' },
            take: limit,
        })
        return rows.map(r => this.mapper.toDomain(r))
    }
}
