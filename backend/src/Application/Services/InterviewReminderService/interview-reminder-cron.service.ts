import { Injectable, Logger, Inject } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { IInterviewSlotRepository } from '../../repositories/interview-slot.repository'
import { InterviewSlot } from '../../../Domain/entities/interview-slot.entity'
import { EmailService, buildReminderEmail } from '../EmailService/email.service'

@Injectable()
export class InterviewReminderCronService {
    private readonly logger = new Logger(InterviewReminderCronService.name)
    private readonly sent24h = new Set<string>()
    private readonly sent1h = new Set<string>()

    constructor(
        @Inject(IInterviewSlotRepository)
        private readonly slotRepo: IInterviewSlotRepository,
        private readonly emailService: EmailService,
    ) {}

    // TEST: runs every hour at :35 (e.g. 1:35, 2:35...) — change to '0 * * * *' for prod
    @Cron('35 * * * *')
    async sendReminders(): Promise<void> {
        const now = new Date()
        await Promise.all([this.check24h(now), this.check1h(now)])
    }

    private async check24h(now: Date): Promise<void> {
        const from = new Date(now.getTime() + 23.5 * 3600_000)
        const to   = new Date(now.getTime() + 24.5 * 3600_000)
        const slots = await this.slotRepo.findConfirmedInWindow(from, to)
        for (const slot of slots) {
            if (this.sent24h.has(slot.id)) continue
            this.sent24h.add(slot.id)
            await this.dispatchReminder(slot, '24h')
        }
    }

    private async check1h(now: Date): Promise<void> {
        const from = new Date(now.getTime() + 30 * 60_000)
        const to   = new Date(now.getTime() + 90 * 60_000)
        const slots = await this.slotRepo.findConfirmedInWindow(from, to)
        for (const slot of slots) {
            if (this.sent1h.has(slot.id)) continue
            this.sent1h.add(slot.id)
            await this.dispatchReminder(slot, '1h')
        }
    }

    private async dispatchReminder(slot: InterviewSlot, delay: '24h' | '1h'): Promise<void> {
        if (!slot.studentEmail && !slot.recruiterEmail) return
        const subject = delay === '24h'
            ? `⏰ Rappel — votre entretien est demain : ${slot.offerTitle}`
            : `🔔 Rappel — votre entretien commence dans 1h : ${slot.offerTitle}`

        const opts = { offerTitle: slot.offerTitle ?? 'Entretien', startAt: slot.startAt, endAt: slot.endAt, delay }

        if (slot.studentEmail) {
            const html = buildReminderEmail({ recipientName: slot.studentName ?? 'Candidat', role: 'student', ...opts })
            await this.emailService.send(slot.studentEmail, subject, html)
            this.logger.log(`Reminder ${delay} sent to student ${slot.studentEmail} for slot ${slot.id}`)
        }
        if (slot.recruiterEmail) {
            const html = buildReminderEmail({ recipientName: slot.recruiterName ?? 'Recruteur', role: 'recruiter', ...opts })
            await this.emailService.send(slot.recruiterEmail, subject, html)
            this.logger.log(`Reminder ${delay} sent to recruiter ${slot.recruiterEmail} for slot ${slot.id}`)
        }
    }
}
