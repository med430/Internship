import {CommandHandler, ICommandHandler} from '@nestjs/cqrs'
import {
    Inject,
} from '@nestjs/common'

import {DeleteProjectCommand} from "../delete-project.command";
import {IProjectRepository} from "../../../../repositories/project.repository";

@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler
    implements ICommandHandler<DeleteProjectCommand> {

    constructor(
        @Inject(IProjectRepository)
        private repo: IProjectRepository
    ) {}

    async execute(cmd: DeleteProjectCommand) {
        await this.repo.delete(cmd.id)
        return { message: 'Deleted' }
    }
}