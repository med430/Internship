import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NotificationDocument, NotificationSchema } from './schemas/notification.schema'
import { MongoNotificationRepository } from './repositories/mongo-notification.repository'
import { INotificationRepository } from '../../Application/repositories/notification.repository'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: NotificationDocument.name, schema: NotificationSchema },
        ]),
    ],
    providers: [
        { provide: INotificationRepository, useClass: MongoNotificationRepository },
    ],
    exports: [INotificationRepository],
})
export class NotificationPersistenceModule {}