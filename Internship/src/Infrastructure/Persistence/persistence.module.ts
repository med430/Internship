import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'

import { IUserRepository } from '../../Application/repositories/user.repository'
import { UserRepository } from './prisma/repositories/user.prisma.repository'
import { IOfferRepository } from '../../Application/repositories/offer.repository';
import { OfferRepository } from './prisma/repositories/offer.prisma.repository';
import { UserPrismaMapper } from './prisma/mappers/user.mapper';
import { OfferPrismaMapper } from './prisma/mappers/offer.mapper';
import { ISkillRepository } from '../../Application/repositories/skill.repository';
import { SkillRepository } from './prisma/repositories/skill.prisma.repository';

@Module({
    imports: [PrismaModule],

    providers: [
      UserPrismaMapper,
      OfferPrismaMapper,
        {
            provide: IUserRepository,
            useClass: UserRepository,
        },
      {
        provide: IOfferRepository,
        useClass: OfferRepository,
      },
      {
        provide: ISkillRepository,
        useClass: SkillRepository,
      },
    ],

    exports: [
        IUserRepository,
        IOfferRepository,
      ISkillRepository,
    ],
})
export class PersistenceModule {}