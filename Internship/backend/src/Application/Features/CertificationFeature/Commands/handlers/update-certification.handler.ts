import { CommandHandler } from '@nestjs/cqrs'
import {
    ForbiddenException,
    Inject,
    NotFoundException
} from '@nestjs/common'

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {UpdateCertificationCommand} from "../update-certification.command";
import {Certification} from "../../../../../Domain/entities/certification.entity";
import {ICertificationRepository} from "../../../../repositories/certification.repository";
import {IStudentProfileRepository} from "../../../../repositories/student-profile.repository";
@CommandHandler(UpdateCertificationCommand)
export class UpdateCertificationHandler extends GenericCommandHandler<
    UpdateCertificationCommand,
    Certification,
    Certification
> {
    constructor(
        @Inject(ICertificationRepository)
        private readonly repo: ICertificationRepository,

        @Inject(IStudentProfileRepository)
        private readonly studentRepo: IStudentProfileRepository
    ) {
        super()
    }

    protected async map(cmd: UpdateCertificationCommand) {

        const profile = await this.studentRepo.findByUserId(cmd.userId)
        if (!profile) throw new NotFoundException('Student profile not found')

        const c = await this.repo.findById(cmd.id)
        if (!c) throw new NotFoundException('Certification not found')

        // 🔐 ownership check
        if (c.studentProfileId !== profile.id) {
            throw new ForbiddenException()
        }

        c.name = cmd.name ?? c.name
        c.organization = cmd.organization ?? c.organization
        c.issueDate = cmd.issueDate ?? c.issueDate
        c.expirationDate = cmd.expirationDate ?? c.expirationDate
        c.credentialId = cmd.credentialId ?? c.credentialId
        c.credentialUrl = cmd.credentialUrl ?? c.credentialUrl

        return c
    }

    protected async persist(entity: Certification) {
        return this.repo.save(entity)
    }
}