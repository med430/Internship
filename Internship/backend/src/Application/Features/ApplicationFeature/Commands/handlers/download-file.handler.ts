import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException,
    ForbiddenException
} from '@nestjs/common'

import { join } from 'path'
import { existsSync } from 'fs'

import { IOfferRepository } from '../../../../repositories/offer.repository'
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository'
import {IApplicationRepository} from "../../../../repositories/application.repository";
import {DownloadApplicationFileCommand} from "../download-file.command";
import {FileStorageService} from "../../../../Services/FileStorageService/FileStorageService";
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

        @Inject(FileStorageService)
        private readonly fileService: FileStorageService
    ) {}

    async execute(command: DownloadApplicationFileCommand): Promise<string> {

        const { applicationId, userId, type } = command

        const application = await this.appRepo.findById(applicationId)
        if (!application) throw new NotFoundException()

        const offer = await this.offerRepo.findById(application.offerId)
        if (!offer || offer.deletedAt) {
            throw new NotFoundException()
        }

        const recruiter = await this.recruiterRepo.findByUserId(userId)
        if (!recruiter) throw new ForbiddenException()

        if (offer.recruiterProfileId !== recruiter.id) {
            throw new ForbiddenException()
        }

        const fileUrl =
            type === 'cv'
                ? application.cvId
                : application.coverLetterId

        if (!fileUrl) throw new NotFoundException()

        return this.fileService.getFilePath(fileUrl)
    }
}