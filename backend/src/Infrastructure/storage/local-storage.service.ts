// local-file-storage.service.ts (Infrastructure)

import { Injectable } from '@nestjs/common'
import { existsSync, unlinkSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService'

@Injectable()
export class LocalFileStorageService extends FileStorageService {

    async upload(
        file: Express.Multer.File,
        folder: 'cvs' | 'letters'
    ): Promise<string> {
        if (!file?.buffer) throw new Error('Invalid file')

        const uploadDir = join(process.cwd(), 'uploads', folder)
        await mkdir(uploadDir, { recursive: true })

        const safeName =
            file.originalname?.replace(/[^a-zA-Z0-9._-]/g, '_') ||
            `upload_${Date.now()}.pdf`
        const filename = `${Date.now()}_${safeName}`
        const fullPath = join(uploadDir, filename)

        await writeFile(fullPath, file.buffer)

        return `/uploads/${folder}/${filename}`
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