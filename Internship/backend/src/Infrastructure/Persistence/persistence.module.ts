import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'

import { UserRepository } from './prisma/repositories/user.prisma.repository'
import { OfferRepository } from './prisma/repositories/offer.prisma.repository'
import { SkillRepository } from './prisma/repositories/skill.prisma.repository'
import { StudentProfileRepository } from './prisma/repositories/student-profile.prisma.repository'
import { RecruiterProfileRepository } from './prisma/repositories/recruiter-profile.prisma.repository'
import { ApplicationRepository } from './prisma/repositories/application.repository'

import { IUserRepository } from '../../Application/repositories/user.repository'
import { IOfferRepository } from '../../Application/repositories/offer.repository'
import { ISkillRepository } from '../../Application/repositories/skill.repository'
import { IStudentProfileRepository } from '../../Application/repositories/student-profile.repository'
import { IRecruiterProfileRepository } from '../../Application/repositories/recruiter-profile.repository'

import { SkillPrismaMapper } from './prisma/mappers/skill.mapper'
import { OfferPrismaMapper } from './prisma/mappers/offer.mapper'
import {IApplicationRepository} from "../../Application/repositories/application.repository.";

@Module({
    imports: [PrismaModule],

    providers: [
        // repos
        UserRepository,
        OfferRepository,
        SkillRepository,
        StudentProfileRepository,
        RecruiterProfileRepository,
        ApplicationRepository,

        // mappers
        OfferPrismaMapper,
        SkillPrismaMapper,

        // bindings
        { provide: IUserRepository, useClass: UserRepository },
        { provide: IOfferRepository, useClass: OfferRepository },
        { provide: ISkillRepository, useClass: SkillRepository },
        { provide: IStudentProfileRepository, useClass: StudentProfileRepository },
        { provide: IRecruiterProfileRepository, useClass: RecruiterProfileRepository },
        { provide: IApplicationRepository, useClass: ApplicationRepository },
    ],

    exports: [
        IUserRepository,
        IOfferRepository,
        ISkillRepository,
        IStudentProfileRepository,
        IRecruiterProfileRepository,
        IApplicationRepository, // 🔥 MANQUANT → FIX PRINCIPAL
    ],
})
export class PersistenceModule {}