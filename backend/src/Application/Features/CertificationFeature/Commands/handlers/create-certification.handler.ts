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
        private readonly studentRepo: IStudentProfileRepository,

        @Inject(ICertificationRepository)
        private readonly repo: ICertificationRepository
    ) {
        super()
    }

    protected async map(cmd: CreateCertificationCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        return new Certification(
            randomUUID(),
            profile.id,
            cmd.name,
            cmd.organization,
            cmd.issueDate,
            cmd.expirationDate,
            cmd.credentialId,
            cmd.credentialUrl
        )
    }

    protected async persist(entity: Certification) {
        return this.repo.save(entity)
    }

    // bump the parent profile so the embedding worker re-syncs this student
    protected async afterPersist(_result: Certification, cmd: CreateCertificationCommand): Promise<void> {
        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (profile) await this.studentRepo.update(profile)
    }
}