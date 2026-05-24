import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common'



import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import {IApplicationRepository} from "../../../../repositories/application.repository";
import {DownloadApplicationFileCommand} from "../download-file.command";
import {FileStorageService} from "../../../../Services/FileStorageService/FileStorageService";
import {ICVRepository} from "../../../../repositories/cv.repository";
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository'

@CommandHandler(DownloadApplicationFileCommand)
export class DownloadApplicationFileHandler
    implements ICommandHandler<DownloadApplicationFileCommand> {

    constructor(
        @Inject(IApplicationRepository)
        private readonly appRepo: IApplicationRepository,

        @Inject(IOfferRepository)
        private readonly offerRepo: IOfferRepository,

        @Inject(IRecruiterProfileRepository)
        private readonly recruiterRepo: IRecruiterProfileRepository,

        @Inject(ICVRepository)
        private readonly cvRepo: ICVRepository,

        @Inject(ICoverLetterRepository)                              // ← ajouter
        private readonly coverLetterRepo: ICoverLetterRepository,   // ← ajouter

        @Inject(FileStorageService)
        private readonly fileService: FileStorageService
    ) {}

    async execute(command: DownloadApplicationFileCommand): Promise<string> {
        const { applicationId, userId, type } = command

        const application = await this.appRepo.findById(applicationId)
        if (!application) throw new NotFoundException()

        const offer = await this.offerRepo.findById(application.offerId)
        if (!offer || offer.deletedAt) throw new NotFoundException()

        const recruiter = await this.recruiterRepo.findByUserId(userId)
        if (!recruiter) throw new ForbiddenException()

        if (offer.recruiterProfileId !== recruiter.id) throw new ForbiddenException()

        if (type === 'cv') {
            const cv = await this.cvRepo.findById(application.cvId)
            if (!cv || cv.deletedAt) throw new NotFoundException()
            return this.fileService.getFileUrl(cv.fileUrl)
        }

        // coverLetter
        if (!application.coverLetterId) throw new NotFoundException('No cover letter')
        const letter = await this.coverLetterRepo.findById(application.coverLetterId)
        if (!letter || letter.deletedAt) throw new NotFoundException()
        return this.fileService.getFileUrl(letter.fileUrl)
    }
}