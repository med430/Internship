import { FileStorageService } from '../../Application/Services/FileStorageService/FileStorageService';
export declare class LocalFileStorageService extends FileStorageService {
    upload(file: Express.Multer.File, folder: 'cvs' | 'letters'): Promise<string>;
    delete(fileUrl: string): Promise<void>;
}
