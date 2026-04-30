// Infrastructure/file-storage/file-storage.module.ts
import { Module } from '@nestjs/common'
import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService'
import {LocalFileStorageService} from "./local-storage.service";


@Module({
    providers: [
        {
            provide: FileStorageService,
            useClass: LocalFileStorageService,
        },
    ],
    exports: [FileStorageService],
})
export class FileStorageModule {}