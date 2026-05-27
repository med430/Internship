import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationDocument, ConversationSchema } from './schemas/conversation.schema';
import { MessageDocument, MessageSchema } from './schemas/message.schema';
import { MongoConversationRepository } from './repositories/mongo-conversation.repository';
import { MongoMessageRepository } from './repositories/mongo-message.repository';
import { IConversationRepository } from '../../Application/repositories/conversation.repository';
import { IMessageRepository } from '../../Application/repositories/message.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConversationDocument.name, schema: ConversationSchema },
            { name: MessageDocument.name, schema: MessageSchema },
        ]),
    ],
    providers: [
        { provide: IConversationRepository, useClass: MongoConversationRepository },
        { provide: IMessageRepository, useClass: MongoMessageRepository },
    ],
    exports: [IConversationRepository, IMessageRepository],
})
export class ChatPersistenceModule {}
