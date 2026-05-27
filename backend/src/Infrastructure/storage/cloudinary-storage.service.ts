import { Injectable } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService'

@Injectable()
export class CloudinaryStorageService extends FileStorageService {

    constructor() {
        super()
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    async upload(
        file: Express.Multer.File,
        folder: 'cvs' | 'letters'
    ): Promise<string> {
        if (!file?.buffer) throw new Error('Invalid file: buffer missing')

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `stagio/${folder}`,
                    resource_type: 'raw',
                    type: 'private',
                    format: 'pdf',
                },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error('Upload failed'))
                    resolve(result.secure_url)
                }
            )
            stream.end(file.buffer)
        })
    }

    async uploadBuffer(buffer: Buffer, folder: 'pdfs', filename: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `stagio/${folder}`,
                    resource_type: 'raw',
                    type: 'private',
                    format: 'pdf',
                    public_id: filename.replace(/\.pdf$/i, ''),
                },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error('Upload failed'))
                    console.log('[Cloudinary] uploadBuffer result:', {
                        public_id: result.public_id,
                        type: result.type,
                        resource_type: result.resource_type,
                        secure_url: result.secure_url,
                    })
                    resolve(result.secure_url)
                }
            )
            stream.end(buffer)
        })
    }

    async downloadFileBuffer(fileUrl: string): Promise<Buffer> {
        // Legacy files uploaded before Cloudinary migration have local paths
        if (fileUrl.startsWith('/uploads/')) {
            const { readFileSync } = await import('fs')
            const { join } = await import('path')
            return readFileSync(join(process.cwd(), fileUrl))
        }

        const extracted = this.extractFromUrl(fileUrl)
        if (!extracted) throw new Error('Invalid Cloudinary URL')

        const { publicId, type } = extracted

        // For raw resources the extension is baked into the public_id (e.g. filename.pdf).
        // Pass '' as format so private_download_url looks up the exact stored public_id.
        const downloadUrl = cloudinary.utils.private_download_url(publicId, '', {
            resource_type: 'raw',
            type,
            expires_at: Math.floor(Date.now() / 1000) + 600,
        })

        const response = await fetch(downloadUrl)
        if (!response.ok) {
            const body = await response.text().catch(() => '')
            throw new Error(`Cloudinary download failed: ${response.status} — ${body.slice(0, 200)}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        return Buffer.from(arrayBuffer)
    }

    async delete(fileUrl: string): Promise<void> {
        const extracted = this.extractFromUrl(fileUrl)
        if (!extracted) return
        try {
            await cloudinary.uploader.destroy(extracted.publicId, {
                resource_type: 'raw',
                type: extracted.type,
            })
        } catch (error) {
            console.warn('Cloudinary deletion failed:', error)
        }
    }

    // Extracts type, optional version, and public_id from a Cloudinary secure_url.
    //
    // Cloudinary embeds a signature fragment and version in private/authenticated URLs:
    //   https://res.cloudinary.com/cloud/raw/private/s--SIG--/v1234/folder/file.pdf
    //   → { type: 'private', publicId: 'folder/file.pdf' }
    //
    // For raw resources the format (.pdf) is part of the public_id, so we keep it.
    private extractFromUrl(url: string): { publicId: string; type: string } | null {
        try {
            // Skip optional signature (s--…--/) and optional version (v\d+/) fragments,
            // then capture the rest as the public_id (including any file extension).
            const match = url.match(/\/(upload|private)\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+)$/)
            if (!match) return null
            return { type: match[1], publicId: match[2] }
        } catch {
            return null
        }
    }
}
