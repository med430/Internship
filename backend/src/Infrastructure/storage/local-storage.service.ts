// local-file-storage.service.ts (Infrastructure)

import { Injectable } from '@nestjs/common'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService'

@Injectable()
export class LocalFileStorageService extends FileStorageService {

    async upload(
        file: Express.Multer.File,
        folder: 'cvs' | 'letters'
    ): Promise<string> {
        if (!file || !file.filename) throw new Error('Invalid file')
        return `/uploads/${folder}/${file.filename}`
    }

    async uploadBuffer(_buffer: Buffer, _folder: 'pdfs', _filename: string): Promise<string> {
        throw new Error('uploadBuffer not supported in local storage')
    }

    async downloadFileBuffer(fileUrl: string): Promise<Buffer> {
        const { readFileSync } = await import('fs')
        const { join } = await import('path')
        const path = join(process.cwd(), fileUrl)
        return readFileSync(path)
    }

    async delete(fileUrl: string): Promise<void> {
        if (!fileUrl?.startsWith('/uploads/')) return
        const path = join(process.cwd(), fileUrl)
        if (!existsSync(path)) return
        try {
            unlinkSync(path)
        } catch (error) {
            console.warn('File deletion failed:', error)
        }
    }
}