// generic-command.handler.ts
import { ICommandHandler } from '@nestjs/cqrs';

export abstract class GenericCommandHandler<
TCommand,
    TEntity,
    TResult,
> {
  async execute(command: TCommand): Promise<TResult> {
    await this.validate(command);

    const entity = await this.map(command);

    await this.beforePersist(entity);

    const result = await this.persist(entity);

    await this.afterPersist(result, command);

    return result;
  }

protected async validate(command: TCommand): Promise<void> {}

protected async beforePersist(entity: TEntity): Promise<void> {}

protected abstract map(command: TCommand): Promise<TEntity>;

protected abstract persist(entity: TEntity): Promise<TResult>;

protected async afterPersist(result: TResult, command: TCommand): Promise<void> {}
}