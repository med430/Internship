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

    async delete(fileUrl: string): Promise<void> {
        const publicId = this.extractPublicId(fileUrl)
        if (!publicId) return
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
        } catch (error) {
            console.warn('Cloudinary deletion failed:', error)
        }
    }

    // Extract public_id from a Cloudinary secure_url
    // e.g. https://res.cloudinary.com/cloud/raw/upload/v123/stagio/cvs/file.pdf
    //   → stagio/cvs/file
    private extractPublicId(url: string): string | null {
        try {
            const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/)
            return match ? match[1] : null
        } catch {
            return null
        }
    }
}