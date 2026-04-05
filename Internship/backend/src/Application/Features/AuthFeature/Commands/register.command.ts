import {Role} from "../../../../Domain/enums/role.enum";

export class RegisterCommand {
    constructor(
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly username: string,
        public readonly email: string,
        public readonly password: string,
        public readonly role: Role
    ) {
    }
}