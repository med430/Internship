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
exports.CreateEducationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const crypto_1 = require("crypto");
const create_education_command_1 = require("../create-education.command");
const education_entity_1 = require("../../../../../Domain/entities/education.entity");
const education_repository_1 = require("../../../../repositories/education.repository");
let CreateEducationHandler = class CreateEducationHandler extends generic_command_handler_1.GenericCommandHandler {
    studentRepo;
    repo;
    constructor(studentRepo, repo) {
        super();
        this.studentRepo = studentRepo;
        this.repo = repo;
    }
    async map(cmd) {
        const profile = await this.studentRepo.findByUserId(cmd.userId);
        if (!profile)
            throw new common_1.NotFoundException('Student profile not found');
        return new education_entity_1.Education((0, crypto_1.randomUUID)(), profile.id, cmd.school, cmd.degree, cmd.field, cmd.startDate, cmd.endDate, cmd.description);
    }
    async persist(entity) {
        return this.repo.save(entity);
    }
};
exports.CreateEducationHandler = CreateEducationHandler;
exports.CreateEducationHandler = CreateEducationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(create_education_command_1.CreateEducationCommand),
    __param(0, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __param(1, (0, common_1.Inject)(education_repository_1.IEducationRepository)),
    __metadata("design:paramtypes", [Object, Object])
], CreateEducationHandler);
//# sourceMappingURL=create-education.handler.js.map