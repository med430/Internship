import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { SchoolMapper } from '../mappers/school.mapper'
import { ISchoolRepository } from '../../../../Application/repositories/school.repository'
import { School } from '../../../../Domain/entities/school.entity'
import { GenericRepository } from './generic.repositories'

@Injectable()
export class SchoolRepositoryImpl
    extends GenericRepository<School, any, number>
    implements ISchoolRepository {

    constructor(prisma: PrismaService, mapper: SchoolMapper) {
        super(prisma, 'school', mapper)
    }

    async save(entity: School): Promise<School> {
        const data = {
            name:     entity.name,
            fullName: entity.fullName,
            city:     entity.city,
            type:     entity.type ?? null,
            website:  entity.website ?? null,
        }

        const result = entity.id
            ? await this.prisma.school.update({ where: { id: entity.id }, data })
            : await this.prisma.school.create({ data })

        return this.mapper.toDomain(result)
    }

    async findByName(name: string): Promise<School | null> {
        const result = await this.prisma.school.findUnique({ where: { name } })
        return result ? this.mapper.toDomain(result) : null
    }
}
