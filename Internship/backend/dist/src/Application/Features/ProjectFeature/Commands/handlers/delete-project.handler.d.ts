import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteProjectCommand } from "../delete-project.command";
import { IProjectRepository } from "../../../../repositories/project.repository";
export declare class DeleteProjectHandler implements ICommandHandler<DeleteProjectCommand> {
    private repo;
    constructor(repo: IProjectRepository);
    execute(cmd: DeleteProjectCommand): Promise<{
        message: string;
    }>;
}
