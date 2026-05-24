export declare abstract class GenericCommandHandler<TCommand, TEntity, TResult> {
    execute(command: TCommand): Promise<TResult>;
    protected validate(command: TCommand): Promise<void>;
    protected beforePersist(entity: TEntity): Promise<void>;
    protected abstract map(command: TCommand): Promise<TEntity>;
    protected abstract persist(entity: TEntity): Promise<TResult>;
    protected afterPersist(result: TResult, command: TCommand): Promise<void>;
}
