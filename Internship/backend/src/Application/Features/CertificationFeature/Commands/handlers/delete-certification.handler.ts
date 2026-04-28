import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    Inject,
    NotFoundException
} from '@nestjs/common'
import {DeleteCertificationCommand} from "../delete-certification.command";
import {ICertificationRepository} from "../../../../repositories/certification.repository";

@CommandHandler(DeleteCertificationCommand)
export class DeleteCertificationHandler
    implements ICommandHandler<DeleteCertificationCommand> {

    constructor(
        @Inject(ICertificationRepository)
        private repo: ICertificationRepository
    ) {}

    async execute(cmd: DeleteCertificationCommand) {
        await this.repo.delete(cmd.id)
        return { message: 'Deleted' }
    }
}