import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Inject, NotFoundException } from '@nestjs/common'
import { UploadAvatarCommand } from '../upload-avatar.command'
import { IUserRepository } from '../../../../repositories/user.repository'
import { FileStorageService } from '../../../../Services/FileStorageService/FileStorageService'

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarHandler implements ICommandHandler<UploadAvatarCommand> {

    constructor(
        @Inject(IUserRepository)
        private readonly userRepo: IUserRepository,

        @Inject(FileStorageService)
        private readonly fileService: FileStorageService,
    ) {}

    async execute(command: UploadAvatarCommand): Promise<{ avatarUrl: string }> {
        const user = await this.userRepo.findById(command.userId)
        if (!user) throw new NotFoundException('User not found')

        const avatarUrl = await this.fileService.uploadImage(command.file, 'avatars')

        user.avatarUrl = avatarUrl
        await this.userRepo.update(user)

        return { avatarUrl }
    }
}
