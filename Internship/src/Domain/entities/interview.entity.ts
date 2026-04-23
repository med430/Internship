export class Interview {
    constructor(
        public readonly id: string,

        public readonly studentId: string,
        public readonly offerId: string,

        public score: number,
        public feedback: string,

        public summary?: string,

    ) {}

}