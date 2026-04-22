import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'

import { IUserRepository } from '../../Application/repositories/user.repository'
import { UserRepository } from './prisma/repositories/user.prisma.repository'
import { IOfferRepository } from '../../Application/repositories/offer.repository';
import { OfferRepository } from './prisma/repositories/offer.prisma.repository';
import { UserPrismaMapper } from './prisma/mappers/user.mapper';
import { OfferPrismaMapper } from './prisma/mappers/offer.mapper';

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
      }
    ],

    exports: [
        IUserRepository,
        IOfferRepository,
    ],
})
export class PersistenceModule {}