import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service'

import { OfferRepository } from './prisma/repositories/offer.prisma.repository'
import { UserRepository } from './prisma/repositories/user.prisma.repository'

import { OfferPrismaMapper } from './prisma/mappers/offer.mapper'
import { UserPrismaMapper } from './prisma/mappers/user.mapper'

import { IOfferRepository } from '../../Application/repositories/offer.repository'
import { IUserRepository } from '../../Application/repositories/user.repository'
import {SkillPrismaMapper} from "./prisma/mappers/skill.mapper";
import {ISkillRepository} from "../../Application/repositories/skill.repository";
import {SkillRepository} from "./prisma/repositories/skill.prisma.repository";
@Module({
    providers: [
        PrismaService,

        // 🔥 MAPPERS
        OfferPrismaMapper,
        UserPrismaMapper,
        SkillPrismaMapper, // 🔥 AJOUT

        // 🔥 REPOSITORIES
        {
            provide: IOfferRepository,
            useClass: OfferRepository,
        },
        {
            provide: IUserRepository,
            useClass: UserRepository,
        },
        {
            provide: ISkillRepository, // 🔥 AJOUT
            useClass: SkillRepository,
        },
    ],

    exports: [
        PrismaService,
        IOfferRepository,
        IUserRepository,
        ISkillRepository, // 🔥 AJOUT
    ],
})
export class PersistenceModule {}