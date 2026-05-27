import { Module } from '@nestjs/common'
import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService'
import { CloudinaryStorageService } from './cloudinary-storage.service'
import { LocalFileStorageService } from './local-storage.service'

@Module({
    providers: [
        {
            provide: FileStorageService,
            useClass:
                process.env.CLOUDINARY_CLOUD_NAME &&
                process.env.CLOUDINARY_API_KEY &&
                process.env.CLOUDINARY_API_SECRET
                    ? CloudinaryStorageService
                    : LocalFileStorageService,
        },
    ],
    exports: [FileStorageService],
})
export class FileStorageModule {}