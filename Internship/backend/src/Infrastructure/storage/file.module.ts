// file.module.ts
import { Module } from '@nestjs/common'
import {FileStorageProvider} from "./file-storage.provider";

@Module({
    providers: [FileStorageProvider],
    exports: [FileStorageProvider],
})
export class FileModule {}