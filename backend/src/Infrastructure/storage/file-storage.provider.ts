// file-storage.provider.ts

import { FileStorageService } from 'src/Application/Services/FileStorageService/FileStorageService'
import {LocalFileStorageService} from "./local-storage.service";

export const FileStorageProvider = {
    provide: FileStorageService,
    useClass: LocalFileStorageService
}