import { FileStorageService } from 'src/Application/Services/FileStorageService/FileStorageService';
import { LocalFileStorageService } from "./local-storage.service";
export declare const FileStorageProvider: {
    provide: typeof FileStorageService;
    useClass: typeof LocalFileStorageService;
};
