import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import { IStudentProfileRepository } from "../../../../repositories/student-profile.repository"

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {randomUUID} from "crypto";
import {CreateCertificationCommand} from "../create-certification.command";
import {Certification} from "../../../../../Domain/entities/certification.entity";
import {ICertificationRepository} from "../../../../repositories/certification.repository";

@CommandHandler(CreateCertificationCommand)
export class CreateCertificationHandler extends GenericCommandHandler<
    CreateCertificationCommand,
    Certification,
    Certification
> {
    constructor(
        @Inject(IStudentProfileRepository)
        private studentRepo: IStudentProfileRepository,

        @Inject(ICertificationRepository)
        private repo: ICertificationRepository
    ) { super() }

    protected async map(cmd: CreateCertificationCommand) {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException()

        return new Certification(
            randomUUID(),
            profile.id,
            cmd.dto.name,
            cmd.dto.organization,
            cmd.dto.issueDate,
            cmd.dto.expirationDate,
            cmd.dto.credentialId,
            cmd.dto.credentialUrl
        )
    }

    protected async persist(entity: Certification) {
        return this.repo.save(entity)
    }
}