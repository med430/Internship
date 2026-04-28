import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    Inject,
} from '@nestjs/common'
import {DeleteEducationCommand} from "../delete-education.command";
import {IEducationRepository} from "../../../../repositories/education.repository";


@CommandHandler(DeleteEducationCommand)
export class DeleteEducationHandler
    implements ICommandHandler<DeleteEducationCommand> {

    constructor(
        @Inject(IEducationRepository)
        private repo: IEducationRepository
    ) {}

    async execute(cmd: DeleteEducationCommand) {
        await this.repo.delete(cmd.id)
        return { message: 'Deleted' }
    }
}