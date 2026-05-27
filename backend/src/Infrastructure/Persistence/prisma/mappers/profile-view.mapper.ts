import { Injectable } from '@nestjs/common'
import { ProfileView as PrismaProfileView } from '@prisma/client'
import { IGenericMapper } from './generic.mapper'
import { ProfileView } from '../../../../Domain/entities/profile-view.entity'

@Injectable()
export class ProfileViewMapper implements IGenericMapper<ProfileView, PrismaProfileView> {
    toDomain(raw: PrismaProfileView): ProfileView {
        return new ProfileView(
            raw.id,
            raw.recruiterUserId,
            raw.studentProfileId,
            raw.viewedAt,
            raw.offerId ?? undefined,
        )
    }

    toPersistence(domain: ProfileView): PrismaProfileView {
        return {
            id:               domain.id,
            recruiterUserId:  domain.recruiterUserId,
            studentProfileId: domain.studentProfileId,
            viewedAt:         domain.viewedAt,
            offerId:          domain.offerId ?? null,
        }
    }
}
