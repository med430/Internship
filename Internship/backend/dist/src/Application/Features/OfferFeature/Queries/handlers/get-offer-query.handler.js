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
exports.GetOfferQueryHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const get_offer_query_1 = require("../get-offer.query");
const offer_repository_1 = require("../../../../repositories/offer.repository");
const common_1 = require("@nestjs/common");
let GetOfferQueryHandler = class GetOfferQueryHandler {
    offerRepository;
    constructor(offerRepository) {
        this.offerRepository = offerRepository;
    }
    async execute(query) {
        return this.offerRepository.findById(query.id);
    }
};
exports.GetOfferQueryHandler = GetOfferQueryHandler;
exports.GetOfferQueryHandler = GetOfferQueryHandler = __decorate([
    (0, cqrs_1.QueryHandler)(get_offer_query_1.GetOfferQuery),
    __param(0, (0, common_1.Inject)(offer_repository_1.IOfferRepository)),
    __metadata("design:paramtypes", [Object])
], GetOfferQueryHandler);
//# sourceMappingURL=get-offer-query.handler.js.map