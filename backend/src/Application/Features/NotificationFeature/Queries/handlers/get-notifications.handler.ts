import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetNotificationsQuery } from '../get-notifications.query'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
    constructor(
        @Inject(INotificationRepository)
        private readonly repo: INotificationRepository,
    ) {}

    async execute(query: GetNotificationsQuery): Promise<Notification[]> {
        return this.repo.findByUserId(query.userId, query.limit)
    }
}