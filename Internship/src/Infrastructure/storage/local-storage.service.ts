import {FileStorageService} from "../../Application/Services/FileStorageService/FileStorageService";

export class LocalStorageService extends FileStorageService {

    async upload(file: Express.Multer.File): Promise<string> {

        return `/uploads/${file.filename}`
    }
}