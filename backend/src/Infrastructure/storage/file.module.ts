import { Module } from '@nestjs/common'
import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService'
import { CloudinaryStorageService } from './cloudinary-storage.service'

@Module({
    providers: [
        {
            provide: FileStorageService,
            useClass: CloudinaryStorageService,
        },
    ],
    exports: [FileStorageService],
})
export class FileStorageModule {}