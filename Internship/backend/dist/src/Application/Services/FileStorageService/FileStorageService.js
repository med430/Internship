"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageService = void 0;
const path_1 = require("path");
class FileStorageService {
    basePath = process.cwd();
    getFilePath(fileUrl) {
        if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
            throw new Error('Invalid file path');
        }
        return (0, path_1.join)(this.basePath, fileUrl);
    }
}
exports.FileStorageService = FileStorageService;
//# sourceMappingURL=FileStorageService.js.map