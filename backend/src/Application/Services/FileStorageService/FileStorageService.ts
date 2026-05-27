export abstract class FileStorageService {

    abstract upload(
        file: Express.Multer.File,
        folder: 'cvs' | 'letters'
    ): Promise<string>

    abstract uploadBuffer(
        buffer: Buffer,
        folder: 'pdfs',
        filename: string,
    ): Promise<string>

    abstract delete(fileUrl: string): Promise<void>

    abstract downloadFileBuffer(fileUrl: string): Promise<Buffer>

    /** @deprecated use downloadFileBuffer for proxied delivery */
    getSignedDownloadUrl(fileUrl: string): string {
        return fileUrl
    }

    getFileUrl(fileUrl: string): string {
        if (!fileUrl) throw new Error('Invalid file URL')
        return fileUrl
    }
}