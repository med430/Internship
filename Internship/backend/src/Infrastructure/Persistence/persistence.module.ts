import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'

import { IUserRepository } from '../../Application/repositories/user.repository'
import { UserRepository } from './prisma/repositories/user.prisma.repository'

@Module({
    imports: [PrismaModule],

    providers: [
        {
            provide: IUserRepository,
            useClass: UserRepository,
        },
    ],

    exports: [
        IUserRepository,
    ],
})
export class PersistenceModule {}