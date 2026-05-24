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
exports.OfferResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const get_offer_query_1 = require("../../../Application/Features/OfferFeature/Queries/get-offer.query");
const cqrs_1 = require("@nestjs/cqrs");
const get_offers_query_1 = require("../../../Application/Features/OfferFeature/Queries/get-offers.query");
let OfferResolver = class OfferResolver {
    queryBus;
    constructor(queryBus) {
        this.queryBus = queryBus;
    }
    async getOffer(id) {
        return this.queryBus.execute(new get_offer_query_1.GetOfferQuery(id));
    }
    async getOffers(pageNumber, pageSize) {
        return this.queryBus.execute(new get_offers_query_1.GetOffersQuery(pageNumber, pageSize));
    }
};
exports.OfferResolver = OfferResolver;
__decorate([
    (0, graphql_1.Query)('offer'),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OfferResolver.prototype, "getOffer", null);
__decorate([
    (0, graphql_1.Query)('offers'),
    __param(0, (0, graphql_1.Args)('pageNumber')),
    __param(1, (0, graphql_1.Args)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], OfferResolver.prototype, "getOffers", null);
exports.OfferResolver = OfferResolver = __decorate([
    (0, graphql_1.Resolver)('Offer'),
    __metadata("design:paramtypes", [cqrs_1.QueryBus])
], OfferResolver);
//# sourceMappingURL=offer.resolver.js.map