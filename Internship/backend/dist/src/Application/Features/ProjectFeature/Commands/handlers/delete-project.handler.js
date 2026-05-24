"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProjectHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_project_command_1 = require("../delete-project.command");
const project_repository_1 = require("../../../../repositories/project.repository");
let DeleteProjectHandler = class DeleteProjectHandler {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(cmd) {
        await this.repo.delete(cmd.id);
        return { message: 'Deleted' };
    }
};
exports.DeleteProjectHandler = DeleteProjectHandler;
exports.DeleteProjectHandler = DeleteProjectHandler = __decorate([
    (0, cqrs_1.CommandHandler)(delete_project_command_1.DeleteProjectCommand),
    __param(0, (0, common_1.Inject)(project_repository_1.IProjectRepository)),
    __metadata("design:paramtypes", [Object])
], DeleteProjectHandler);
//# sourceMappingURL=delete-project.handler.js.map