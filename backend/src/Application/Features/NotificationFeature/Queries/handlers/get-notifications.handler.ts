import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { Inject } from '@nestjs/common'
import { GetNotificationsQuery } from '../get-notifications.query'
import { INotificationRepository } from '../../../../repositories/notification.repository'
import { Notification } from '../../../../../Domain/entities/notification.entity'
import { Role } from '../../../../../Domain/enums/role.enum'

const RECRUITER_EXCLUDED_TYPES = new Set(['recommendations-recomputed'])

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
    constructor(
        @Inject(INotificationRepository)
        private readonly repo: INotificationRepository,
    ) {}

    async execute(query: GetNotificationsQuery): Promise<Notification[]> {
        const all = await this.repo.findByUserId(query.userId, query.limit)
        if (query.role === Role.RECRUITER || query.role === Role.ADMIN) {
            return all.filter((n) => !RECRUITER_EXCLUDED_TYPES.has(n.type))
        }
        return all
    }
}