import type { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
export declare class ApplicationController {
    private readonly commandBus;
    constructor(commandBus: CommandBus);
    apply(dto: {
        offerId: string;
        cvId: string;
        coverLetterId?: string;
    }, user: any): Promise<any>;
    accept(id: string, user: any): Promise<any>;
    reject(id: string, user: any): Promise<any>;
    downloadCV(id: string, user: any, res: Response): Promise<void>;
    downloadCoverLetter(id: string, user: any, res: Response): Promise<void>;
    withdraw(id: string, user: any): Promise<any>;
}
