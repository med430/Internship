import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { StartInterviewCommand } from '../start-interview.command'
import { Interview } from '../../../../../Domain/entities/interview.entity'
import { InterviewStatus } from '../../../../../Domain/enums/interview-status.enum'
import { RecruiterMode } from '../../../../../Domain/enums/recruiter-mode.enum'

import { IInterviewRepository } from '../../../../repositories/interview.repository'
import { IOfferRepository } from '../../../../repositories/offer.repository'
import { InterviewAiService, InterviewContext } from '../../../../Services/InterviewService/interview-ai.service'

@CommandHandler(StartInterviewCommand)
export class StartInterviewHandler implements ICommandHandler<StartInterviewCommand> {
    constructor(
        @Inject(IInterviewRepository)
        private readonly interviewRepo: IInterviewRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        private readonly aiService: InterviewAiService,
    ) {}

    async execute(command: StartInterviewCommand) {
        const mode = command.recruiterMode ?? RecruiterMode.EMPATHIC
        const maxQuestions = command.questionCount ?? 5

        if (maxQuestions < 1 || maxQuestions > 10) {
            throw new BadRequestException('Invalid question count')
        }

        let context: InterviewContext

        if (command.offerId) {
            const offer = await this.offerRepo.findById(command.offerId)
            if (!offer || offer.deletedAt) {
                throw new NotFoundException('Offer not found')
            }

            context = {
                company: offer.company,
                jobTitle: offer.title,
                jobDescription: offer.description,
            }
        } else {
            if (!command.company || !command.jobDescription) {
                throw new BadRequestException('Company and jobDescription are required')
            }

            context = {
                company: command.company,
                jobTitle: command.jobTitle,
                jobDescription: command.jobDescription,
            }
        }

        const firstQuestion = await this.aiService.generateQuestion(
            context,
            mode,
            [],
            1,
            maxQuestions,
        )

        const data = {
            context,
            maxQuestions,
            questions: [firstQuestion],
            answers: [],
            turns: [],
        }

        const interview = new Interview(
            randomUUID(),
            command.userId,
            command.offerId,
            context.company,
            context.jobTitle,
            context.jobDescription,
            mode,
            InterviewStatus.IN_PROGRESS,
            0,
            '',
            undefined,
            data,
        )

        const saved = await this.interviewRepo.save(interview)
        const audio = await this.aiService.textToSpeech(firstQuestion, mode)

        return {
            interviewId: saved.id,
            question: firstQuestion,
            audioBase64: audio.audioBase64,
            audioMime: audio.audioMime,
            questionIndex: 1,
            recruiterMode: mode,
        }
    }
}
