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
exports.WithdrawApplicationHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const withdraw_application_command_1 = require("../withdraw-application.command");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const application_status_enum_1 = require("../../../../../Domain/enums/application-status.enum");
const application_repository_1 = require("../../../../repositories/application.repository");
let WithdrawApplicationHandler = class WithdrawApplicationHandler {
    appRepo;
    studentRepo;
    constructor(appRepo, studentRepo) {
        this.appRepo = appRepo;
        this.studentRepo = studentRepo;
    }
    async execute(command) {
        const { applicationId, userId } = command;
        const application = await this.appRepo.findById(applicationId);
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const student = await this.studentRepo.findByUserId(userId);
        if (!student) {
            throw new common_1.ForbiddenException('Student not found');
        }
        if (application.studentId !== student.id) {
            throw new common_1.ForbiddenException('Not allowed');
        }
        if (application.status === application_status_enum_1.ApplicationStatus.ACCEPTED ||
            application.status === application_status_enum_1.ApplicationStatus.REJECTED) {
            throw new common_1.BadRequestException('Cannot withdraw finalized application');
        }
        application.status = application_status_enum_1.ApplicationStatus.WITHDRAWN;
        return this.appRepo.save(application);
    }
};
exports.WithdrawApplicationHandler = WithdrawApplicationHandler;
exports.WithdrawApplicationHandler = WithdrawApplicationHandler = __decorate([
    (0, cqrs_1.CommandHandler)(withdraw_application_command_1.WithdrawApplicationCommand),
    __param(0, (0, common_1.Inject)(application_repository_1.IApplicationRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], WithdrawApplicationHandler);
//# sourceMappingURL=withdraw-application.handler.js.map