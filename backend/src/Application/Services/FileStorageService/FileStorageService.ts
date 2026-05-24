export abstract class FileStorageService {

    abstract upload(
        file: Express.Multer.File,
        folder: 'cvs' | 'letters'
    ): Promise<string>

    abstract delete(fileUrl: string): Promise<void>

    // Returns the URL used to access the file (Cloudinary secure_url)
    getFileUrl(fileUrl: string): string {
        if (!fileUrl) throw new Error('Invalid file URL')
        return fileUrl
    }
}