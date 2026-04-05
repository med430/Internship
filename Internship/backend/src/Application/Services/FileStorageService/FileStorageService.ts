export abstract class FileStorageService {
    abstract upload(file: Express.Multer.File): Promise<string>
}