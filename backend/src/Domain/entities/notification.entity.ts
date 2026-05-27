export class Notification {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly type: string,
        public readonly title: string,
        public readonly message: string,
        public readonly link: string | null,
        public isRead: boolean,
        public readonly createdAt: Date,
        public deletedAt: Date | null,
    ) {}
}
