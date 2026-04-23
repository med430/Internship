import { v4 as uuidv4 } from 'uuid'
import { extname } from 'path'
import { Request } from 'express'

// 🔹 Rename file
export const editFileName = (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
): void => {
    const fileExt = extname(file.originalname)
    const randomName = `${uuidv4()}${fileExt}`

    callback(null, randomName)
}

// 🔹 Image filter
export const imageFileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
    if (!/\.(jpg|jpeg|png|gif)$/i.test(file.originalname)) {
        return callback(new Error('Only image files are allowed'), false)
    }

    callback(null, true)
}

// 🔹 PDF filter (CV)
export const pdfFileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
): void => {
    if (!/\.pdf$/i.test(file.originalname)) {
        return callback(new Error('Only PDF files are allowed'), false)
    }

    callback(null, true)
}