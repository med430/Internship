import {Role} from "../../../../Domain/enums/role.enum";

export class RegisterCommand {
    constructor(
        public readonly email: string,
        public readonly username: string,
        public readonly password: string,
        public readonly name: string,
        public readonly lastname: string,
        public readonly role: Role,
        public readonly company?: string
) {}
}