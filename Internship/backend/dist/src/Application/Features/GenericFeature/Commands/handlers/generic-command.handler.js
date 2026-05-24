"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericCommandHandler = void 0;
class GenericCommandHandler {
    async execute(command) {
        await this.validate(command);
        const entity = await this.map(command);
        await this.beforePersist(entity);
        const result = await this.persist(entity);
        await this.afterPersist(result, command);
        return result;
    }
    async validate(command) { }
    async beforePersist(entity) { }
    async afterPersist(result, command) { }
}
exports.GenericCommandHandler = GenericCommandHandler;
//# sourceMappingURL=generic-command.handler.js.map