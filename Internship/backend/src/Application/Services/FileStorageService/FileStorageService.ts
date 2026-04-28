// file-storage.service.ts (Application layer)

import { join } from 'path'

export abstract class FileStorageService {

    protected basePath = process.cwd()

    abstract upload(
        file: Express.Multer.File,
        folder: 'cvs' | 'letters'
    ): Promise<string>

    abstract delete(fileUrl: string): Promise<void>

    // 🔥 logique commune + sécurité
    getFilePath(fileUrl: string): string {

        if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
            throw new Error('Invalid file path')
        }

        return join(this.basePath, fileUrl)
    }
}