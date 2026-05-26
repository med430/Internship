import { Role } from '../../../../Domain/enums/role.enum'

export class UpdateUserRoleCommand {
    constructor(
        public readonly userId: string,
        public readonly role: Role,
    ) {}
}
