import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BadRequestException, ForbiddenException, Inject, NotFoundException } from '@nestjs/common'

import { AnswerInterviewCommand } from '../answer-interview.command'
import { Interview } from '../../../../../Domain/entities/interview.entity'
import { InterviewStatus } from '../../../../../Domain/enums/interview-status.enum'
import { RecruiterMode } from '../../../../../Domain/enums/recruiter-mode.enum'

import { IInterviewRepository } from '../../../../repositories/interview.repository'
import { InterviewAiService, InterviewContext, InterviewEvaluation, InterviewScores } from '../../../../Services/InterviewService/interview-ai.service'

type InterviewTurn = {
    question: string
    answer: string
    scores: InterviewScores
    feedback: string
}

type InterviewData = {
    context: InterviewContext
    maxQuestions: number
    questions: string[]
    answers: string[]
    turns: InterviewTurn[]
}

@CommandHandler(AnswerInterviewCommand)
export class AnswerInterviewHandler implements ICommandHandler<AnswerInterviewCommand> {
    constructor(
        @Inject(IInterviewRepository)
        private readonly interviewRepo: IInterviewRepository,

        private readonly aiService: InterviewAiService,
    ) {}

    async execute(command: AnswerInterviewCommand) {
        if (!command.audio) throw new BadRequestException('Audio is required')

        const interview = await this.interviewRepo.findById(command.interviewId)
        if (!interview || interview.deletedAt) {
            throw new NotFoundException('Interview not found')
        }

        if (interview.studentId !== command.userId) {
            throw new ForbiddenException('Not allowed')
        }

        if (interview.status !== InterviewStatus.IN_PROGRESS) {
            throw new BadRequestException('Interview is not active')
        }

        const data = this.ensureData(interview)
        const questionIndex = data.answers.length + 1

        const currentQuestion = data.questions[data.questions.length - 1]
        if (!currentQuestion) {
            throw new BadRequestException('Missing interview question')
        }

        const transcript = await this.aiService.transcribeAudio(command.audio)
        const history = data.turns.map(t => ({ question: t.question, answer: t.answer }))

        const evaluation = await this.aiService.evaluateAnswer(
            data.context,
            interview.recruiterMode ?? RecruiterMode.EMPATHIC,
            currentQuestion,
            transcript,
            questionIndex,
            data.maxQuestions,
            history,
        )

        this.appendTurn(data, currentQuestion, transcript, evaluation)

        const shouldEnd = !evaluation.nextQuestion || questionIndex >= data.maxQuestions

        if (!shouldEnd && evaluation.nextQuestion) {
            data.questions.push(evaluation.nextQuestion)
            interview.data = data
            await this.interviewRepo.save(interview)

            const audio = await this.aiService.textToSpeech(
                evaluation.nextQuestion,
                interview.recruiterMode ?? RecruiterMode.EMPATHIC,
            )

            return {
                done: false,
                transcript,
                scores: evaluation.scores,
                feedback: evaluation.feedback,
                nextQuestion: evaluation.nextQuestion,
                audioBase64: audio.audioBase64,
                audioMime: audio.audioMime,
                questionIndex: data.questions.length,
            }
        }

        const finalScore = this.computeFinalScore(data.turns)
        const summary = await this.aiService.summarizeInterview(data.context, data.turns)

        interview.status = InterviewStatus.COMPLETED
        interview.score = finalScore
        interview.feedback = summary.feedback
        interview.summary = summary.summary
        interview.data = data

        await this.interviewRepo.save(interview)

        return {
            done: true,
            transcript,
            scores: evaluation.scores,
            feedback: interview.feedback,
            summary: interview.summary,
            score: interview.score,
            questionIndex,
        }
    }

    private ensureData(interview: Interview): InterviewData {
        const data = interview.data as InterviewData | undefined

        if (!data || !data.context || !Array.isArray(data.questions) || !Array.isArray(data.answers)) {
            throw new BadRequestException('Interview data is missing')
        }

        if (!Array.isArray(data.turns)) data.turns = []

        return data
    }

    private appendTurn(
        data: InterviewData,
        question: string,
        answer: string,
        evaluation: InterviewEvaluation,
    ) {
        const turn: InterviewTurn = {
            question,
            answer,
            scores: evaluation.scores,
            feedback: evaluation.feedback,
        }

        data.turns.push(turn)
        data.answers.push(answer)
    }

    private computeFinalScore(turns: InterviewTurn[]): number {
        if (!turns.length) return 0

        const total = turns.reduce((sum, turn) => {
            const overall = Number(turn.scores.overall)
            return sum + (Number.isFinite(overall) ? overall : 0)
        }, 0)

        const avg = total / turns.length
        const clamped = Math.max(0, Math.min(10, avg))
        return Math.round(clamped * 10)
    }
}
