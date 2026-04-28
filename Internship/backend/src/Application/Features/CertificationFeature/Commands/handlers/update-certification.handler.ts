import { CommandHandler } from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'

import {GenericCommandHandler} from "../../../GenericFeature/Commands/handlers/generic-command.handler";
import {UpdateCertificationCommand} from "../update-certification.command";
import {Certification} from "../../../../../Domain/entities/certification.entity";
import {ICertificationRepository} from "../../../../repositories/certification.repository";

@CommandHandler(UpdateCertificationCommand)
export class UpdateCertificationHandler extends GenericCommandHandler<
    UpdateCertificationCommand,
    Certification,
    Certification
> {
    constructor(
        @Inject(ICertificationRepository)
        private repo: ICertificationRepository
    ) { super() }

    protected async map(cmd: UpdateCertificationCommand) {
        const c = await this.repo.findById(cmd.id)
        if (!c) throw new NotFoundException()

        c.name = cmd.dto.name ?? c.name
        c.organization = cmd.dto.organization ?? c.organization
        c.issueDate = cmd.dto.issueDate ?? c.issueDate
        c.expirationDate = cmd.dto.expirationDate ?? c.expirationDate
        c.credentialId = cmd.dto.credentialId ?? c.credentialId
        c.credentialUrl = cmd.dto.credentialUrl ?? c.credentialUrl

        return c
    }

    protected async persist(entity: Certification) {
        return this.repo.save(entity)
    }
}