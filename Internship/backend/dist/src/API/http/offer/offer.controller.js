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
exports.OfferController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const current_user_decorator_1 = require("../decorators/current-user.decorator");
const create_offer_dto_1 = require("./dto/create-offer.dto");
const update_offer_dto_1 = require("./dto/update-offer.dto");
const create_offer_command_1 = require("../../../Application/Features/OfferFeature/Commands/create-offer.command");
const update_offer_command_1 = require("../../../Application/Features/OfferFeature/Commands/update-offer.command");
const delete_offer_command_1 = require("../../../Application/Features/OfferFeature/Commands/delete-offer.command");
let OfferController = class OfferController {
    bus;
    constructor(bus) {
        this.bus = bus;
    }
    create(dto, user) {
        return this.bus.execute(new create_offer_command_1.CreateOfferCommand(user.id, dto.title, dto.description, dto.company, dto.location, dto.domain, dto.isPaid, dto.workMode, new Date(dto.startDate), new Date(dto.endDate), dto.type, dto.requiredSkills));
    }
    update(id, dto, user) {
        return this.bus.execute(new update_offer_command_1.UpdateOfferCommand(id, user.id, dto.title, dto.description, dto.company, dto.location, dto.domain, dto.isPaid, dto.workMode, dto.startDate ? new Date(dto.startDate) : undefined, dto.endDate ? new Date(dto.endDate) : undefined, dto.type, dto.requiredSkills));
    }
    delete(id, user) {
        return this.bus.execute(new delete_offer_command_1.DeleteOfferCommand(id, user.id));
    }
};
exports.OfferController = OfferController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_offer_dto_1.CreateOfferDTO, Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_offer_dto_1.UpdateOfferDTO, Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], OfferController.prototype, "delete", null);
exports.OfferController = OfferController = __decorate([
    (0, common_1.Controller)('offers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cqrs_1.CommandBus])
], OfferController);
//# sourceMappingURL=offer.controller.js.map