"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageProvider = void 0;
const FileStorageService_1 = require("../../Application/Services/FileStorageService/FileStorageService");
const local_storage_service_1 = require("./local-storage.service");
exports.FileStorageProvider = {
    provide: FileStorageService_1.FileStorageService,
    useClass: local_storage_service_1.LocalFileStorageService
};
//# sourceMappingURL=file-storage.provider.js.map