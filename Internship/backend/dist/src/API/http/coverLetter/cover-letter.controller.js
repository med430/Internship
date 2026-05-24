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
exports.CoverLetterController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const upload_cover_letter_command_1 = require("../../../Application/Features/CoverLetterFeature/Commands/upload-cover-letter.command");
const delete_cover_letter_command_1 = require("../../../Application/Features/CoverLetterFeature/Commands/delete-cover-letter.command");
let CoverLetterController = class CoverLetterController {
    commandBus;
    constructor(commandBus) {
        this.commandBus = commandBus;
    }
    async upload(file, user) {
        if (!file)
            throw new common_1.BadRequestException('Letter required');
        return this.commandBus.execute(new upload_cover_letter_command_1.UploadCoverLetterCommand(user.id, file));
    }
    delete(id, user) {
        return this.commandBus.execute(new delete_cover_letter_command_1.DeleteCoverLetterCommand(user.id, id));
    }
};
exports.CoverLetterController = CoverLetterController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('letter', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/letters',
            filename: (_, __, cb) => cb(null, `${(0, crypto_1.randomUUID)()}.pdf`)
        }),
        limits: { fileSize: 2 * 1024 * 1024 },
        fileFilter: (_, file, cb) => {
            if (file.mimetype !== 'application/pdf') {
                return cb(new common_1.BadRequestException('Only PDF allowed'), false);
            }
            cb(null, true);
        }
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CoverLetterController.prototype, "upload", null);
__decorate([
    (0, common_1.Patch)(':id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CoverLetterController.prototype, "delete", null);
exports.CoverLetterController = CoverLetterController = __decorate([
    (0, common_1.Controller)('cover-letters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], CoverLetterController);
//# sourceMappingURL=cover-letter.controller.js.map