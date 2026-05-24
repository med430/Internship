"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const FileStorageService_1 = require("../../Application/Services/FileStorageService/FileStorageService");
let LocalFileStorageService = class LocalFileStorageService extends FileStorageService_1.FileStorageService {
    async upload(file, folder) {
        if (!file || !file.filename) {
            throw new Error('Invalid file');
        }
        return `/uploads/${folder}/${file.filename}`;
    }
    async delete(fileUrl) {
        const path = this.getFilePath(fileUrl);
        if (!(0, fs_1.existsSync)(path))
            return;
        try {
            (0, fs_1.unlinkSync)(path);
        }
        catch (error) {
            console.warn('File deletion failed:', error);
        }
    }
};
exports.LocalFileStorageService = LocalFileStorageService;
exports.LocalFileStorageService = LocalFileStorageService = __decorate([
    (0, common_1.Injectable)()
], LocalFileStorageService);
//# sourceMappingURL=local-storage.service.js.map