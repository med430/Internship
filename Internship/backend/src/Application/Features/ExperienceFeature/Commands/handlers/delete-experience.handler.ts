import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    Inject,
} from '@nestjs/common'
import {IExperienceRepository} from "../../../../repositories/experience.repository";

import {DeleteExperienceCommand} from "../delete-experience.command";


@CommandHandler(DeleteExperienceCommand)

export class DeleteExperienceHandler
    implements ICommandHandler<DeleteExperienceCommand> {

    constructor(
        @Inject(IExperienceRepository)
        private repo: IExperienceRepository
    ) {}

    async execute(cmd: DeleteExperienceCommand) {
        await this.repo.delete(cmd.id)
        return { message: 'Deleted' }
    }
}