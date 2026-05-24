import { ICommandHandler } from '@nestjs/cqrs';
import { IOfferRepository } from '../../../../repositories/offer.repository';
import { IRecruiterProfileRepository } from '../../../../repositories/recruiter-profile.repository';
import { IApplicationRepository } from "../../../../repositories/application.repository";
import { DownloadApplicationFileCommand } from "../download-file.command";
import { FileStorageService } from "../../../../Services/FileStorageService/FileStorageService";
import { ICVRepository } from "../../../../repositories/cv.repository";
import { ICoverLetterRepository } from '../../../../repositories/coverletter.repository';
export declare class DownloadApplicationFileHandler implements ICommandHandler<DownloadApplicationFileCommand> {
    private readonly appRepo;
    private readonly offerRepo;
    private readonly recruiterRepo;
    private readonly cvRepo;
    private readonly coverLetterRepo;
    private readonly fileService;
    constructor(appRepo: IApplicationRepository, offerRepo: IOfferRepository, recruiterRepo: IRecruiterProfileRepository, cvRepo: ICVRepository, coverLetterRepo: ICoverLetterRepository, fileService: FileStorageService);
    execute(command: DownloadApplicationFileCommand): Promise<string>;
}
