import { Injectable } from '@nestjs/common'
import { RecruiterProfile as Domain } from '../../../../Domain/entities/recruiter-profile.entity'
import { RecruiterProfile as DB } from '@prisma/client'
@Injectable()
export class RecruiterProfilePrismaMapper {

    toDomain(entity: DB): Domain {
        return new Domain(
            entity.id,        // 🔥 AJOUT
            entity.userId,
            entity.company,
            []
        )
    }

    toPersistence(domain: Domain) {
        return {
            id: domain.id,           // 🔥 AJOUT
            userId: domain.userId,
            company: domain.company
        }
    }
}