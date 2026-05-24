import { CommandBus } from '@nestjs/cqrs';
export declare class CoverLetterController {
    private readonly commandBus;
    constructor(commandBus: CommandBus);
    upload(file: Express.Multer.File, user: any): Promise<any>;
    delete(id: string, user: any): Promise<any>;
}
