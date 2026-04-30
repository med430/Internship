export class AnswerInterviewCommand {
    constructor(
        public readonly userId: string,
        public readonly interviewId: string,
        public readonly audio: Express.Multer.File,
    ) {}
}
