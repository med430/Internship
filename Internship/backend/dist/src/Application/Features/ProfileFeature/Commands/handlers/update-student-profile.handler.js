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
exports.UpdateStudentProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_student_profile_command_1 = require("../update-student-profile.command");
const user_repository_1 = require("../../../../repositories/user.repository");
const student_profile_repository_1 = require("../../../../repositories/student-profile.repository");
const generic_command_handler_1 = require("../../../GenericFeature/Commands/handlers/generic-command.handler");
const profile_response_dto_1 = require("../../../../../API/http/profile/dto/profile-response.dto");
let UpdateStudentProfileHandler = class UpdateStudentProfileHandler extends generic_command_handler_1.GenericCommandHandler {
    userRepo;
    studentProfileRepo;
    constructor(userRepo, studentProfileRepo) {
        super();
        this.userRepo = userRepo;
        this.studentProfileRepo = studentProfileRepo;
    }
    async map(command) {
        const user = await this.userRepo.findById(command.userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const profile = await this.studentProfileRepo.findByUserId(command.userId);
        if (!profile)
            throw new common_1.NotFoundException('Student profile not found');
        user.name = command.name ?? user.name;
        user.lastname = command.lastname ?? user.lastname;
        user.username = command.username ?? user.username;
        user.phone = command.phone ?? user.phone;
        user.avatarUrl = command.avatarUrl ?? user.avatarUrl;
        profile.bio = command.bio ?? profile.bio;
        profile.birthDate = command.birthDate
            ? new Date(command.birthDate)
            : profile.birthDate;
        profile.gender = command.gender ?? profile.gender;
        profile.address = command.address ?? profile.address;
        profile.city = command.city ?? profile.city;
        await this.studentProfileRepo.update(profile);
        return { user };
    }
    async persist(ctx) {
        const savedUser = await this.userRepo.update(ctx.user);
        return new profile_response_dto_1.ProfileResponseDTO(savedUser.id, savedUser.email, savedUser.username, savedUser.name, savedUser.lastname, savedUser.role, savedUser.phone, savedUser.avatarUrl);
    }
};
exports.UpdateStudentProfileHandler = UpdateStudentProfileHandler;
exports.UpdateStudentProfileHandler = UpdateStudentProfileHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_student_profile_command_1.UpdateStudentProfileCommand),
    __param(0, (0, common_1.Inject)(user_repository_1.IUserRepository)),
    __param(1, (0, common_1.Inject)(student_profile_repository_1.IStudentProfileRepository)),
    __metadata("design:paramtypes", [Object, Object])
], UpdateStudentProfileHandler);
//# sourceMappingURL=update-student-profile.handler.js.map